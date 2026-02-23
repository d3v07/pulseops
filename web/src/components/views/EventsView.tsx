import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Calendar, ChevronRight, Search } from 'lucide-react';
import { graphqlClient, queries } from '../../lib/graphql';
import { parseTopBarFilters } from '../../lib/filters';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../stores/uiStore';
import { ChartWidget } from '../widgets/ChartWidget';
import { ChartSkeleton, MetricCardSkeleton } from '../animations/Shimmer';
import { downloadCsv } from '../../lib/export';
import { cn } from '../../lib/utils';

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

export function EventsView() {
  const { orgId, projectId } = useProjectStore();
  const { exportIntent, clearExportIntent, addNotification, dateRangeDays, topBarFilters } = useUIStore();
  const [selectedEvent, setSelectedEvent] = useState<string>('All events');
  const [searchTerm, setSearchTerm] = useState('');

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

  const { data: eventSeries } = useQuery({
    queryKey: ['event-series', orgId, projectId, startDate, endDate, selectedEvent, topBarFilters.join('|')],
    queryFn: async () => {
      const response: any = await graphqlClient.request(queries.GET_EVENT_SERIES, {
        orgId,
        projectId,
        startDate,
        endDate,
        eventName: selectedEvent === 'All events' ? null : selectedEvent,
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
        limit: 8,
        filters: appliedFilters,
      });
      return response.recentEvents;
    },
    enabled: !!orgId && !!projectId,
    staleTime: 15000,
  });

  useEffect(() => {
    if (!exportIntent || exportIntent.view !== 'events') return;
    const rows = (eventCounts || []).map((event: any) => ({
      event: event.eventName,
      count: event.count,
    }));
    downloadCsv('pulseops-events', rows);
    addNotification({
      type: 'success',
      title: 'Event data exported',
      message: 'Top events downloaded as CSV.',
    });
    clearExportIntent();
  }, [exportIntent, eventCounts, addNotification, clearExportIntent]);

  const seriesData = useMemo(() => (
    (eventSeries || []).map((point: any) => ({
      name: format(new Date(point.date), 'MMM d'),
      value: point.value,
    }))
  ), [eventSeries]);

  const filteredCounts = useMemo(() => {
    if (!eventCounts) return [];
    if (!searchTerm) return eventCounts;
    const lower = searchTerm.toLowerCase();
    return eventCounts.filter((event: any) => event.eventName.toLowerCase().includes(lower));
  }, [eventCounts, searchTerm]);

  const visibleEvents = useMemo(() => {
    if (!recentEvents) return [];
    let filtered = recentEvents;
    if (selectedEvent !== 'All events') {
      filtered = filtered.filter((event: any) => event.eventName === selectedEvent);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((event: any) =>
        event.eventName.toLowerCase().includes(lower) ||
        (event.userId || '').toLowerCase().includes(lower)
      );
    }
    return filtered;
  }, [recentEvents, selectedEvent, searchTerm]);

  const eventOptions = useMemo(() => {
    if (!eventCounts?.length) return ['All events'];
    const names = eventCounts.slice(0, 6).map((event: any) => event.eventName);
    return ['All events', ...names];
  }, [eventCounts]);

  useEffect(() => {
    if (!eventOptions.includes(selectedEvent)) {
      setSelectedEvent(eventOptions[0]);
    }
  }, [eventOptions, selectedEvent]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">Signals</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Event intelligence</h2>
          <p className="mt-2 text-sm text-muted">Track volume, mix, and momentum of every event your product emits.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {eventOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedEvent(option)}
              className={cn('chip', option === selectedEvent && 'chip-active')}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ChartWidget
            title={selectedEvent === 'All events' ? 'Event volume' : `${selectedEvent} volume`}
            subtitle="Daily counts for the selected event"
            type="area"
            data={seriesData}
            color="indigo"
            height={300}
            onMore={() => addNotification({ type: 'info', title: 'Explorer opened', message: 'Drill into event properties from the explorer.' })}
          />
        )}

        <div className="panel p-5">
          <div className="panel-header">
            <div>
              <p className="kicker">Top events</p>
              <h3 className="text-base font-semibold text-ink">Volume leaderboard</h3>
            </div>
            <span className="pill">
              <Calendar size={12} />
              30d
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <div className="grid gap-3">
                {[...Array(4)].map((_, i) => (
                  <MetricCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              (filteredCounts || []).slice(0, 6).map((event: any) => (
                <button
                  key={event.eventName}
                  onClick={() => setSelectedEvent(event.eventName)}
                  className="flex w-full items-center justify-between rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2 text-left text-sm text-muted transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)]"
                >
                  <span className="truncate">{event.eventName}</span>
                  <span className="text-ink">{event.count.toLocaleString()}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel p-5">
          <div className="panel-header">
            <div>
              <p className="kicker">Realtime</p>
              <h3 className="text-base font-semibold text-ink">Recent events</h3>
            </div>
            <button
              onClick={() => addNotification({ type: 'info', title: 'Explorer opened', message: 'Filtering with current event selection.' })}
              className="chip"
            >
              View explorer
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {visibleEvents.length === 0 ? (
              <div className="rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-3 text-xs text-muted">
                No recent events for this selection.
              </div>
            ) : (
              visibleEvents.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{event.eventName}</p>
                      <p className="text-xs text-soft">{event.userId ? `User ${event.userId}` : 'Anonymous session'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted">{formatRelative(event.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel p-5">
          <div className="panel-header">
            <div>
              <p className="kicker">Search</p>
              <h3 className="text-base font-semibold text-ink">Event explorer</h3>
            </div>
          </div>
          <div className="mt-4 flex h-10 items-center gap-3 rounded-lg border border-subtle bg-[color:var(--bg-tint)] px-3 text-sm text-muted">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by event name or user"
              className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="mt-5 space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Active filter</span>
              <span className="text-ink">{selectedEvent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tracked events</span>
              <span className="text-ink">{eventCounts?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Latest ingest</span>
              <span className="text-ink">{visibleEvents[0]?.timestamp ? formatRelative(visibleEvents[0].timestamp) : '—'}</span>
            </div>
          </div>
          <button
            onClick={() => addNotification({ type: 'info', title: 'Explorer opened', message: 'Refine filters and replay events.' })}
            className="mt-5 flex w-full items-center justify-between rounded-lg border border-subtle bg-elevated px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)]"
          >
            Open deep explorer
            <ChevronRight size={14} />
          </button>
        </div>
      </section>
    </motion.div>
  );
}
