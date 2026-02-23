export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  category?: string;
  keywords?: string[];
}

export interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'insight';
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config?: Record<string, unknown>;
}

export interface MetricData {
  value: number;
  previousValue?: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
