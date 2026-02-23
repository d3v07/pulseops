/**
 * PulseOps Empty States & Personality Copy
 *
 * Empty states that encourage rather than discourage.
 * Error messages that feel like a helpful friend.
 * Loading messages that entertain.
 */

import React from 'react';
import {
  Search,
  AlertTriangle,
  WifiOff,
  Clock,
} from 'lucide-react';

// ============================================
// 1. EMPTY STATE COMPONENTS
// ============================================

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'chart' | 'search' | 'rocket' | 'coffee' | 'target';
}

// Minimal geometric illustrations that match the glassmorphism theme
const illustrations = {
  chart: (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="50" width="16" height="25" rx="2" fill="url(#grad1)" opacity="0.3"/>
      <rect x="32" y="35" width="16" height="40" rx="2" fill="url(#grad1)" opacity="0.5"/>
      <rect x="54" y="20" width="16" height="55" rx="2" fill="url(#grad1)" opacity="0.7"/>
      <rect x="76" y="10" width="16" height="65" rx="2" fill="url(#grad1)" opacity="0.9"/>
      <rect x="98" y="5" width="16" height="70" rx="2" fill="url(#grad1)"/>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  search: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="35" cy="35" r="20" stroke="url(#grad2)" strokeWidth="3" opacity="0.5"/>
      <circle cx="35" cy="35" r="12" stroke="url(#grad2)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"/>
      <line x1="50" y1="50" x2="65" y2="65" stroke="url(#grad2)" strokeWidth="4" strokeLinecap="round"/>
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#ec4899"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  rocket: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 10 L50 35 L45 40 L40 75 L35 40 L30 35 Z" fill="url(#grad3)" opacity="0.8"/>
      <circle cx="40" cy="30" r="5" fill="white" opacity="0.9"/>
      <path d="M30 50 Q20 55 25 65" stroke="#f59e0b" strokeWidth="2" opacity="0.6"/>
      <path d="M50 50 Q60 55 55 65" stroke="#ec4899" strokeWidth="2" opacity="0.6"/>
      <defs>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  coffee: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 30 L20 60 Q20 70 30 70 L50 70 Q60 70 60 60 L60 30 Z" fill="url(#grad4)" opacity="0.3"/>
      <path d="M60 35 Q70 35 70 45 Q70 55 60 55" stroke="url(#grad4)" strokeWidth="3" opacity="0.5"/>
      <path d="M30 20 Q32 10 35 20" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" opacity="0.4">
        <animate attributeName="d" values="M30 20 Q32 10 35 20;M30 15 Q32 5 35 15;M30 20 Q32 10 35 20" dur="2s" repeatCount="indefinite"/>
      </path>
      <path d="M40 20 Q42 8 45 20" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" opacity="0.4">
        <animate attributeName="d" values="M40 20 Q42 8 45 20;M40 13 Q42 3 45 13;M40 20 Q42 8 45 20" dur="2s" repeatCount="indefinite" begin="0.3s"/>
      </path>
      <path d="M50 20 Q52 10 55 20" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" opacity="0.4">
        <animate attributeName="d" values="M50 20 Q52 10 55 20;M50 15 Q52 5 55 15;M50 20 Q52 10 55 20" dur="2s" repeatCount="indefinite" begin="0.6s"/>
      </path>
      <defs>
        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  target: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="30" stroke="url(#grad5)" strokeWidth="2" opacity="0.2"/>
      <circle cx="40" cy="40" r="20" stroke="url(#grad5)" strokeWidth="2" opacity="0.4"/>
      <circle cx="40" cy="40" r="10" stroke="url(#grad5)" strokeWidth="2" opacity="0.6"/>
      <circle cx="40" cy="40" r="4" fill="url(#grad5)"/>
      <defs>
        <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#3b82f6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
};

export function EmptyState({ title, description, icon, action, illustration }: EmptyStateProps) {
  return (
    <div
      className="empty-state fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}
    >
      {illustration && (
        <div style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
          {illustrations[illustration]}
        </div>
      )}
      {!illustration && icon && (
        <div style={{
          marginBottom: '1.5rem',
          color: 'var(--text-tertiary)',
          opacity: 0.5,
        }}>
          {icon}
        </div>
      )}
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '0.5rem',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        maxWidth: '320px',
        lineHeight: 1.6,
      }}>
        {description}
      </p>
      {action && (
        <button
          className="btn-primary"
          onClick={action.onClick}
          style={{ marginTop: '1.5rem' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================
// 2. SPECIFIC EMPTY STATES
// ============================================

export function NoDataEmptyState({ onSetup }: { onSetup?: () => void }) {
  return (
    <EmptyState
      title="No data yet"
      description="Once events start flowing in, your analytics will appear here. It usually takes a few minutes for the first data to show up."
      illustration="chart"
      action={onSetup ? { label: 'Set up tracking', onClick: onSetup } : undefined}
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      title={`No results for "${query}"`}
      description="Try adjusting your search terms or filters. Sometimes the best insights come from unexpected angles."
      illustration="search"
    />
  );
}

export function NoProjectEmptyState({ onSelect }: { onSelect?: () => void }) {
  return (
    <EmptyState
      title="Select a project"
      description="Choose a project from the dropdown above to start exploring your analytics. Your data is waiting."
      illustration="target"
      action={onSelect ? { label: 'Select project', onClick: onSelect } : undefined}
    />
  );
}

export function FirstTimeEmptyState({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <EmptyState
      title="Ready for liftoff"
      description="Welcome to PulseOps. Let's set up your first project and start turning events into insights."
      illustration="rocket"
      action={onGetStarted ? { label: 'Get started', onClick: onGetStarted } : undefined}
    />
  );
}

// ============================================
// 3. ERROR STATES WITH PERSONALITY
// ============================================

interface ErrorStateProps {
  type: 'network' | 'server' | 'notFound' | 'timeout' | 'generic';
  onRetry?: () => void;
  details?: string;
}

const errorCopy = {
  network: {
    title: "Looks like you're offline",
    description: "We can't reach our servers right now. Check your connection and we'll try again.",
    icon: <WifiOff size={48} />,
  },
  server: {
    title: "Something went sideways",
    description: "Our servers are having a moment. We've been notified and are looking into it. Try again in a bit?",
    icon: <AlertTriangle size={48} />,
  },
  notFound: {
    title: "This doesn't exist",
    description: "The resource you're looking for has moved or never existed. Double-check the URL or head back home.",
    icon: <Search size={48} />,
  },
  timeout: {
    title: "That took too long",
    description: "The request timed out. This might be due to a slow connection or our servers being busy. Let's try that again.",
    icon: <Clock size={48} />,
  },
  generic: {
    title: "Something went wrong",
    description: "An unexpected error occurred. We've logged it and will look into it. In the meantime, try refreshing.",
    icon: <AlertTriangle size={48} />,
  },
};

export function ErrorState({ type, onRetry, details }: ErrorStateProps) {
  const content = errorCopy[type];

  return (
    <div
      className="error-container fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}
    >
      <div style={{
        color: 'var(--accent-danger)',
        marginBottom: '1.5rem',
        opacity: 0.8,
      }}>
        {content.icon}
      </div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '0.5rem',
      }}>
        {content.title}
      </h3>
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        maxWidth: '400px',
        lineHeight: 1.6,
        marginBottom: details ? '0.75rem' : '0',
      }}>
        {content.description}
      </p>
      {details && (
        <code style={{
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          background: 'var(--bg-tertiary)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'monospace',
          marginTop: '0.5rem',
        }}>
          {details}
        </code>
      )}
      {onRetry && (
        <button
          className="btn-primary"
          onClick={onRetry}
          style={{ marginTop: '1.5rem' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ============================================
// 4. LOADING MESSAGES
// ============================================

export const loadingMessages = {
  default: [
    "Crunching the numbers...",
    "Fetching fresh data...",
    "Almost there...",
    "Aggregating insights...",
  ],
  initial: [
    "Warming up the engines...",
    "Connecting to your data...",
    "Preparing your dashboard...",
    "Just a moment...",
  ],
  refresh: [
    "Checking for updates...",
    "Syncing latest data...",
    "Refreshing your view...",
  ],
  export: [
    "Preparing your export...",
    "Gathering the data...",
    "Formatting for download...",
    "Almost ready...",
  ],
  heavy: [
    "This is a lot of data...",
    "Processing millions of events...",
    "Worth the wait...",
    "Building your insights...",
  ],
};

// ============================================
// 5. TOOLTIP COPY
// ============================================

export const tooltips = {
  refresh: "Refresh data (Cmd+R)",
  export: "Export to CSV",
  fullscreen: "Enter fullscreen (F)",
  settings: "Dashboard settings",
  help: "Keyboard shortcuts (Cmd+K)",
  filter: "Filter data",
  dateRange: "Change date range",
  compare: "Compare to previous period",
  share: "Share dashboard",
  pin: "Pin to favorites",
};

// ============================================
// 6. CELEBRATION MESSAGES
// ============================================

export const celebrationMessages = {
  milestone: {
    1000: "First thousand! You're just getting started.",
    10000: "10K events! Things are heating up.",
    100000: "100K events! Now we're talking.",
    1000000: "A million events! You've hit the big leagues.",
  },
  growth: {
    10: "10% growth. Nice and steady.",
    25: "25% growth. Looking good!",
    50: "50% growth. On fire!",
    100: "100% growth! Doubling down.",
    200: "200%+ growth? You're crushing it.",
  },
  streak: {
    7: "7-day streak! Consistency is key.",
    30: "30-day streak! A month of growth.",
    90: "90-day streak! A quarter of excellence.",
  },
};

// ============================================
// 7. HELP TEXT / ONBOARDING COPY
// ============================================

export const helpText = {
  dauChart: "Daily Active Users shows unique users who performed at least one event each day.",
  eventBreakdown: "See which events are most popular across your user base.",
  totalEvents: "The total number of events tracked in the selected time period.",
  trend: "Compares the current value to the previous period.",
  liveIndicator: "Data refreshes automatically every 30 seconds.",
};

// ============================================
// 8. PLACEHOLDER COPY
// ============================================

export const placeholders = {
  search: "Search events, metrics...",
  projectId: "Enter project ID...",
  orgId: "Enter organization ID...",
  dateRange: "Select date range",
  filter: "Add a filter...",
};

// ============================================
// 9. NOTIFICATION COPY
// ============================================

export const notifications = {
  dataRefreshed: "Data refreshed successfully",
  exportStarted: "Export started. Check your downloads.",
  exportComplete: "Export complete!",
  settingsSaved: "Settings saved",
  copied: "Copied to clipboard",
  error: "Something went wrong. Please try again.",
  offline: "You appear to be offline",
  reconnected: "You're back online!",
};
