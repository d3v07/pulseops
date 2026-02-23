import { ElementType, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Activity, Users, GitBranch, Bell,
  Settings, Search, Plus, ChevronDown, Database, ShieldCheck
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

const primaryNav: { id: string; icon: ElementType; label: string; badge?: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
  { id: 'events', icon: Activity, label: 'Signals' },
  { id: 'users', icon: Users, label: 'Audience' },
  { id: 'funnels', icon: GitBranch, label: 'Journey' },
  { id: 'alerts', icon: Bell, label: 'Alerts', badge: '3' },
];

const savedViews = [
  { id: 'saved-1', label: 'Revenue Pulse' },
  { id: 'saved-2', label: 'Activation Drilldown' },
  { id: 'saved-3', label: 'Lifecycle Cohorts' },
];

const dataSources = [
  { id: 'source-1', label: 'PostgreSQL', icon: Database },
  { id: 'source-2', label: 'Kafka Streams', icon: ShieldCheck },
];

export function LeftDock() {
  const { activeView, setActiveView, addNotification } = useUIStore();
  const expanded = true;
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateView = () => {
    setActiveView('dashboard');
    addNotification({
      type: 'info',
      title: 'View template ready',
      message: 'Select a template to start building a new dashboard.',
    });
  };

  const filteredPrimaryNav = primaryNav.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSavedViews = savedViews.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDataSources = dataSources.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.aside
      className="hidden h-full w-72 flex-col border-r border-subtle bg-surface/95 backdrop-blur-xl md:flex"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--accent-soft)] text-sm font-semibold text-accent">
            PO
          </div>
          <div>
            <p className="kicker">PulseOps</p>
            <p className="text-sm font-semibold text-ink">Control Room</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <button
            onClick={() => setActiveView('settings')}
            className="flex w-full items-center justify-between rounded-xl border border-subtle bg-elevated px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-[color:var(--line-strong)]"
          >
            <span className="truncate">PulseOps Main</span>
            <ChevronDown size={16} className="text-muted" />
          </button>

          <button
            onClick={handleCreateView}
            className="flex w-full items-center justify-between rounded-xl border border-subtle bg-[color:var(--accent-soft)] px-3 py-2.5 text-sm font-semibold text-accent transition-colors hover:border-[color:var(--accent)]/60"
          >
            <span>Create new view</span>
            <Plus size={16} />
          </button>
        </div>

        <div className="mt-4 flex h-10 items-center gap-3 rounded-lg border border-subtle bg-elevated px-3 text-xs text-muted">
          <Search size={14} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search navigation"
            className="w-full bg-transparent text-xs text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto px-5">
        <div>
          <p className="kicker mb-2">Core</p>
          <div className="space-y-1">
            {filteredPrimaryNav.map((item) => (
              <DockItem
                key={item.id}
                icon={<item.icon size={18} />}
                label={item.label}
                badge={item.badge}
                active={activeView === item.id}
                expanded={expanded}
                onClick={() => setActiveView(item.id as typeof activeView)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="kicker mb-2">Saved Views</p>
          {filteredSavedViews.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView('dashboard')}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted transition-colors hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)]"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <p className="kicker mb-2">Data Sources</p>
          {filteredDataSources.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView('events')}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted transition-colors hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)]"
            >
              <item.icon size={14} />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-subtle p-5">
        <div className="flex items-center justify-between text-xs text-soft">
          <span>Pipeline health</span>
          <span className="text-accent">99.98%</span>
        </div>
        <div className="mt-3">
          <DockItem
            icon={<Settings size={18} />}
            label="Settings"
            active={activeView === 'settings'}
            expanded={expanded}
            onClick={() => setActiveView('settings')}
          />
        </div>
      </div>
    </motion.aside>
  );
}

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}

function DockItem({ icon, label, badge, active, expanded, onClick }: DockItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
        active
          ? 'bg-[color:var(--accent-soft)] text-accent'
          : 'text-muted hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)]'
      )}
    >
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[color:var(--accent)]"
        />
      )}

      <span className={cn(active && 'text-accent')}>{icon}</span>

      {expanded && (
        <span className="flex-1 truncate text-left text-sm font-medium">
          {label}
        </span>
      )}

      {badge && (
        <span className="rounded-full border border-subtle bg-[color:var(--bg-tint)] px-2 py-0.5 text-[10px] font-semibold text-muted">
          {badge}
        </span>
      )}
    </button>
  );
}
