import { motion } from 'framer-motion';
import {
  Calendar, RefreshCw, Download, Share2, Maximize2,
  Filter, SlidersHorizontal, Keyboard
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

export function ActionTray() {
  const { liveMode, toggleLiveMode, setShowShortcuts } = useUIStore();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-20 h-16 border-t border-subtle bg-surface backdrop-blur-xl"
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Time Range & Filters */}
        <div className="flex items-center gap-2">
          <ActionButton icon={<Calendar size={16} />} label="Last 30 days" showLabel />
          <div className="mx-2 h-4 w-px bg-[color:var(--line-subtle)]" />
          <ActionButton icon={<Filter size={16} />} label="Filters" badge={2} />
          <ActionButton icon={<SlidersHorizontal size={16} />} label="Options" />
        </div>

        {/* Center: Quick Stats */}
        <div className="hidden items-center gap-4 text-xs text-muted md:flex">
          <span>Showing <strong className="text-ink">1.2M</strong> events</span>
          <span className="h-1 w-1 rounded-full bg-[color:var(--line-strong)]" />
          <span><strong className="text-ink">342</strong> unique users</span>
          <span className="h-1 w-1 rounded-full bg-[color:var(--line-strong)]" />
          <span>Updated <strong className="text-ink">2s</strong> ago</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<RefreshCw size={16} className={cn(liveMode && 'animate-spin')} />}
            label={liveMode ? 'Live' : 'Refresh'}
            active={liveMode}
            onClick={toggleLiveMode}
          />
          <ActionButton icon={<Download size={16} />} label="Export" />
          <ActionButton icon={<Share2 size={16} />} label="Share" />
          <div className="mx-2 h-4 w-px bg-[color:var(--line-subtle)]" />
          <ActionButton icon={<Maximize2 size={16} />} label="Fullscreen" />
          <ActionButton
            icon={<Keyboard size={16} />}
            label="Shortcuts"
            onClick={() => setShowShortcuts(true)}
          />
        </div>
      </div>
    </motion.div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  showLabel?: boolean;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}

function ActionButton({ icon, label, showLabel, badge, active, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium transition-all',
        active
          ? 'border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)]/40 text-accent'
          : 'text-muted hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)]'
      )}
    >
      {icon}
      {showLabel && <span>{label}</span>}

      {/* Badge */}
      {badge && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}

      {/* Tooltip */}
      {!showLabel && (
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-subtle bg-elevated px-2 py-1 text-xs text-ink opacity-0 shadow-[var(--shadow-xs)] backdrop-blur-sm transition-opacity group-hover:opacity-100">
          {label}
        </div>
      )}
    </button>
  );
}
