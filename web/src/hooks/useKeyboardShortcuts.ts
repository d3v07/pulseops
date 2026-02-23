import { useHotkeys } from 'react-hotkeys-hook';
import { useUIStore } from '../stores/uiStore';

export function useKeyboardShortcuts() {
  const { toggleCommandPalette, toggleLiveMode, toggleInsightRail } = useUIStore();

  // Command Palette
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    toggleCommandPalette();
  }, { enableOnFormTags: true });

  // Live Mode
  useHotkeys('mod+l', (e) => {
    e.preventDefault();
    toggleLiveMode();
  });

  // Toggle Insight Rail
  useHotkeys('mod+i', (e) => {
    e.preventDefault();
    toggleInsightRail();
  });

  // Focus Mode (collapse panels)
  useHotkeys('mod+\\', (e) => {
    e.preventDefault();
    useUIStore.getState().toggleFocusMode();
  });

  // Keyboard shortcuts help
  useHotkeys('mod+/', (e) => {
    e.preventDefault();
    useUIStore.getState().setShowShortcuts(true);
  });
}
