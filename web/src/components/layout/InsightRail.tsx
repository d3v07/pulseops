import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, X, ChevronRight, Zap
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

interface Insight {
  id: string;
  type: 'anomaly' | 'trend' | 'suggestion' | 'alert';
  title: string;
  description: string;
  metric?: string;
  change?: number;
  timestamp: Date;
}

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'anomaly',
    title: 'Unusual spike detected',
    description: 'Page views increased 340% in the last hour',
    metric: 'page_view',
    change: 340,
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'trend',
    title: 'Conversion rate improving',
    description: 'Checkout completion up 12% this week vs last week',
    change: 12,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    type: 'suggestion',
    title: 'Consider creating an alert',
    description: 'You frequently check signup events. Set up an alert?',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '4',
    type: 'alert',
    title: 'Error rate threshold exceeded',
    description: 'API errors exceeded 5% threshold in production',
    timestamp: new Date(Date.now() - 1800000),
  },
];

export function InsightRail() {
  const { toggleInsightRail, setActiveView, addNotification } = useUIStore();
  const [insights, setInsights] = useState<Insight[]>(mockInsights);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id));

  const dismissInsight = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const handleRefresh = () => {
    setInsights([...mockInsights]);
    setDismissedIds(new Set());
    addNotification({
      type: 'success',
      title: 'Insights refreshed',
      message: 'Latest signals pulled into the rail.',
    });
  };

  return (
    <div className="flex h-full w-80 flex-col border-l border-subtle bg-surface/95 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-subtle px-4 py-4">
        <div>
          <p className="kicker">Signals</p>
          <div className="mt-1 flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-ink">Insights</h3>
          </div>
        </div>
        <button
          onClick={toggleInsightRail}
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)]"
        >
          <X size={16} />
        </button>
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {visibleInsights.map((insight, index) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              index={index}
              onDismiss={() => dismissInsight(insight.id)}
              onView={() => setActiveView('alerts')}
            />
          ))}
        </AnimatePresence>

        {visibleInsights.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 rounded-full border border-subtle bg-elevated p-4 shadow-[var(--shadow-xs)]">
              <Lightbulb size={24} className="text-soft" />
            </div>
            <p className="text-sm text-muted">No new insights</p>
            <p className="mt-1 text-xs text-soft">
              Check back later for fresh signals
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-subtle p-4">
        <button
          onClick={handleRefresh}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-subtle bg-elevated px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-[color:var(--line-strong)]"
        >
          <Zap size={14} />
          Generate More Insights
        </button>
      </div>
    </div>
  );
}

interface InsightCardProps {
  insight: Insight;
  index: number;
  onDismiss: () => void;
  onView: () => void;
}

function InsightCard({ insight, index, onDismiss, onView }: InsightCardProps) {
  const icons = {
    anomaly: AlertTriangle,
    trend: insight.change && insight.change > 0 ? TrendingUp : TrendingDown,
    suggestion: Lightbulb,
    alert: AlertTriangle,
  };

  const colors = {
    anomaly: 'text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/20',
    trend: insight.change && insight.change > 0
      ? 'text-[color:var(--success)] bg-[color:var(--success)]/10 border-[color:var(--success)]/20'
      : 'text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/20',
    suggestion: 'text-[color:var(--info)] bg-[color:var(--info)]/10 border-[color:var(--info)]/20',
    alert: 'text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/20',
  };

  const Icon = icons[insight.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'group relative mb-3 overflow-hidden rounded-xl border bg-elevated p-4 transition-all hover:border-[color:var(--line-strong)]',
        colors[insight.type]
      )}
    >
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-lg p-1 text-muted opacity-0 transition-all hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)] group-hover:opacity-100"
      >
        <X size={14} />
      </button>

      {/* Icon */}
      <div className="mb-3 flex items-center gap-2">
        <div className={cn('rounded-lg p-2', colors[insight.type].split(' ')[1])}>
          <Icon size={16} />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-soft">
          {insight.type}
        </span>
      </div>

      {/* Content */}
      <h4 className="mb-1 text-sm font-semibold text-ink">{insight.title}</h4>
      <p className="text-xs leading-relaxed text-muted">{insight.description}</p>

      {/* Change indicator */}
      {insight.change && (
        <div className={cn(
          'mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
          insight.change > 0 ? 'bg-[color:var(--success)]/10 text-[color:var(--success)]' : 'bg-[color:var(--warning)]/10 text-[color:var(--warning)]'
        )}>
          {insight.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {insight.change > 0 ? '+' : ''}{insight.change}%
        </div>
      )}

      {/* Action */}
      <button
        onClick={onView}
        className="mt-3 flex w-full items-center justify-between rounded-lg border border-subtle bg-surface px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)]"
      >
        View Details
        <ChevronRight size={14} />
      </button>
    </motion.div>
  );
}
