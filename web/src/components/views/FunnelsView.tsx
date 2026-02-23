import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { GitBranch, Calendar, ArrowDownRight } from 'lucide-react';
import { graphqlClient, queries } from '../../lib/graphql';
import { parseTopBarFilters } from '../../lib/filters';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../stores/uiStore';
import { downloadCsv } from '../../lib/export';
import { cn } from '../../lib/utils';

const funnelSteps = [
  { id: 'page_view', label: 'Page View' },
  { id: 'signup', label: 'Signup' },
  { id: 'form_submit', label: 'Form Submit' },
  { id: 'purchase', label: 'Purchase' },
];

export function FunnelsView() {
  const { orgId, projectId } = useProjectStore();
  const { exportIntent, clearExportIntent, addNotification, dateRangeDays, topBarFilters } = useUIStore();

  const appliedFilters = useMemo(() => parseTopBarFilters(topBarFilters), [topBarFilters]);

  const endDate = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), Math.max(1, dateRangeDays) - 1), 'yyyy-MM-dd');

  const { data: eventCounts, isLoading } = useQuery({
    queryKey: ['event-counts', orgId, projectId, startDate, endDate, topBarFilters.join('|')],
    queryFn: async () => {
      const response: any = await graphqlClient.request(queries.GET_EVENT_COUNTS, {
        orgId,
        projectId,
        startDate,
        endDate,
        filters: appliedFilters,
      });
      return response.eventCounts;
    },
    enabled: !!orgId && !!projectId,
    staleTime: 30000,
  });

  const funnelData = useMemo(() => {
    const counts = new Map<string, number>();
    (eventCounts || []).forEach((event: any) => counts.set(event.eventName, event.count));
    let previous = 0;
    return funnelSteps.map((step, index) => {
      const value = counts.get(step.id) || 0;
      const conversion = index === 0 || previous === 0 ? 100 : (value / previous) * 100;
      previous = value;
      return {
        ...step,
        value,
        conversion,
      };
    });
  }, [eventCounts]);

  useEffect(() => {
    if (!exportIntent || exportIntent.view !== 'funnels') return;
    const rows = funnelData.map((step) => ({
      step: step.label,
      count: step.value,
      conversion: `${step.conversion.toFixed(1)}%`,
    }));
    downloadCsv('pulseops-funnel', rows);
    addNotification({
      type: 'success',
      title: 'Funnel exported',
      message: 'Pipeline stages downloaded as CSV.',
    });
    clearExportIntent();
  }, [exportIntent, funnelData, clearExportIntent, addNotification]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">Journey</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Lifecycle funnel</h2>
          <p className="mt-2 text-sm text-muted">A simplified conversion view based on your most common events.</p>
        </div>
        <span className="pill">
          <Calendar size={12} />
          30d
        </span>
      </section>

      <section className="panel p-6">
        <div className="panel-header">
          <div>
            <p className="kicker">Pipeline</p>
            <h3 className="text-base font-semibold text-ink">Acquisition to purchase</h3>
          </div>
          <GitBranch size={18} className="text-soft" />
        </div>
        <p className="mt-3 text-xs text-soft">
          Derived from event volumes in the last 30 days. Configure custom steps once user-level funnel data is enabled.
        </p>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-4 py-4 text-sm text-muted">
              Loading funnel stages...
            </div>
          ) : (
            funnelData.map((step, index) => (
              <div key={step.id} className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{step.label}</p>
                    <p className="text-xs text-soft">{step.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">{step.value.toLocaleString()}</p>
                    <p className="text-xs text-muted">{step.conversion.toFixed(1)}% conversion</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-[color:var(--line-subtle)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--accent)]"
                    style={{ width: `${Math.min(100, step.conversion)}%` }}
                  />
                </div>
                {index < funnelData.length - 1 && (
                  <div className={cn('mt-3 flex items-center gap-2 text-xs text-soft')}>
                    <ArrowDownRight size={12} />
                    Drops to next stage
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
}
