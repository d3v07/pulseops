import { create } from 'zustand';
import type { Command } from '../types';

interface CommandState {
  commands: Command[];
  recentCommands: string[];
  registerCommand: (command: Command) => void;
  unregisterCommand: (id: string) => void;
  executeCommand: (id: string) => void;
  getRecentCommands: () => Command[];
}

export const useCommandStore = create<CommandState>((set, get) => ({
  commands: [],
  recentCommands: [],

  registerCommand: (command) => set((s) => ({
    commands: [...s.commands.filter(c => c.id !== command.id), command]
  })),

  unregisterCommand: (id) => set((s) => ({
    commands: s.commands.filter(c => c.id !== id)
  })),

  executeCommand: (id) => {
    const command = get().commands.find(c => c.id === id);
    if (command) {
      command.action();
      set((s) => ({
        recentCommands: [id, ...s.recentCommands.filter(r => r !== id)].slice(0, 10)
      }));
    }
  },

  getRecentCommands: () => {
    const { commands, recentCommands } = get();
    return recentCommands
      .map(id => commands.find(c => c.id === id))
      .filter((c): c is Command => c !== undefined);
  },
}));
