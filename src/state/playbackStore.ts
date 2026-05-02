import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoopRegion = {
  /** Start of the loop region in beats */
  startBeat: number;
  /** End of the loop region in beats */
  endBeat: number;
};

export type PlaybackState = {
  /** Whether the sequencer is currently playing */
  isPlaying: boolean;
  /** Current playhead position in beats */
  playheadBeat: number;
  /** Whether loop mode is active */
  loopEnabled: boolean;
  /** The active loop region (null = full project loop) */
  loopRegion: LoopRegion | null;

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (beat: number) => void;
  setLoopEnabled: (enabled: boolean) => void;
  setLoopRegion: (region: LoopRegion | null) => void;
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePlaybackStore = create<PlaybackState>((set) => ({
  isPlaying: false,
  playheadBeat: 0,
  loopEnabled: true,
  loopRegion: null,

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  stop: () => set({ isPlaying: false, playheadBeat: 0 }),

  seekTo: (beat) => set({ playheadBeat: beat }),

  setLoopEnabled: (loopEnabled) => set({ loopEnabled }),

  setLoopRegion: (loopRegion) => set({ loopRegion }),
}));
