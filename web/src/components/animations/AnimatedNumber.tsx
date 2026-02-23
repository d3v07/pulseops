import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  format = (n) => n.toLocaleString(),
  className,
}: AnimatedNumberProps) {
  const spring = useSpring(0, { duration, bounce: 0 });
  const display = useTransform(spring, (current) => format(Math.round(current)));
  const [displayValue, setDisplayValue] = useState(format(0));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on('change', (latest) => {
      setDisplayValue(latest);
    });
  }, [display]);

  return (
    <motion.span
      className={cn('tabular-nums', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {displayValue}
    </motion.span>
  );
}

interface AnimatedPercentageProps {
  value: number;
  className?: string;
}

export function AnimatedPercentage({ value, className }: AnimatedPercentageProps) {
  const isPositive = value >= 0;

  return (
    <motion.span
      initial={{ opacity: 0, x: isPositive ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'inline-flex items-center gap-1 tabular-nums',
        isPositive ? 'text-[color:var(--success)]' : 'text-[color:var(--warning)]',
        className
      )}
    >
      <motion.span
        initial={{ rotate: isPositive ? 45 : -45 }}
        animate={{ rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </motion.span>
      <AnimatedNumber
        value={Math.abs(value)}
        format={(n) => `${n.toFixed(1)}%`}
      />
    </motion.span>
  );
}
