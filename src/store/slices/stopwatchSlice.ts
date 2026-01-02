import type { StateCreator } from 'zustand';

export interface StopwatchSlice {
  // State
  stopwatchElapsedMs: number;
  stopwatchIsRunning: boolean;
  stopwatchStartTimestamp: number | null; // Date.now() when started, for drift-free timing

  // Actions
  startStopwatch: () => void;
  stopStopwatch: () => void;
  resetStopwatch: () => void;
  tickStopwatch: () => void;
}

export const createStopwatchSlice: StateCreator<StopwatchSlice, [], [], StopwatchSlice> = (set, get) => ({
  // Initial state
  stopwatchElapsedMs: 0,
  stopwatchIsRunning: false,
  stopwatchStartTimestamp: null,

  // Actions
  startStopwatch: () => {
    const { stopwatchIsRunning, stopwatchElapsedMs } = get();
    if (stopwatchIsRunning) return;
    
    set({
      stopwatchIsRunning: true,
      // Store when we started, accounting for any previous elapsed time
      stopwatchStartTimestamp: Date.now() - stopwatchElapsedMs,
    });
  },

  stopStopwatch: () => {
    const { stopwatchIsRunning, stopwatchStartTimestamp } = get();
    if (!stopwatchIsRunning || stopwatchStartTimestamp === null) return;
    
    // Calculate final elapsed time and store it
    const elapsed = Date.now() - stopwatchStartTimestamp;
    set({
      stopwatchIsRunning: false,
      stopwatchElapsedMs: elapsed,
      stopwatchStartTimestamp: null,
    });
  },

  resetStopwatch: () => {
    set({
      stopwatchElapsedMs: 0,
      stopwatchIsRunning: false,
      stopwatchStartTimestamp: null,
    });
  },

  tickStopwatch: () => {
    const { stopwatchIsRunning, stopwatchStartTimestamp } = get();
    if (!stopwatchIsRunning || stopwatchStartTimestamp === null) return;
    
    // Calculate elapsed from start timestamp for drift-free timing
    const elapsed = Date.now() - stopwatchStartTimestamp;
    set({ stopwatchElapsedMs: elapsed });
  },
});
