/**
 * PulseOps Easter Eggs System
 *
 * Hidden interactions that reward power users and make discovery fun.
 * Professional but playful - think Raycast command palette or Linear shortcuts.
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { Zap, Command, Keyboard, Star, Rocket, Coffee, Moon, Sun, Terminal } from 'lucide-react';

// ============================================
// 1. KONAMI CODE DETECTOR
// ============================================

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

interface KonamiCodeProps {
  onActivate: () => void;
  children?: React.ReactNode;
}

export function KonamiCodeDetector({ onActivate, children }: KonamiCodeProps) {
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = [...inputSequence, e.key].slice(-KONAMI_CODE.length);
      setInputSequence(newSequence);

      if (newSequence.join(',') === KONAMI_CODE.join(',') && !activated) {
        setActivated(true);
        onActivate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputSequence, activated, onActivate]);

  return <>{children}</>;
}

// ============================================
// 2. KEYBOARD SHORTCUT SYSTEM
// ============================================

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
  category?: string;
}

interface KeyboardContextType {
  shortcuts: Shortcut[];
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (keys: string[]) => void;
  showPalette: boolean;
  setShowPalette: (show: boolean) => void;
}

const KeyboardContext = createContext<KeyboardContextType | null>(null);

export function KeyboardShortcutProvider({ children }: { children: React.ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [showPalette, setShowPalette] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    setShortcuts(prev => [...prev.filter(s => s.keys.join('+') !== shortcut.keys.join('+')), shortcut]);
  }, []);

  const unregisterShortcut = useCallback((keys: string[]) => {
    setShortcuts(prev => prev.filter(s => s.keys.join('+') !== keys.join('+')));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const newPressed = new Set(pressedKeys);

      if (e.metaKey || e.ctrlKey) newPressed.add('mod');
      if (e.shiftKey) newPressed.add('shift');
      if (e.altKey) newPressed.add('alt');
      newPressed.add(key);

      setPressedKeys(newPressed);

      // Check for shortcut matches
      for (const shortcut of shortcuts) {
        const shortcutKeys = shortcut.keys.map(k => k.toLowerCase());
        const allPressed = shortcutKeys.every(k => {
          if (k === 'mod') return e.metaKey || e.ctrlKey;
          if (k === 'shift') return e.shiftKey;
          if (k === 'alt') return e.altKey;
          return newPressed.has(k);
        });

        if (allPressed && shortcutKeys.length === newPressed.size) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }

      // Toggle command palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        setShowPalette(prev => !prev);
      }
    };

    const handleKeyUp = () => {
      setPressedKeys(new Set());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shortcuts, pressedKeys]);

  return (
    <KeyboardContext.Provider value={{ shortcuts, registerShortcut, unregisterShortcut, showPalette, setShowPalette }}>
      {children}
      {showPalette && <CommandPalette onClose={() => setShowPalette(false)} />}
    </KeyboardContext.Provider>
  );
}

export function useKeyboardShortcut(shortcut: Shortcut) {
  const context = useContext(KeyboardContext);

  useEffect(() => {
    if (!context) return;
    context.registerShortcut(shortcut);
    return () => context.unregisterShortcut(shortcut.keys);
  }, [context, shortcut]);
}

export function useCommandPalette() {
  const context = useContext(KeyboardContext);
  if (!context) throw new Error('useCommandPalette must be used within KeyboardShortcutProvider');
  return context;
}

// ============================================
// 3. COMMAND PALETTE (Raycast-style)
// ============================================

interface CommandPaletteProps {
  onClose: () => void;
}

function CommandPalette({ onClose }: CommandPaletteProps) {
  const context = useContext(KeyboardContext);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredShortcuts = context?.shortcuts.filter(s =>
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredShortcuts.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredShortcuts[selectedIndex]) {
        filteredShortcuts[selectedIndex].action();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, filteredShortcuts, selectedIndex]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
        zIndex: 100,
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid var(--glass-border)',
        }}>
          <Command size={20} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
            }}
          />
          <kbd className="kbd" style={{ fontSize: '0.65rem' }}>ESC</kbd>
        </div>

        {/* Commands List */}
        <div style={{
          maxHeight: '320px',
          overflowY: 'auto',
          padding: '8px',
        }}>
          {filteredShortcuts.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
            }}>
              No commands found
            </div>
          ) : (
            filteredShortcuts.map((shortcut, index) => (
              <div
                key={shortcut.keys.join('+')}
                onClick={() => {
                  shortcut.action();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: index === selectedIndex ? 'var(--bg-tertiary)' : 'transparent',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Keyboard size={16} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ color: 'var(--text-primary)' }}>{shortcut.description}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {shortcut.keys.map(key => (
                    <kbd key={key} className="kbd">{key === 'mod' ? (navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl') : key}</kbd>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
        }}>
          <span>Navigate with arrow keys</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. ACHIEVEMENT SYSTEM
// ============================================

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: Date;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-refresh',
    title: 'Data Hunter',
    description: 'Refreshed data for the first time',
    icon: <Zap size={20} />,
  },
  {
    id: 'keyboard-master',
    title: 'Keyboard Ninja',
    description: 'Used 5 keyboard shortcuts',
    icon: <Keyboard size={20} />,
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Used the dashboard after midnight',
    icon: <Moon size={20} />,
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Checked analytics before 7 AM',
    icon: <Sun size={20} />,
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Opened the command palette 10 times',
    icon: <Terminal size={20} />,
  },
  {
    id: 'milestone-hunter',
    title: 'Milestone Hunter',
    description: 'Witnessed a metric hit a new record',
    icon: <Star size={20} />,
  },
  {
    id: 'rocket-ship',
    title: 'To The Moon',
    description: 'Saw 100% growth in any metric',
    icon: <Rocket size={20} />,
  },
  {
    id: 'coffee-break',
    title: 'Coffee Break',
    description: 'Triggered the Konami code',
    icon: <Coffee size={20} />,
  },
];

interface AchievementContextType {
  achievements: Achievement[];
  unlocked: string[];
  unlock: (id: string) => void;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<string[]>(() => {
    const stored = localStorage.getItem('pulseops-achievements');
    return stored ? JSON.parse(stored) : [];
  });
  const [notification, setNotification] = useState<Achievement | null>(null);

  const unlock = useCallback((id: string) => {
    if (unlocked.includes(id)) return;

    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return;

    setUnlocked(prev => {
      const newUnlocked = [...prev, id];
      localStorage.setItem('pulseops-achievements', JSON.stringify(newUnlocked));
      return newUnlocked;
    });

    setNotification(achievement);
    setTimeout(() => setNotification(null), 4000);
  }, [unlocked]);

  // Time-based achievements
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) unlock('night-owl');
    if (hour >= 5 && hour < 7) unlock('early-bird');
  }, [unlock]);

  return (
    <AchievementContext.Provider value={{ achievements: ACHIEVEMENTS, unlocked, unlock }}>
      {children}
      {notification && <AchievementNotification achievement={notification} />}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) throw new Error('useAchievements must be used within AchievementProvider');
  return context;
}

function AchievementNotification({ achievement }: { achievement: Achievement }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
        color: 'white',
        zIndex: 200,
        animation: 'notification-slide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div style={{
        width: 48,
        height: 48,
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {achievement.icon}
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '2px' }}>
          Achievement Unlocked!
        </div>
        <div style={{ fontWeight: 600 }}>{achievement.title}</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{achievement.description}</div>
      </div>
    </div>
  );
}

// ============================================
// 5. SECRET MATRIX MODE
// ============================================

export function MatrixMode({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = canvas.width / 20;
    const drops: number[] = Array(Math.floor(columns)).fill(1);
    const chars = '01PulseOpsDAUMetrics'.split('');

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#6366f1';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.3,
      }}
    />
  );
}

// ============================================
// 6. LOGO LONG-PRESS EASTER EGG
// ============================================

interface LogoPressProps {
  children: React.ReactNode;
  onSecretActivate: () => void;
  holdDuration?: number;
}

export function LogoLongPress({ children, onSecretActivate, holdDuration = 3000 }: LogoPressProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    setIsHolding(true);
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / holdDuration, 1);
      setProgress(newProgress);

      if (newProgress >= 1) {
        endHold();
        onSecretActivate();
      }
    }, 16);
  };

  const endHold = () => {
    setIsHolding(false);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div
      style={{ position: 'relative', cursor: 'pointer' }}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
    >
      {children}
      {isHolding && progress > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: `${progress * 100}%`,
            height: 3,
            background: 'var(--gradient-primary)',
            borderRadius: 2,
            transition: 'width 0.05s linear',
          }}
        />
      )}
    </div>
  );
}

// ============================================
// 7. CLICK COUNTER EASTER EGG
// ============================================

interface ClickCounterProps {
  children: React.ReactNode;
  targetClicks: number;
  onReach: () => void;
  resetAfter?: number;
}

export function ClickCounter({ children, targetClicks, onReach, resetAfter = 2000 }: ClickCounterProps) {
  const [, setClicks] = useState(0);
  const [reached, setReached] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (reached) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setClicks(prev => {
      const newClicks = prev + 1;
      if (newClicks >= targetClicks) {
        setReached(true);
        onReach();
      }
      return newClicks;
    });

    timeoutRef.current = setTimeout(() => {
      setClicks(0);
    }, resetAfter);
  };

  return (
    <div onClick={handleClick} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export { CommandPalette, ACHIEVEMENTS };
