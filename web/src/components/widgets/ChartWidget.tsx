import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Maximize2, Download, MoreHorizontal, TrendingUp } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { downloadCsv } from '../../lib/export';

interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  type?: 'area' | 'bar';
  data: Array<{ name: string; value: number; [key: string]: any }>;
  dataKey?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'pink';
  height?: number;
  onTrend?: () => void;
  onExport?: () => void;
  onExpand?: () => void;
  onMore?: () => void;
}

export function ChartWidget({
  title,
  subtitle,
  type = 'area',
  data,
  dataKey = 'value',
  color = 'indigo',
  height = 300,
  onTrend,
  onExport,
  onExpand,
  onMore,
}: ChartWidgetProps) {
  const { toggleFocusMode, setActiveView, addNotification } = useUIStore();
  const colors = {
    indigo: { main: '#63e6d1', gradient: ['#63e6d1', '#8ff1e2'] },
    emerald: { main: '#63e6d1', gradient: ['#63e6d1', '#8ff1e2'] },
    amber: { main: '#e7a06b', gradient: ['#e7a06b', '#f2c49c'] },
    pink: { main: '#7ac0d4', gradient: ['#7ac0d4', '#bfe2ea'] },
  };

  const chartColor = colors[color];

  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    downloadCsv(`${title.toLowerCase().replace(/\s+/g, '-')}-data`, data);
    addNotification({
      type: 'success',
      title: 'Chart exported',
      message: `${title} data downloaded as CSV.`,
    });
  };

  const handleExpand = () => {
    if (onExpand) {
      onExpand();
      return;
    }
    toggleFocusMode();
  };

  const handleTrend = () => {
    if (onTrend) {
      onTrend();
      return;
    }
    addNotification({
      type: 'info',
      title: 'Trend analysis queued',
      message: 'Generating deeper trend insight.',
    });
  };

  const handleMore = () => {
    if (onMore) {
      onMore();
      return;
    }
    setActiveView('events');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-6"
    >
      <div className="panel-header mb-6">
        <div>
          <p className="kicker">Performance</p>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button className="chip" onClick={handleTrend}>
            <TrendingUp size={14} />
            Trend
          </button>
          <button className="chip" onClick={handleExport}>
            <Download size={14} />
            Export
          </button>
          <button className="chip hidden sm:inline-flex" onClick={handleExpand}>
            <Maximize2 size={14} />
            Expand
          </button>
          <button className="chip" onClick={handleMore}>
            <MoreHorizontal size={14} />
            More
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor.gradient[0]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor.gradient[1]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(246, 247, 249, 0.08)" />
              <XAxis
                dataKey="name"
                stroke="rgba(246, 247, 249, 0.4)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(246, 247, 249, 0.4)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip color={chartColor.main} />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={chartColor.main}
                strokeWidth={2}
                fill={`url(#gradient-${color})`}
                animationDuration={1000}
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <defs>
                <linearGradient id={`bar-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor.gradient[0]} stopOpacity={1} />
                  <stop offset="100%" stopColor={chartColor.gradient[1]} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(246, 247, 249, 0.08)" />
              <XAxis
                dataKey="name"
                stroke="rgba(246, 247, 249, 0.4)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(246, 247, 249, 0.4)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip color={chartColor.main} />} />
              <Bar
                dataKey={dataKey}
                fill={`url(#bar-gradient-${color})`}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  color: string;
}

function CustomTooltip({ active, payload, label, color }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-subtle bg-elevated px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur-sm"
    >
      <p className="mb-1 text-xs text-muted">{label}</p>
      <p className="text-lg font-semibold" style={{ color }}>
        {payload[0].value.toLocaleString()}
      </p>
    </motion.div>
  );
}
