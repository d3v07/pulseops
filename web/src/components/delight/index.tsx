/**
 * PulseOps Delight System
 *
 * A collection of micro-interactions, animations, and delightful UI moments
 * designed to make analytics feel alive without being childish.
 *
 * Inspired by: Linear, Vercel, Raycast, Stripe
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, AlertCircle, RefreshCw, Search, Zap, Sparkles } from 'lucide-react';

// ============================================
// 1. ANIMATED NUMBER COUNTER
// ============================================

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
  onComplete?: () => void;
  className?: string;
}

export function CountUp({
  end,
  start = 0,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
  onComplete,
  className = ''
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentCount = start + (end - start) * easedProgress;

      setCount(currentCount);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, start, duration, onComplete]);

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const [whole, decimal] = fixed.split('.');
    const withSeparator = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decimal ? `${withSeparator}.${decimal}` : withSeparator;
  };

  return (
    <span className={`count-up ${className}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
}

// ============================================
// 2. SKELETON LOADERS WITH PERSONALITY
// ============================================

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = '6px', className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        background: 'var(--bg-tertiary)',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="kpi-card" style={{ opacity: 0.7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <Skeleton width={100} height={14} />
        <Skeleton width={24} height={24} borderRadius="6px" />
      </div>
      <Skeleton width={120} height={40} />
      <div style={{ marginTop: '0.75rem' }}>
        <Skeleton width={80} height={14} />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="chart-card" style={{ opacity: 0.7 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Skeleton width={180} height={20} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', paddingTop: '20px' }}>
        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
          <Skeleton
            key={i}
            width={24}
            height={`${h}%`}
            borderRadius="4px 4px 0 0"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// 3. LOADING STATES WITH ROTATING MESSAGES
// ============================================

const loadingMessages = [
  "Crunching the numbers...",
  "Fetching fresh data...",
  "Almost there...",
  "Aggregating insights...",
  "Processing events...",
  "Building your dashboard...",
  "Connecting the dots...",
  "Analyzing patterns...",
];

interface LoaderProps {
  variant?: 'dots' | 'stream' | 'orbit';
  message?: string;
  showRotatingMessage?: boolean;
  className?: string;
}

export function Loader({ variant = 'dots', message, showRotatingMessage = false, className = '' }: LoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!showRotatingMessage) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [showRotatingMessage]);

  const renderLoader = () => {
    switch (variant) {
      case 'stream':
        return (
          <div className="loader-stream">
            {[...Array(5)].map((_, i) => <span key={i} />)}
          </div>
        );
      case 'orbit':
        return <div className="loader-orbit" />;
      default:
        return (
          <div className="loader-dots">
            <span /><span /><span />
          </div>
        );
    }
  };

  return (
    <div className={`loading-container ${className}`}>
      {renderLoader()}
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        marginTop: '1rem',
        transition: 'opacity 0.3s ease'
      }}>
        {showRotatingMessage ? loadingMessages[messageIndex] : message || 'Loading...'}
      </p>
    </div>
  );
}

// ============================================
// 4. SUCCESS / ERROR FEEDBACK COMPONENTS
// ============================================

interface FeedbackProps {
  type: 'success' | 'error';
  message: string;
  onDismiss?: () => void;
  autoHide?: number;
}

export function Feedback({ type, message, onDismiss, autoHide = 3000 }: FeedbackProps) {
  useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHide);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  const isSuccess = type === 'success';

  return (
    <div
      className={`notification-enter ${isSuccess ? 'success-ripple' : 'error-shake'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        background: isSuccess
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
          : 'rgba(239, 68, 68, 0.15)',
        border: `1px solid ${isSuccess ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
        borderRadius: 'var(--radius-lg)',
        color: isSuccess ? 'var(--accent-success)' : 'var(--accent-danger)',
      }}
    >
      {isSuccess ? (
        <div className="success-check" style={{ width: 32, height: 32 }}>
          <Check size={16} />
        </div>
      ) : (
        <AlertCircle size={20} />
      )}
      <span style={{ flex: 1, color: 'var(--text-primary)' }}>{message}</span>
    </div>
  );
}

// ============================================
// 5. MILESTONE CELEBRATION
// ============================================

interface MilestoneProps {
  value: number;
  threshold: number;
  label: string;
  children: React.ReactNode;
}

export function MilestoneTracker({ value, threshold, label, children }: MilestoneProps) {
  const [celebrated, setCelebrated] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (value >= threshold && !celebrated) {
      setCelebrated(true);
      setShowBadge(true);

      // Hide badge after 5 seconds
      const timer = setTimeout(() => setShowBadge(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [value, threshold, celebrated]);

  return (
    <div className={`celebration ${showBadge ? 'active' : ''}`} style={{ position: 'relative' }}>
      {children}
      {showBadge && (
        <div
          className="milestone-badge"
          style={{
            position: 'absolute',
            top: -12,
            right: -12,
            zIndex: 10,
          }}
        >
          <Sparkles size={14} />
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// 6. LIVE DATA INDICATOR
// ============================================

interface LiveIndicatorProps {
  isLive?: boolean;
  lastUpdated?: Date;
}

export function LiveIndicator({ isLive = true, lastUpdated }: LiveIndicatorProps) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = () => {
    if (!lastUpdated) return null;
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="live-indicator">
      <span style={{
        width: 8,
        height: 8,
        background: isLive ? 'var(--accent-success)' : 'var(--text-tertiary)',
        borderRadius: '50%',
        animation: isLive ? 'pulse-dot 2s ease-in-out infinite' : 'none',
      }} />
      <span>{isLive ? 'Live' : 'Paused'}</span>
      {lastUpdated && (
        <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px' }}>
          {getTimeAgo()}
        </span>
      )}
    </div>
  );
}

// ============================================
// 7. BUTTON WITH DELIGHT
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  isLoading,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      className={`btn-${variant} ${isPressed ? 'active' : ''} ${className}`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="loader-dots" style={{ transform: 'scale(0.6)' }}>
          <span /><span /><span />
        </div>
      ) : (
        <>
          {icon && <span style={{ marginRight: children ? '8px' : 0 }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

// ============================================
// 8. REFRESH BUTTON WITH SPIN
// ============================================

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
}

export function RefreshButton({ onRefresh, className = '' }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      className={`btn-icon btn-refresh ${className}`}
      onClick={handleRefresh}
      disabled={isRefreshing}
      data-tooltip="Refresh data"
    >
      <div ref={iconRef} style={{
        display: 'flex',
        animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none'
      }}>
        <RefreshCw size={18} />
      </div>
    </button>
  );
}

// ============================================
// 9. SEARCH INPUT WITH ANIMATION
// ============================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', onSearch }: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="search-input-wrapper" style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="input-glow"
        style={{
          paddingLeft: '40px',
          width: '100%',
        }}
      />
      <Search
        size={18}
        className="search-icon"
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: `translateY(-50%) ${isFocused ? 'scale(1.1)' : 'scale(1)'}`,
          color: isFocused ? 'var(--accent-primary)' : 'var(--text-tertiary)',
          transition: 'all 0.2s ease',
        }}
      />
    </div>
  );
}

// ============================================
// 10. KEYBOARD SHORTCUT DISPLAY
// ============================================

interface KbdProps {
  keys: string[];
  pressed?: boolean;
}

export function Kbd({ keys, pressed = false }: KbdProps) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {keys.map((key, i) => (
        <React.Fragment key={key}>
          <span className={`kbd ${pressed ? 'kbd-pressed' : ''}`}>
            {key}
          </span>
          {i < keys.length - 1 && (
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================
// 11. TOGGLE SWITCH WITH ANIMATION
// ============================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
      <div
        className={`toggle-switch ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
      />
      {label && (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {label}
        </span>
      )}
    </label>
  );
}

// ============================================
// 12. STAGGERED FADE IN FOR LISTS
// ============================================

interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number;
}

export function StaggeredList({ children, delay = 50 }: StaggeredListProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            animation: 'fadeIn 0.3s ease-out forwards',
            animationDelay: `${index * delay}ms`,
            opacity: 0,
          }}
        >
          {child}
        </div>
      ))}
    </>
  );
}

// ============================================
// 13. TOOLTIP WRAPPER
// ============================================

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  return (
    <div className="tooltip" data-tooltip={content}>
      {children}
    </div>
  );
}

// ============================================
// 14. METRIC CARD WITH COUNT-UP
// ============================================

interface AnimatedMetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number | null;
  milestone?: { threshold: number; label: string };
}

export function AnimatedMetricCard({
  title,
  value,
  prefix = '',
  suffix = '',
  subtitle,
  icon,
  trend,
  milestone,
}: AnimatedMetricCardProps) {
  const card = (
    <div className="kpi-card card-hover icon-float">
      <div className="kpi-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="kpi-label">{title}</span>
        {icon && <div className="kpi-icon">{icon}</div>}
      </div>

      <div className="kpi-value">
        <CountUp end={value} prefix={prefix} suffix={suffix} duration={1200} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {subtitle && (
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {subtitle}
          </span>
        )}
        {trend !== null && trend !== undefined && (
          <div className={`kpi-change ${trend >= 0 ? 'positive' : 'negative'}`}>
            <span>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  if (milestone) {
    return (
      <MilestoneTracker value={value} threshold={milestone.threshold} label={milestone.label}>
        {card}
      </MilestoneTracker>
    );
  }

  return card;
}

// ============================================
// EXPORTS
// ============================================

export { loadingMessages };
