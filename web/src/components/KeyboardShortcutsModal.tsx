import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['Cmd', 'K'], description: 'Open command palette' },
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'E'], description: 'Go to Events' },
      { keys: ['G', 'U'], description: 'Go to Users' },
      { keys: ['G', 'A'], description: 'Go to Alerts' },
    ],
  },
  {
    category: 'Actions',
    items: [
      { keys: ['N'], description: 'New query' },
      { keys: ['A'], description: 'Add chart' },
      { keys: ['L'], description: 'Create alert' },
      { keys: ['S'], description: 'SQL mode' },
      { keys: ['E'], description: 'Event explorer' },
      { keys: ['U'], description: 'User lookup' },
      { keys: ['C'], description: 'Cohort builder' },
    ],
  },
  {
    category: 'View',
    items: [
      { keys: ['Cmd', 'L'], description: 'Toggle live mode' },
      { keys: ['Cmd', 'I'], description: 'Toggle insight rail' },
      { keys: ['Cmd', '\\'], description: 'Focus mode' },
      { keys: ['T'], description: 'Change time range' },
      { keys: ['R'], description: 'Refresh data' },
    ],
  },
  {
    category: 'Export & Share',
    items: [
      { keys: ['Cmd', 'P'], description: 'Export as PDF' },
      { keys: ['Cmd', 'E'], description: 'Export as CSV' },
      { keys: ['Cmd', 'S'], description: 'Share view' },
    ],
  },
];

export function KeyboardShortcutsModal() {
  const { showShortcuts, setShowShortcuts } = useUIStore();

  return (
    <AnimatePresence>
      {showShortcuts && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[24px] border border-subtle bg-elevated shadow-[var(--shadow-md)] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-subtle px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--accent-soft)]/40">
                  <Keyboard size={20} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink">Keyboard Shortcuts</h2>
                  <p className="text-sm text-muted">Quick actions for focused work</p>
                </div>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-[color:var(--bg-tint)] hover:text-[color:var(--ink-900)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="grid gap-8 sm:grid-cols-2">
                {shortcuts.map((group) => (
                  <div key={group.category}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-soft">
                      {group.category}
                    </h3>
                    <div className="space-y-2">
                      {group.items.map((shortcut) => (
                        <div
                          key={shortcut.description}
                          className="flex items-center justify-between rounded-lg border border-subtle bg-surface px-3 py-2"
                        >
                          <span className="text-sm text-muted">{shortcut.description}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, i) => (
                              <span key={i} className="flex items-center gap-1">
                                {i > 0 && <span className="text-soft">+</span>}
                                <kbd className="rounded border border-subtle bg-tint px-2 py-0.5 text-xs font-medium text-muted">
                                  {key}
                                </kbd>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-subtle px-6 py-4">
              <p className="text-center text-xs text-soft">
                Press <kbd className="rounded border border-subtle bg-tint px-1.5 py-0.5 text-muted">Cmd + /</kbd> anytime to show this dialog
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
