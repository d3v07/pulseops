import { motion } from 'framer-motion';
import { Calendar, Download, Share2, Zap } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';
import { copyToClipboard } from '../../lib/export';

const filterChips = [
  'All Products',
  'Segment: Pro',
  'Region: North America',
  'Device: Web',
];

export function PulseBar() {
  const {
    liveMode,
    toggleLiveMode,
    activeView,
    requestExport,
    addNotification,
    dateRangeDays,
    setDateRangeDays,
    topBarFilters,
    toggleTopBarFilter,
  } = useUIStore();

  const viewLabel = {
    dashboard: 'Executive Overview',
    events: 'Event Intelligence',
    users: 'User Engagement',
    funnels: 'Lifecycle Funnel',
    alerts: 'Risk Monitor',
    settings: 'Workspace Settings',
  }[activeView] || 'Executive Overview';

  const handleShare = async () => {
    await copyToClipboard(window.location.href);
    addNotification({
      type: 'success',
      title: 'Link copied',
      message: 'Shareable link added to clipboard.',
    });
  };

  const handleExport = () => {
    requestExport(activeView);
  };

  const handleRangeToggle = () => {
    const options = [7, 30, 90];
    const currentIndex = options.indexOf(dateRangeDays);
    const next = options[(currentIndex + 1) % options.length];
    setDateRangeDays(next);
    addNotification({
      type: 'info',
      title: 'Date range updated',
      message: `Showing last ${next} days.`,
    });
  };

  return (
    <div className="relative z-40 h-16 shrink-0 border-b border-subtle bg-surface/95 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between gap-6 px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="min-w-0">
            <p className="kicker">PulseOps</p>
            <p className="truncate text-sm font-semibold text-ink">{viewLabel}</p>
          </div>

          <div className="hidden flex-wrap items-center gap-2 lg:flex">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => toggleTopBarFilter(chip)}
                className={topBarFilters.includes(chip) ? 'chip chip-active' : 'chip'}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRangeToggle}
            className="chip hidden sm:inline-flex"
          >
            <Calendar size={14} />
            Last {dateRangeDays} days
          </button>

          <button
            onClick={toggleLiveMode}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors',
              liveMode
                ? 'border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] text-accent'
                : 'border-subtle bg-elevated text-muted hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)]'
            )}
          >
            <Zap size={14} />
            {liveMode ? 'Live' : 'Paused'}
          </button>

          <button
            onClick={handleShare}
            className="hidden items-center gap-2 rounded-full border border-subtle bg-elevated px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)] sm:flex"
          >
            <Share2 size={14} />
            Share
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-full border border-subtle bg-elevated px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)]"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[color:var(--accent)]/60 to-transparent"
        animate={{ opacity: liveMode ? [0.2, 0.7, 0.2] : 0.15 }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
}
