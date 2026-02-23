import { useEffect, useMemo, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BarChart3, Bell, Download, Clock, Database,
  Users, Zap, Settings, Share2, Filter, PlusCircle,
  Play, Pause, FileText, Layers, Target, TrendingUp,
  AlertTriangle, Eye, Code, RefreshCw, Moon, Keyboard
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useCommandStore } from '../../stores/commandStore';
import { cn } from '../../lib/utils';

const defaultCommands = [
  // Data Exploration
  { id: 'new-query', label: 'New Query', icon: <PlusCircle size={16} />, shortcut: ['N'], category: 'Explore', keywords: ['create', 'add', 'query'] },
  { id: 'sql-mode', label: 'SQL Mode', icon: <Code size={16} />, shortcut: ['S'], category: 'Explore', keywords: ['raw', 'query', 'database'] },
  { id: 'event-explorer', label: 'Event Explorer', icon: <Database size={16} />, shortcut: ['E'], category: 'Explore', keywords: ['events', 'browse', 'data'] },
  { id: 'user-lookup', label: 'User Lookup', icon: <Users size={16} />, shortcut: ['U'], category: 'Explore', keywords: ['find', 'user', 'search'] },
  { id: 'property-inspector', label: 'Property Inspector', icon: <Eye size={16} />, shortcut: ['I'], category: 'Explore', keywords: ['properties', 'inspect'] },
  { id: 'cohort-builder', label: 'Cohort Builder', icon: <Target size={16} />, shortcut: ['C'], category: 'Explore', keywords: ['segment', 'cohort', 'users'] },

  // Visualization
  { id: 'add-chart', label: 'Add Chart', icon: <BarChart3 size={16} />, shortcut: ['A'], category: 'Visualize', keywords: ['chart', 'graph', 'add'] },
  { id: 'compare-mode', label: 'Compare Mode', icon: <Layers size={16} />, shortcut: ['/'], category: 'Visualize', keywords: ['compare', 'side by side'] },
  { id: 'overlay-metric', label: 'Overlay Metric', icon: <TrendingUp size={16} />, shortcut: ['O'], category: 'Visualize', keywords: ['overlay', 'add', 'metric'] },

  // Monitoring
  { id: 'create-alert', label: 'Create Alert', icon: <Bell size={16} />, shortcut: ['L'], category: 'Monitor', keywords: ['alert', 'notify', 'threshold'] },
  { id: 'anomaly-watch', label: 'Anomaly Watch', icon: <AlertTriangle size={16} />, shortcut: ['W'], category: 'Monitor', keywords: ['anomaly', 'detect', 'watch'] },
  { id: 'live-mode', label: 'Toggle Live Mode', icon: <Zap size={16} />, shortcut: ['L'], category: 'Monitor', keywords: ['live', 'real-time', 'stream'] },
  { id: 'refresh', label: 'Refresh Data', icon: <RefreshCw size={16} />, shortcut: ['R'], category: 'Monitor', keywords: ['refresh', 'reload', 'update'] },

  // Time
  { id: 'time-range', label: 'Change Time Range', icon: <Clock size={16} />, shortcut: ['T'], category: 'Time', keywords: ['time', 'range', 'date', 'period'] },

  // Collaboration
  { id: 'share-view', label: 'Share View', icon: <Share2 size={16} />, shortcut: ['S'], category: 'Share', keywords: ['share', 'link', 'collaborate'] },
  { id: 'export-pdf', label: 'Export as PDF', icon: <FileText size={16} />, shortcut: ['P'], category: 'Share', keywords: ['export', 'pdf', 'download'] },
  { id: 'export-csv', label: 'Export as CSV', icon: <Download size={16} />, shortcut: ['E'], category: 'Share', keywords: ['export', 'csv', 'download', 'data'] },

  // Settings
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, shortcut: [','], category: 'Settings', keywords: ['settings', 'preferences', 'config'] },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard size={16} />, shortcut: ['?'], category: 'Settings', keywords: ['keyboard', 'shortcuts', 'help'] },
  { id: 'toggle-theme', label: 'Toggle Theme', icon: <Moon size={16} />, shortcut: ['D'], category: 'Settings', keywords: ['theme', 'dark', 'light', 'mode'] },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, toggleLiveMode, setShowShortcuts, setShowSettings } = useUIStore();
  const { executeCommand, getRecentCommands } = useCommandStore();
  const [search, setSearch] = useState('');

  const recentCommands = getRecentCommands();

  const handleSelect = (commandId: string) => {
    setCommandPaletteOpen(false);
    setSearch('');

    // Handle built-in actions
    switch (commandId) {
      case 'live-mode':
        toggleLiveMode();
        break;
      case 'shortcuts':
        setShowShortcuts(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      default:
        executeCommand(commandId);
    }
  };

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, typeof defaultCommands> = {};
    defaultCommands.forEach(cmd => {
      const cat = cmd.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(cmd);
    });
    return groups;
  }, []);

  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearch('');
    }
  }, [commandPaletteOpen]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-1/2 top-[20%] z-[101] w-full max-w-[640px] -translate-x-1/2"
          >
            <Command
              className="command-palette overflow-hidden rounded-[22px] border border-subtle bg-elevated shadow-[var(--shadow-md)] backdrop-blur-xl"
              loop
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-subtle px-5">
                <Search size={18} className="text-muted" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search..."
                  className="h-14 flex-1 bg-transparent text-[15px] text-ink placeholder:text-soft focus:outline-none"
                />
                <kbd className="hidden rounded-md border border-subtle bg-tint px-2 py-1 text-xs text-muted sm:inline">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-12 text-center text-sm text-muted">
                  No commands found. Try a different search.
                </Command.Empty>

                {/* Recent Commands */}
                {search === '' && recentCommands.length > 0 && (
                  <Command.Group heading="Recent" className="command-group">
                    {recentCommands.slice(0, 3).map((cmd) => (
                      <CommandItem
                        key={`recent-${cmd.id}`}
                        command={cmd}
                        onSelect={() => handleSelect(cmd.id)}
                      />
                    ))}
                  </Command.Group>
                )}

                {/* Grouped Commands */}
                {Object.entries(groupedCommands).map(([category, commands]) => (
                  <Command.Group key={category} heading={category} className="command-group">
                    {commands.map((cmd) => (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        onSelect={() => handleSelect(cmd.id)}
                      />
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-subtle px-4 py-2.5 text-xs text-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border border-subtle bg-tint px-1.5 py-0.5">Up/Down</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border border-subtle bg-tint px-1.5 py-0.5">Enter</kbd>
                    select
                  </span>
                </div>
                <span className="text-soft">PulseOps</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CommandItemProps {
  command: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string[];
    keywords?: string[];
  };
  onSelect: () => void;
}

function CommandItem({ command, onSelect }: CommandItemProps) {
  return (
    <Command.Item
      value={`${command.label} ${command.keywords?.join(' ') || ''}`}
      onSelect={onSelect}
      className="command-item group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors data-[selected=true]:bg-[color:var(--bg-tint)] data-[selected=true]:text-[color:var(--ink-900)]"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-subtle bg-elevated text-muted transition-colors group-data-[selected=true]:border-[color:var(--accent)]/40 group-data-[selected=true]:text-[color:var(--accent-strong)]">
        {command.icon}
      </span>
      <span className="flex-1 font-medium">{command.label}</span>
      {command.shortcut && (
        <kbd className="hidden rounded border border-subtle bg-tint px-2 py-0.5 text-xs text-muted sm:inline">
          {command.shortcut.join(' ')}
        </kbd>
      )}
    </Command.Item>
  );
}
