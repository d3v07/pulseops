import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PulseRingProps {
  active?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulseRing({ active = true, color = 'indigo', size = 'md', className }: PulseRingProps) {
  const colors = {
    indigo: 'bg-[color:var(--accent)]',
    emerald: 'bg-[color:var(--success)]',
    amber: 'bg-[color:var(--warning)]',
    red: 'bg-[color:var(--warning)]',
  };

  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  if (!active) {
    return (
      <div className={cn('rounded-full bg-[color:var(--ink-300)]', sizes[size], className)} />
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Core dot */}
      <div className={cn('rounded-full', colors[color], sizes[size])} />

      {/* Pulse rings */}
      <motion.div
        className={cn('absolute inset-0 rounded-full', colors[color])}
        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className={cn('absolute inset-0 rounded-full', colors[color])}
        animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
        transition={{ duration: 1.5, delay: 0.3, repeat: Infinity, ease: 'easeOut' }}
      />
    </div>
  );
}
