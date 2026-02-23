import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, PlusCircle, Bell, Download, Clock, Zap,
  Share2, Settings, X
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

const radialActions = [
  { id: 'query', icon: <PlusCircle size={18} />, label: 'New Query', angle: 0 },
  { id: 'alert', icon: <Bell size={18} />, label: 'Create Alert', angle: 45 },
  { id: 'export', icon: <Download size={18} />, label: 'Export Data', angle: 90 },
  { id: 'time', icon: <Clock size={18} />, label: 'Time Range', angle: 135 },
  { id: 'live', icon: <Zap size={18} />, label: 'Live Mode', angle: 180 },
  { id: 'share', icon: <Share2 size={18} />, label: 'Share View', angle: 225 },
  { id: 'search', icon: <Search size={18} />, label: 'Search', angle: 270 },
  { id: 'settings', icon: <Settings size={18} />, label: 'Settings', angle: 315 },
];

export function FloatingOrb() {
  const { orbExpanded, setOrbExpanded, liveMode, toggleLiveMode, toggleCommandPalette } = useUIStore();
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // Simulate data flow pulses
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      setPulseIntensity(Math.random() * 0.5 + 0.5);
      setTimeout(() => setPulseIntensity(0), 300);
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [liveMode]);

  const handleActionClick = (actionId: string) => {
    setOrbExpanded(false);

    switch (actionId) {
      case 'search':
        toggleCommandPalette();
        break;
      case 'live':
        toggleLiveMode();
        break;
      // Add other action handlers
    }
  };

  const radius = 90;

  return (
    <div className="fixed bottom-20 right-8 z-50">
      {/* Radial Menu */}
      <AnimatePresence>
        {orbExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOrbExpanded(false)}
            />

            {/* Radial Actions */}
            {radialActions.map((action, i) => {
              const angleRad = (action.angle - 90) * (Math.PI / 180);
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x, y }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                  className={cn(
                    'absolute left-1/2 top-1/2 z-50 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-subtle bg-elevated text-muted shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-900)]',
                    action.id === 'live' && liveMode && 'border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]'
                  )}
                  onClick={() => handleActionClick(action.id)}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  {action.icon}
                </motion.button>
              );
            })}

            {/* Action Label */}
            <AnimatePresence>
              {hoveredAction && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-1/2 top-[-60px] z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-subtle bg-elevated px-3 py-1.5 text-sm font-medium text-ink shadow-[var(--shadow-xs)] backdrop-blur-sm"
                >
                  {radialActions.find(a => a.id === hoveredAction)?.label}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {/* Main Orb */}
      <motion.button
        className="relative z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[var(--shadow-md)]"
        onClick={() => setOrbExpanded(!orbExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: liveMode
              ? [
                  `0 0 18px rgba(166, 124, 75, ${0.2 + pulseIntensity * 0.2})`,
                  `0 0 36px rgba(46, 125, 91, ${0.15 + pulseIntensity * 0.15})`,
                ].join(', ')
              : '0 0 16px rgba(166, 124, 75, 0.15)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated rings */}
        {liveMode && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border border-[color:var(--accent)]/30"
              animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-[color:var(--success)]/20"
              animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: 'easeOut' }}
            />
          </>
        )}

        {/* Core orb */}
        <div className={cn(
          'relative flex h-full w-full items-center justify-center rounded-full border border-subtle bg-elevated transition-all duration-300',
          liveMode ? 'shadow-[inset_0_0_0_1px_rgba(166,124,75,0.2)]' : 'shadow-[inset_0_0_0_1px_rgba(28,38,34,0.08)]',
          orbExpanded && 'rotate-45'
        )}>
          <AnimatePresence mode="wait">
            {orbExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
              >
                <X size={22} className="text-ink" />
              </motion.div>
            ) : (
              <motion.div
                key="pulse"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
              >
                {/* Pulse dot in center */}
                <div className="h-3 w-3 rounded-full bg-[color:var(--accent)] shadow-[var(--shadow-xs)]" />
                {liveMode && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[color:var(--accent)]"
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Status indicator */}
      <motion.div
        className={cn(
          'absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-[color:var(--bg-base)]',
          liveMode ? 'bg-[color:var(--success)]' : 'bg-[color:var(--ink-300)]'
        )}
        animate={liveMode ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}
