import { create } from 'zustand';

interface UIState {
  // Sound Effects
  soundsEnabled: boolean;
  toggleSounds: () => void;
  setSoundsEnabled: (enabled: boolean) => void;

  // Command Palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // Panels
  leftDockExpanded: boolean;
  insightRailOpen: boolean;
  focusMode: boolean;
  toggleLeftDock: () => void;
  toggleInsightRail: () => void;
  toggleFocusMode: () => void;

  // Live Mode
  liveMode: boolean;
  toggleLiveMode: () => void;

  // Date Range
  dateRangeDays: number;
  setDateRangeDays: (days: number) => void;

  // Top Bar Filters
  topBarFilters: string[];
  toggleTopBarFilter: (filter: string) => void;

  // Modals
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;

  // Orb
  orbExpanded: boolean;
  setOrbExpanded: (expanded: boolean) => void;

  // Active View
  activeView: 'dashboard' | 'events' | 'users' | 'funnels' | 'alerts' | 'settings';
  setActiveView: (view: UIState['activeView']) => void;

  // Export intents
  exportIntent: { view: UIState['activeView']; id: number } | null;
  requestExport: (view: UIState['activeView']) => void;
  clearExportIntent: () => void;

  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sound Effects
  soundsEnabled: false,
  toggleSounds: () => set((s) => ({ soundsEnabled: !s.soundsEnabled })),
  setSoundsEnabled: (enabled) => set({ soundsEnabled: enabled }),

  // Command Palette
  commandPaletteOpen: false,
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Panels
  leftDockExpanded: false,
  insightRailOpen: true,
  focusMode: false,
  toggleLeftDock: () => set((s) => ({ leftDockExpanded: !s.leftDockExpanded })),
  toggleInsightRail: () => set((s) => ({ insightRailOpen: !s.insightRailOpen })),
  toggleFocusMode: () => set((s) => ({
    focusMode: !s.focusMode,
    leftDockExpanded: false,
    insightRailOpen: !s.focusMode ? false : s.insightRailOpen
  })),

  // Live Mode
  liveMode: true,
  toggleLiveMode: () => set((s) => ({ liveMode: !s.liveMode })),

  // Date Range
  dateRangeDays: 30,
  setDateRangeDays: (days) => set({ dateRangeDays: days }),

  // Top Bar Filters
  topBarFilters: ['All Products', 'Segment: Pro', 'Region: North America', 'Device: Web'],
  toggleTopBarFilter: (filter) => set((s) => ({
    topBarFilters: s.topBarFilters.includes(filter)
      ? s.topBarFilters.filter((item) => item !== filter)
      : [...s.topBarFilters, filter],
  })),

  // Modals
  showShortcuts: false,
  setShowShortcuts: (show) => set({ showShortcuts: show }),
  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),

  // Orb
  orbExpanded: false,
  setOrbExpanded: (expanded) => set({ orbExpanded: expanded }),

  // Active View
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),

  // Export intents
  exportIntent: null,
  requestExport: (view) => set({ exportIntent: { view, id: Date.now() } }),
  clearExportIntent: () => set({ exportIntent: null }),

  // Notifications
  notifications: [],
  addNotification: (notification) => set((s) => ({
    notifications: [...s.notifications, { ...notification, id: crypto.randomUUID() }]
  })),
  removeNotification: (id) => set((s) => ({
    notifications: s.notifications.filter((n) => n.id !== id)
  })),
}));
