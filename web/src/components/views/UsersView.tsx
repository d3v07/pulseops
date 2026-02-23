import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Calendar, Users } from 'lucide-react';
import { graphqlClient, queries } from '../../lib/graphql';
import { parseTopBarFilters } from '../../lib/filters';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../stores/uiStore';
import { ChartWidget } from '../widgets/ChartWidget';
import { MetricCardSkeleton, ChartSkeleton } from '../animations/Shimmer';
import { AnimatedNumber, AnimatedPercentage } from '../animations/AnimatedNumber';
import { downloadCsv } from '../../lib/export';

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export function UsersView() {
  const { orgId, projectId } = useProjectStore();
  const { exportIntent, clearExportIntent, addNotification, dateRangeDays, topBarFilters } = useUIStore();

  const appliedFilters = useMemo(() => parseTopBarFilters(topBarFilters), [topBarFilters]);

  const endDate = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), Math.max(1, dateRangeDays) - 1), 'yyyy-MM-dd');

  const { data: dauSeries, isLoading } = useQuery({
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

  useEffect(() => {
    if (!exportIntent || exportIntent.view !== 'users') return;
    const rows = (dauSeries || []).map((point: any) => ({
      date: point.date,
      dau: point.value,
    }));
    downloadCsv('pulseops-users', rows);
    addNotification({
      type: 'success',
      title: 'User trend exported',
      message: 'DAU series downloaded as CSV.',
    });
    clearExportIntent();
  }, [exportIntent, dauSeries, clearExportIntent, addNotification]);

  const chartData = useMemo(() => (
    (dauSeries || []).map((point: any) => ({
      name: format(new Date(point.date), 'MMM d'),
      users: point.value,
    }))
  ), [dauSeries]);

  const values = (dauSeries || []).map((point: any) => point.value);
  const peak = values.length ? Math.max(...values) : 0;
  const low = values.length ? Math.min(...values) : 0;
  const avg = average(values);
  const last = values.length ? values[values.length - 1] : 0;
  const change = avg ? ((last - avg) / avg) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">Audience</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">User engagement</h2>
          <p className="mt-2 text-sm text-muted">Monitor daily active users and engagement stability across the last 30 days.</p>
        </div>
        <span className="pill">
          <Calendar size={12} />
          30d
        </span>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ChartWidget
            title="Daily Active Users"
            subtitle="Engagement volume over time"
            type="area"
            data={chartData}
            dataKey="users"
            color="indigo"
            height={320}
            onMore={() => addNotification({ type: 'info', title: 'Audience drilldown', message: 'Use segments and cohorts to explore deeper.' })}
          />
        )}

        <div className="panel p-5">
          <div className="panel-header">
            <div>
              <p className="kicker">Summary</p>
              <h3 className="text-base font-semibold text-ink">Engagement health</h3>
            </div>
            <Users size={18} className="text-soft" />
          </div>
          {isLoading ? (
            <div className="mt-6 grid gap-3">
              {[...Array(3)].map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-soft">Current DAU</p>
                  <AnimatedNumber value={last} className="text-3xl font-semibold text-ink" />
                </div>
                <AnimatedPercentage value={change} className="text-sm" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-soft">30d average</p>
                  <AnimatedNumber value={avg} className="text-2xl font-semibold text-ink" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-soft">Peak / Low</p>
                  <p className="text-lg font-semibold text-ink">{peak.toLocaleString()} / {low.toLocaleString()}</p>
                </div>
              </div>
              <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2 text-xs text-muted">
                Engagement is tracking within expected range for the current release cycle.
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
