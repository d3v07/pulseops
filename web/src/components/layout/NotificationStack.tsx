import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

const iconMap = {
  success: CheckCircle2,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const toneMap = {
  success: 'border-[color:var(--success)]/40 text-[color:var(--success)]',
  error: 'border-[color:var(--warning)]/50 text-[color:var(--warning)]',
  warning: 'border-[color:var(--warning)]/50 text-[color:var(--warning)]',
  info: 'border-[color:var(--info)]/50 text-[color:var(--info)]',
};

export function NotificationStack() {
  const { notifications, removeNotification } = useUIStore();

  useEffect(() => {
    if (notifications.length === 0) return;
    const timeouts = notifications.map((notification) =>
      setTimeout(() => removeNotification(notification.id), 4000)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-6 top-20 z-50 space-y-3">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type] || Info;
        return (
          <div
            key={notification.id}
            className={cn(
              'pointer-events-auto flex w-[280px] items-start gap-3 rounded-xl border bg-[color:var(--bg-elevated)] px-4 py-3 shadow-[var(--shadow-sm)]',
              toneMap[notification.type]
            )}
          >
            <Icon size={16} className="mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">{notification.title}</p>
              {notification.message && (
                <p className="mt-1 text-xs text-soft">{notification.message}</p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="rounded-md p-1 text-muted transition-colors hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)]"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
