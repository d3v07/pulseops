import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import { graphqlClient, queries } from '../../lib/graphql';
import { parseTopBarFilters } from '../../lib/filters';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../stores/uiStore';
import { downloadCsv } from '../../lib/export';
import { cn } from '../../lib/utils';

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export function AlertsView() {
  const { orgId, projectId } = useProjectStore();
  const { exportIntent, clearExportIntent, addNotification, dateRangeDays, topBarFilters } = useUIStore();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const appliedFilters = useMemo(() => parseTopBarFilters(topBarFilters), [topBarFilters]);

  const endDate = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), Math.max(1, dateRangeDays) - 1), 'yyyy-MM-dd');

  const { data: dauSeries } = useQuery({
    queryKey: ['dau', orgId, projectId, startDate, endDate, topBarFilters.join('|')],
    queryFn: async () => {
      const response: any = await graphqlClient.request(queries.GET_DAU, {
        orgId,
        projectId,
        startDate,
        endDate,
        filters: appliedFilters,
      });
      return response.dailyActiveUsers;
    },
    enabled: !!orgId && !!projectId,
    staleTime: 30000,
  });

  const { data: eventSeries } = useQuery({
    queryKey: ['event-series', orgId, projectId, startDate, endDate, topBarFilters.join('|')],
    queryFn: async () => {
      const response: any = await graphqlClient.request(queries.GET_EVENT_SERIES, {
        orgId,
        projectId,
        startDate,
        endDate,
        eventName: null,
        filters: appliedFilters,
      });
      return response.eventCountsOverTime;
    },
    enabled: !!orgId && !!projectId,
    staleTime: 30000,
  });

  const { data: recentEvents } = useQuery({
    queryKey: ['recent-events', orgId, projectId, topBarFilters.join('|')],
    queryFn: async () => {
      const response: any = await graphqlClient.request(queries.GET_RECENT_EVENTS, {
        orgId,
        projectId,
        limit: 5,
        filters: appliedFilters,
      });
      return response.recentEvents;
    },
    enabled: !!orgId && !!projectId,
    staleTime: 15000,
  });

  const alerts = useMemo(() => {
    const dauValues = (dauSeries || []).map((point: any) => point.value);
    const eventValues = (eventSeries || []).map((point: any) => point.value);

    const recentDau = dauValues.slice(-7);
    const priorDau = dauValues.slice(-14, -7);
    const recentDauAvg = average(recentDau);
    const priorDauAvg = average(priorDau);
    const dauDelta = priorDauAvg ? ((recentDauAvg - priorDauAvg) / priorDauAvg) * 100 : 0;

    const recentEvents = eventValues.slice(-7);
    const priorEvents = eventValues.slice(-14, -7);
    const recentEventsAvg = average(recentEvents);
    const priorEventsAvg = average(priorEvents);
    const eventDelta = priorEventsAvg ? ((recentEventsAvg - priorEventsAvg) / priorEventsAvg) * 100 : 0;

    return [
      {
        id: 'alert-dau',
        title: dauDelta < -6 ? 'Daily active users trending down' : 'Daily active users stable',
        detail: dauDelta < -6 ? `down ${Math.abs(dauDelta).toFixed(1)}% WoW` : `up ${dauDelta.toFixed(1)}% WoW`,
        severity: dauDelta < -6 ? 'high' : 'low',
      },
      {
        id: 'alert-events',
        title: eventDelta < -8 ? 'Event volume softened' : 'Event throughput healthy',
        detail: eventDelta < -8 ? `down ${Math.abs(eventDelta).toFixed(1)}% WoW` : `up ${eventDelta.toFixed(1)}% WoW`,
        severity: eventDelta < -8 ? 'medium' : 'low',
      },
    ];
  }, [dauSeries, eventSeries]);

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.id));

  useEffect(() => {
    if (!exportIntent || exportIntent.view !== 'alerts') return;
    const rows = alerts.map((alert) => ({
      title: alert.title,
      detail: alert.detail,
      severity: alert.severity,
    }));
    downloadCsv('pulseops-alerts', rows);
    addNotification({
      type: 'success',
      title: 'Alerts exported',
      message: 'Alert queue downloaded as CSV.',
    });
    clearExportIntent();
  }, [exportIntent, alerts, clearExportIntent, addNotification]);

  const acknowledge = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">Alerts</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Risk monitor</h2>
          <p className="mt-2 text-sm text-muted">Signals derived from DAU and event throughput in the last 30 days.</p>
        </div>
        <span className="pill">
          <Calendar size={12} />
          30d
        </span>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="panel p-6">
          <div className="panel-header">
            <div>
              <p className="kicker">Queue</p>
              <h3 className="text-base font-semibold text-ink">Open alerts</h3>
            </div>
            <AlertTriangle size={18} className="text-soft" />
          </div>

          <div className="mt-5 space-y-3">
            {visibleAlerts.length === 0 ? (
              <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-4 py-4 text-sm text-muted">
                No active alerts. Everything is tracking within thresholds.
              </div>
            ) : (
              visibleAlerts.map((alert) => (
                <div key={alert.id} className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{alert.title}</p>
                      <p className="text-xs text-soft">{alert.detail}</p>
                    </div>
                    <span className={cn(
                      'pill text-[10px] uppercase tracking-widest',
                      alert.severity === 'high' && 'border-[color:var(--warning)]/40 text-[color:var(--warning)]',
                      alert.severity === 'medium' && 'border-[color:var(--info)]/40 text-[color:var(--info)]',
                      alert.severity === 'low' && 'border-[color:var(--success)]/40 text-[color:var(--success)]'
                    )}>
                      {alert.severity}
                    </span>
                  </div>
                  <button
                    onClick={() => acknowledge(alert.id)}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-[color:var(--ink-900)]"
                  >
                    <CheckCircle2 size={14} />
                    Acknowledge
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="panel-header">
            <div>
              <p className="kicker">Context</p>
              <h3 className="text-base font-semibold text-ink">Latest activity</h3>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {(recentEvents || []).length === 0 ? (
              <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-4 py-4 text-sm text-muted">
                No recent events yet.
              </div>
            ) : (
              recentEvents.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2 text-sm text-muted">
                  <span className="truncate">{event.eventName}</span>
                  <span className="text-xs text-soft">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
