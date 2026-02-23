/**
 * PulseOps Sound Design System
 *
 * Optional, toggleable sound effects for UI interactions.
 * Subtle, professional tones inspired by Raycast and Linear.
 *
 * All sounds are generated using Web Audio API - no external files needed.
 */

// ============================================
// SOUND CONTEXT & SETTINGS
// ============================================

interface SoundSettings {
  enabled: boolean;
  volume: number; // 0 to 1
}

let settings: SoundSettings = {
  enabled: false, // Off by default - opt-in experience
  volume: 0.3,
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function enableSounds(enable: boolean): void {
  settings.enabled = enable;
  localStorage.setItem('pulseops-sounds', JSON.stringify(settings));
}

export function setVolume(volume: number): void {
  settings.volume = Math.max(0, Math.min(1, volume));
  localStorage.setItem('pulseops-sounds', JSON.stringify(settings));
}

export function loadSoundSettings(): SoundSettings {
  const stored = localStorage.getItem('pulseops-sounds');
  if (stored) {
    settings = JSON.parse(stored);
  }
  return settings;
}

// ============================================
// SOUND GENERATORS
// ============================================

/**
 * Soft click - for button presses
 * A subtle, high-pitched click
 */
export function playClick(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.setValueAtTime(800, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

  gainNode.gain.setValueAtTime(settings.volume * 0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.05);
}

/**
 * Success chime - for completed actions
 * A pleasant ascending tone
 */
export function playSuccess(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();

  // Two quick ascending notes
  [440, 554].forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
    gainNode.gain.linearRampToValueAtTime(settings.volume * 0.2, ctx.currentTime + i * 0.1 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);

    oscillator.start(ctx.currentTime + i * 0.1);
    oscillator.stop(ctx.currentTime + i * 0.1 + 0.15);
  });
}

/**
 * Error tone - for failed actions
 * A subtle low buzz
 */
export function playError(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.setValueAtTime(200, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.15);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(settings.volume * 0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
}

/**
 * Notification ping - for alerts
 * A clear, attention-getting tone
 */
export function playNotification(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(settings.volume * 0.2, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
}

/**
 * Toggle on - for switch activation
 * A bright, upward blip
 */
export function playToggleOn(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(settings.volume * 0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.08);
}

/**
 * Toggle off - for switch deactivation
 * A softer, downward blip
 */
export function playToggleOff(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.setValueAtTime(600, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(settings.volume * 0.12, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.08);
}

/**
 * Achievement fanfare - for milestones
 * A celebratory ascending arpeggio
 */
export function playAchievement(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const startTime = ctx.currentTime + i * 0.08;
    oscillator.frequency.setValueAtTime(freq, startTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(settings.volume * 0.2, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  });
}

/**
 * Refresh whoosh - for data refresh
 * A quick swoosh sound
 */
export function playRefresh(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // White noise-like effect using frequency modulation
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(100, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.Q.setValueAtTime(0.5, ctx.currentTime);

  gainNode.gain.setValueAtTime(settings.volume * 0.08, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
}

/**
 * Typing tick - for keyboard input
 * A very subtle mechanical tick
 */
export function playType(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
  oscillator.type = 'square';

  gainNode.gain.setValueAtTime(settings.volume * 0.03, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.015);
}

/**
 * Navigation pop - for page transitions
 * A soft pop sound
 */
export function playNavigate(): void {
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.setValueAtTime(500, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(settings.volume * 0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.05);
}

// ============================================
// SOUND HOOK FOR REACT
// ============================================

import { useCallback, useEffect, useState } from 'react';

export function useSounds() {
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(settings);

  useEffect(() => {
    setSoundSettings(loadSoundSettings());
  }, []);

  const toggleSounds = useCallback((enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !soundSettings.enabled;
    enableSounds(newEnabled);
    setSoundSettings(prev => ({ ...prev, enabled: newEnabled }));

    // Play a confirmation sound when enabling
    if (newEnabled) {
      setTimeout(playSuccess, 100);
    }
  }, [soundSettings.enabled]);

  const updateVolume = useCallback((volume: number) => {
    setVolume(volume);
    setSoundSettings(prev => ({ ...prev, volume }));
  }, []);

  return {
    enabled: soundSettings.enabled,
    volume: soundSettings.volume,
    toggleSounds,
    setVolume: updateVolume,
    play: {
      click: playClick,
      success: playSuccess,
      error: playError,
      notification: playNotification,
      toggleOn: playToggleOn,
      toggleOff: playToggleOff,
      achievement: playAchievement,
      refresh: playRefresh,
      type: playType,
      navigate: playNavigate,
    },
  };
}

// ============================================
// EXPORTS
// ============================================

export const sounds = {
  click: playClick,
  success: playSuccess,
  error: playError,
  notification: playNotification,
  toggleOn: playToggleOn,
  toggleOff: playToggleOff,
  achievement: playAchievement,
  refresh: playRefresh,
  type: playType,
  navigate: playNavigate,
};
