import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import {
  Activity, Users, Timer,
  BarChart3, TrendingUp, Calendar, ArrowUpRight,
  SignalHigh, ChevronRight
} from 'lucide-react';
import { ChartWidget } from './widgets/ChartWidget';
import { MetricCardSkeleton, ChartSkeleton } from './animations/Shimmer';
import { ErrorState } from './delight/empty-states';
import { graphqlClient, queries } from '../lib/graphql';
import { parseTopBarFilters } from '../lib/filters';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../stores/uiStore';
import { AnimatedNumber, AnimatedPercentage } from './animations/AnimatedNumber';
import { PulseRing } from './animations/PulseRing';
import { cn } from '../lib/utils';
import { downloadCsv } from '../lib/export';

const templates = [
  'Executive',
  'Growth',
  'Activation',
  'Retention',
  'Infrastructure',
];

const eventFilters = [
  'All events',
  'page_view',
  'signup',
  'purchase',
  'form_submit',
];

const formatRelative = (timestamp: string) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.max(1, Math.floor(diff / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export function Dashboard() {
  const { orgId, projectId } = useProjectStore();
  const { liveMode, setActiveView, exportIntent, clearExportIntent, addNotification, dateRangeDays, topBarFilters } = useUIStore();
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);
  const [activeFilter, setActiveFilter] = useState(eventFilters[0]);

  const appliedFilters = useMemo(() => parseTopBarFilters(topBarFilters), [topBarFilters]);

  const endDate = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), Math.max(1, dateRangeDays) - 1), 'yyyy-MM-dd');

  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics', orgId, projectId, startDate, endDate, topBarFilters.join('|')],
    queryFn: async () => {
      const response: any = await graphqlClient.request(queries.GET_METRICS, {
        orgId,
        projectId,
        startDate,
        endDate,
        filters: appliedFilters,
      });
      return response.metrics;
    },
    enabled: !!orgId && !!projectId,
    refetchInterval: liveMode ? 30000 : false,
    staleTime: 30000,
  });

  const { data: eventSeries } = useQuery({
    queryKey: ['event-series', orgId, projectId, startDate, endDate, activeFilter, topBarFilters.join('|')],
    queryFn: async () => {
      const response: any = await graphqlClient.request(queries.GET_EVENT_SERIES, {
        orgId,
        projectId,
        startDate,
        endDate,
        eventName: activeFilter === 'All events' ? null : activeFilter,
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
        limit: 6,
        filters: appliedFilters,
      });
      return response.recentEvents;
    },
    enabled: !!orgId && !!projectId,
    refetchInterval: liveMode ? 15000 : false,
    staleTime: 15000,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!exportIntent || exportIntent.view !== 'dashboard') return;
    const rows = [
      { metric: 'total_events', value: data?.totalEvents ?? 0 },
      { metric: 'daily_active_users', value: data?.dailyActiveUsers?.at(-1)?.value ?? 0 },
    ];
    downloadCsv('pulseops-dashboard', rows);
    addNotification({
      type: 'success',
      title: 'Dashboard exported',
      message: 'Key metrics downloaded as CSV.',
    });
    clearExportIntent();
  }, [exportIntent, data, clearExportIntent, addNotification]);

  if (error) {
    const errorType = (error as Error).message?.includes('network') ? 'network'
      : (error as Error).message?.includes('timeout') ? 'timeout'
      : 'server';

    return (
      <ErrorState
        type={errorType}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['metrics'] })}
        details={(error as Error).message}
      />
    );
  }

  const totalEvents = data?.totalEvents ?? 0;
  const dauSeries = data?.dailyActiveUsers ?? [];
  const currentDAU = dauSeries.length ? dauSeries[dauSeries.length - 1].value : 0;
  const topEvents = data?.topEvents ?? [];

  const momentumData = useMemo(() => (
    dauSeries.map((point) => ({
      name: format(new Date(point.date), 'MMM d'),
      users: point.value,
    }))
  ), [dauSeries]);

  const eventMixData = useMemo(() => (
    topEvents.map((event) => ({
      name: event.eventName,
      value: event.count,
    }))
  ), [topEvents]);

  const filteredEvents = useMemo(() => {
    if (!recentEvents) return [];
    if (activeFilter === 'All events') return recentEvents;
    return recentEvents.filter((event: any) => event.eventName === activeFilter);
  }, [recentEvents, activeFilter]);

  const eventShare = useMemo(() => {
    const total = eventMixData.reduce((sum, event) => sum + event.value, 0) || 1;
    return eventMixData.slice(0, 4).map((event) => ({
      id: event.name,
      label: event.name,
      share: Math.round((event.value / total) * 100),
      change: event.value > 0 ? (event.value / total) * 10 : 0,
    }));
  }, [eventMixData]);

  const seriesValues = (eventSeries ?? []).map((point: any) => point.value);
  const recentSeries = seriesValues.slice(-7);
  const priorSeries = seriesValues.slice(-14, -7);
  const recentSeriesAvg = average(recentSeries);
  const priorSeriesAvg = average(priorSeries);
  const seriesDelta = priorSeriesAvg ? ((recentSeriesAvg - priorSeriesAvg) / priorSeriesAvg) * 100 : 0;
  const lastEventVolume = seriesValues.length ? seriesValues[seriesValues.length - 1] : 0;
  const avgEventVolume = average(seriesValues);
  const velocityChange = avgEventVolume ? ((lastEventVolume - avgEventVolume) / avgEventVolume) * 100 : 0;

  const recentDau = dauSeries.slice(-7).map((point) => point.value);
  const priorDau = dauSeries.slice(-14, -7).map((point) => point.value);
  const recentDauAvg = average(recentDau);
  const priorDauAvg = average(priorDau);
  const dauDelta = priorDauAvg ? ((recentDauAvg - priorDauAvg) / priorDauAvg) * 100 : 0;

  const topEvent = topEvents.length ? topEvents[0] : null;

  const alertQueue = [
    {
      id: 'alert-1',
      title: seriesDelta < -8 ? 'Event volume sliding' : 'Event volume stable',
      detail: seriesDelta < -8 ? `down ${Math.abs(seriesDelta).toFixed(1)}% vs prior week` : `up ${seriesDelta.toFixed(1)}% vs prior week`,
      severity: seriesDelta < -8 ? 'high' : 'low',
    },
    {
      id: 'alert-2',
      title: dauDelta < -5 ? 'Engagement cooling' : 'Engagement resilient',
      detail: dauDelta < -5 ? `DAU down ${Math.abs(dauDelta).toFixed(1)}% WoW` : `DAU up ${dauDelta.toFixed(1)}% WoW`,
      severity: dauDelta < -5 ? 'medium' : 'low',
    },
  ];

  const signalCards = [
    {
      id: 'signal-events',
      title: 'Events (30d)',
      value: totalEvents,
      change: seriesDelta,
      icon: Activity,
      format: (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString(),
    },
    {
      id: 'signal-users',
      title: 'Daily Active Users',
      value: currentDAU,
      change: dauDelta,
      icon: Users,
    },
    {
      id: 'signal-top-event',
      title: topEvent ? `Top: ${topEvent.eventName}` : 'Top Event',
      value: topEvent?.count ?? 0,
      change: topEvent?.trend ?? 0,
      icon: BarChart3,
    },
    {
      id: 'signal-velocity',
      title: 'Event Velocity',
      value: lastEventVolume,
      change: velocityChange || 0,
      icon: Timer,
      format: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString(),
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      <motion.section variants={item} className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="kicker">PulseOps Atlas</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
            Operational clarity in one pane.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted">
            A live view of acquisition momentum, conversion health, and pipeline stability. Built for executive
            check-ins and ops teams that need answers in seconds.
          </p>
        </div>

        <div className="panel w-full max-w-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-soft">
              <SignalHigh size={14} />
              Live pipeline
            </div>
            <PulseRing color="emerald" size="sm" active={liveMode} />
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between text-muted">
              <span>Last sync</span>
              <span className="text-ink">{liveMode ? 'Now' : '2m ago'}</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>Cache freshness</span>
              <span className="text-ink">92%</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>SLO coverage</span>
              <span className="text-ink">99.4%</span>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template}
              onClick={() => setActiveTemplate(template)}
              className={cn('chip', template === activeTemplate && 'chip-active')}
            >
              {template}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {eventFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn('chip', filter === activeFilter && 'chip-active')}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section variants={item}>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {signalCards.map((card) => (
              <SignalCard key={card.id} {...card} />
            ))}
          </div>
        )}
      </motion.section>

      <motion.section variants={item} className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ChartWidget
            title="Momentum"
            subtitle="Daily active users across the last 30 days"
            type="area"
            data={momentumData}
            dataKey="users"
            color="indigo"
            height={320}
            onMore={() => setActiveView('users')}
          />
        )}

        <div className="grid gap-6">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ChartWidget
              title="Event Mix"
              subtitle="Most active categories this cycle"
              type="bar"
              data={eventMixData}
              color="emerald"
              height={220}
              onMore={() => setActiveView('events')}
            />
          )}

          <div className="panel p-5">
            <div className="panel-header">
              <div>
                <p className="kicker">Realtime</p>
                <h3 className="text-base font-semibold text-ink">Event stream</h3>
              </div>
              <button onClick={() => setActiveView('events')} className="chip">
                View all
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-3 text-xs text-muted">
                  No recent events yet. Generate sample events to populate the stream.
                </div>
              ) : (
                filteredEvents.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{entry.eventName}</p>
                        <p className="text-xs text-soft">{entry.userId ? `User ${entry.userId}` : 'Anonymous session'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted">{formatRelative(entry.timestamp)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-6 lg:grid-cols-3">
        <div className="panel p-5">
          <div className="panel-header">
            <div>
              <p className="kicker">Engagement</p>
              <h3 className="text-base font-semibold text-ink">Momentum delta</h3>
            </div>
            <span className="pill">
              <Calendar size={12} />
              WoW
            </span>
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-soft">DAU change</p>
                <AnimatedNumber value={dauDelta} format={(n) => `${n.toFixed(1)}%`} className="text-3xl font-semibold text-ink" />
              </div>
              <AnimatedPercentage value={dauDelta} className="text-sm" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-soft">Event volume change</p>
                <AnimatedNumber value={seriesDelta} format={(n) => `${n.toFixed(1)}%`} className="text-2xl font-semibold text-ink" />
              </div>
              <AnimatedPercentage value={seriesDelta} className="text-sm" />
            </div>
            <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2 text-xs text-muted">
              Derived from the last 7 days against the previous week.
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <div className="panel-header">
            <div>
              <p className="kicker">Signals</p>
              <h3 className="text-base font-semibold text-ink">Top event share</h3>
            </div>
            <BarChart3 size={18} className="text-soft" />
          </div>
          <div className="mt-5 space-y-4">
            {eventShare.length === 0 ? (
              <p className="text-xs text-muted">No events processed yet.</p>
            ) : (
              eventShare.map((segment) => (
                <div key={segment.id}>
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>{segment.label}</span>
                    <span className="text-ink">{segment.share}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[color:var(--line-subtle)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--accent)]"
                      style={{ width: `${segment.share}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-soft">
                    <span>Share of total events</span>
                    <AnimatedPercentage value={segment.change} className="text-xs" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel p-5">
          <div className="panel-header">
            <div>
              <p className="kicker">Alerts</p>
              <h3 className="text-base font-semibold text-ink">Priority queue</h3>
            </div>
            <TrendingUp size={18} className="text-soft" />
          </div>
          <div className="mt-5 space-y-3">
            {alertQueue.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-3">
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
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveView('alerts')}
            className="mt-4 flex w-full items-center justify-between rounded-lg border border-subtle bg-elevated px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)]"
          >
            Review all alerts
            <ArrowUpRight size={14} />
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}

interface SignalCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  format?: (n: number) => string;
}

function SignalCard({ title, value, change, icon: Icon, format = (n) => n.toLocaleString() }: SignalCardProps) {
  const progress = Math.min(100, Math.max(24, Math.abs(change) * 4 + 32));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-soft">
          <span className="truncate">{title}</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--bg-tint)] text-[color:var(--ink-900)]">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <AnimatedNumber value={value} format={format} className="text-3xl font-semibold text-ink" />
        <AnimatedPercentage value={change} className="text-xs" />
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-[color:var(--line-subtle)]">
        <div
          className="h-full rounded-full bg-[color:var(--accent)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
