import { motion } from 'framer-motion';
import {
  PlusCircle, Bell, Download, Share2,
  BarChart3, Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

const quickActions = [
  { id: 'new-report', icon: PlusCircle, label: 'New Report', shortcut: 'N', primary: true },
  { id: 'add-chart', icon: BarChart3, label: 'Add Chart', shortcut: 'A' },
  { id: 'create-alert', icon: Bell, label: 'Create Alert', shortcut: 'L' },
  { id: 'filters', icon: Filter, label: 'Filters', shortcut: 'F' },
  { id: 'share', icon: Share2, label: 'Share' },
  { id: 'export', icon: Download, label: 'Export' },
];

export function QuickActions() {
  const handleAction = (actionId: string) => {
    // Handle specific actions
    console.log('Action:', actionId);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {quickActions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
          onClick={() => handleAction(action.id)}
          className={cn(
            'group relative flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all',
            action.primary
              ? 'border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)]/40 text-accent hover:border-[color:var(--accent)]/60'
              : 'border-subtle bg-elevated text-muted hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)]'
          )}
        >
          <action.icon size={16} />
          <span className="hidden sm:inline">{action.label}</span>

          {/* Shortcut badge */}
          {action.shortcut && (
            <kbd className="ml-1 hidden rounded border border-subtle bg-tint px-1.5 py-0.5 text-[10px] text-muted lg:inline">
              {action.shortcut}
            </kbd>
          )}

          {/* Hover glow */}
          {action.primary && (
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[color:var(--accent)]/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
          )}
        </motion.button>
      ))}

    </div>
  );
}
