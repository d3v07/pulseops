import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { AnimatedNumber, AnimatedPercentage } from '../animations/AnimatedNumber';
import { PulseRing } from '../animations/PulseRing';
import { cn } from '../../lib/utils';

interface MetricWidgetProps {
  title: string;
  value: number;
  previousValue?: number;
  change?: number;
  format?: (n: number) => string;
  icon?: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'pink';
  sparklineData?: number[];
  live?: boolean;
}

export function MetricWidget({
  title,
  value,
  previousValue,
  change,
  format = (n) => n.toLocaleString(),
  icon,
  color = 'indigo',
  sparklineData,
  live = false,
}: MetricWidgetProps) {
  const calculatedChange = change ?? (previousValue ? ((value - previousValue) / previousValue) * 100 : 0);

  const accents = {
    indigo: 'bg-[color:var(--accent)]',
    emerald: 'bg-[color:var(--success)]',
    amber: 'bg-[color:var(--warning)]',
    pink: 'bg-[color:var(--info)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn('panel p-5 group relative overflow-hidden')}
    >
      <div className={cn('absolute left-0 top-0 h-0.5 w-full', accents[color])} />

      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {live && <PulseRing color="emerald" size="sm" />}
          <span className="kicker">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--bg-tint)] text-[color:var(--ink-900)]">
              {icon}
            </div>
          )}
          <button className="rounded-lg p-1.5 text-muted opacity-0 transition-all hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)] group-hover:opacity-100">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <AnimatedNumber
          value={value}
          format={format}
          className="text-3xl font-semibold tracking-tight text-ink"
        />
      </div>

      <div className="flex items-center gap-3">
        <AnimatedPercentage value={calculatedChange} className="text-sm font-semibold" />
        <span className="text-xs text-soft">vs previous period</span>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4">
          <Sparkline data={sparklineData} color={color} />
        </div>
      )}
    </motion.div>
  );
}

interface SparklineProps {
  data: number[];
  color: 'indigo' | 'emerald' | 'amber' | 'pink';
}

function Sparkline({ data, color }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 100;

  const points = data.map((value, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((value - min) / range) * height,
  }));

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const gradientColors = {
    indigo: ['#63e6d1', '#8ff1e2'],
    emerald: ['#63e6d1', '#8ff1e2'],
    amber: ['#e7a06b', '#f2c49c'],
    pink: ['#7ac0d4', '#bfe2ea'],
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full">
      <defs>
        <linearGradient id={`sparkline-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={gradientColors[color][0]} stopOpacity="0.3" />
          <stop offset="100%" stopColor={gradientColors[color][0]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaD}
        fill={`url(#sparkline-${color})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke={gradientColors[color][0]}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <motion.circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="3"
        fill={gradientColors[color][0]}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8 }}
      />
    </svg>
  );
}
