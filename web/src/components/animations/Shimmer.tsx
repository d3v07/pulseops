import { cn } from '../../lib/utils';

interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Shimmer({ className, width, height }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-[color:var(--bg-tint)]',
        className
      )}
      style={{ width, height }}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-[22px] border border-subtle bg-elevated p-6">
      <div className="mb-4 flex items-start justify-between">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-8 w-8 rounded-lg" />
      </div>
      <Shimmer className="mb-3 h-10 w-32" />
      <Shimmer className="h-4 w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-[22px] border border-subtle bg-elevated p-6">
      <div className="mb-6 flex items-center justify-between">
        <Shimmer className="h-5 w-40" />
        <div className="flex gap-2">
          <Shimmer className="h-8 w-8 rounded-lg" />
          <Shimmer className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <Shimmer className="h-64 w-full rounded-lg" />
    </div>
  );
}
