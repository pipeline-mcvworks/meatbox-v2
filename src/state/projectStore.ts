import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AudioEvent = {
  id: string;
  /** Beat position where the event starts (0-indexed, fractional beats allowed) */
  beat: number;
  /** Duration in beats */
  duration: number;
  /** Reference to a kit sound slot by name */
  soundId: string;
  /** Recorded audio URI, if any */
  audioUri?: string;
  /** Gain multiplier (1.0 = unity) */
  gain: number;
  /** Pitch shift in semitones */
  pitchShift: number;
};

export type Lane = {
  id: string;
  name: string;
  /** Ordered list of events on this lane */
  events: AudioEvent[];
  /** Whether the lane is muted */
  muted: boolean;
  /** Whether the lane is soloed */
  soloed: boolean;
  /** Lane volume (0–1) */
  volume: number;
};

export type KitSound = {
  id: string;
  name: string;
  /** Bundled asset URI or recorded URI */
  uri?: string;
};

export type Kit = {
  id: string;
  name: string;
  sounds: KitSound[];
};

/**
 * Reference to the most recent raw mouth-percussion recording, used by the
 * Analyze screen to render a waveform and (eventually) drive onset detection.
 */
export type RawRecordingRef = {
  /** Local file URI of the recorded audio. */
  uri: string;
  /** Duration of the recording in seconds. */
  durationSeconds: number;
  /** Normalised peak samples (values in [0, 1]) for waveform rendering. */
  peaks: number[];
  /** ISO timestamp of when the recording finished. */
  recordedAt: string;
};

/**
 * Output of the analysis pipeline (T-008). One per detected hit.
 *
 * `originalTimeSeconds` is the unmodified onset time as detected. It's
 * preserved across re-runs of the pipeline whenever a hit at the same
 * approximate time is re-detected, so the user never loses their record
 * of where a hit really was.
 *
 * `quantizedTimeSeconds` is the snapped time used for playback / display.
 */
export type TimelineEventLabel = 'kick' | 'snare' | 'hat' | 'perc' | 'unknown';

export type TimelineEvent = {
  id: string;
  label: TimelineEventLabel;
  /** [0, 1] classifier confidence. */
  confidence: number;
  /** Original detected onset time in seconds. */
  originalTimeSeconds: number;
  /** Quantized onset time in seconds. */
  quantizedTimeSeconds: number;
  /** Amplitude of the detected onset, in [0, 1]. */
  amplitude: number;
};

export type Project = {
  id: string;
  name: string;
  bpm: number;
  /** Total length of the loop in beats */
  loopLengthBeats: number;
  lanes: Lane[];
  kit: Kit;
  /** Analysis pipeline output for the current recording. */
  events: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Demo project (initial state from T-002)
// ---------------------------------------------------------------------------

const DEMO_KIT: Kit = {
  id: 'kit-demo',
  name: 'Demo Kit',
  sounds: [
    { id: 'kick',  name: 'Kick'  },
    { id: 'snare', name: 'Snare' },
    { id: 'hihat', name: 'Hi-Hat' },
    { id: 'bass',  name: 'Bass'  },
    { id: 'vox',   name: 'Vox'   },
  ],
};

const DEMO_PROJECT: Project = {
  id: 'project-demo',
  name: 'Demo Beat',
  bpm: 90,
  loopLengthBeats: 16,
  kit: DEMO_KIT,
  events: [],
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  lanes: [
    {
      id: 'lane-kick',
      name: 'Kick',
      muted: false,
      soloed: false,
      volume: 1,
      events: [
        { id: 'ev-k1', beat: 0,  duration: 0.5, soundId: 'kick',  gain: 1, pitchShift: 0 },
        { id: 'ev-k2', beat: 4,  duration: 0.5, soundId: 'kick',  gain: 1, pitchShift: 0 },
        { id: 'ev-k3', beat: 8,  duration: 0.5, soundId: 'kick',  gain: 1, pitchShift: 0 },
        { id: 'ev-k4', beat: 12, duration: 0.5, soundId: 'kick',  gain: 1, pitchShift: 0 },
      ],
    },
    {
      id: 'lane-snare',
      name: 'Snare',
      muted: false,
      soloed: false,
      volume: 1,
      events: [
        { id: 'ev-s1', beat: 2,  duration: 0.5, soundId: 'snare', gain: 1, pitchShift: 0 },
        { id: 'ev-s2', beat: 6,  duration: 0.5, soundId: 'snare', gain: 1, pitchShift: 0 },
        { id: 'ev-s3', beat: 10, duration: 0.5, soundId: 'snare', gain: 1, pitchShift: 0 },
        { id: 'ev-s4', beat: 14, duration: 0.5, soundId: 'snare', gain: 1, pitchShift: 0 },
      ],
    },
    {
      id: 'lane-hihat',
      name: 'Hi-Hat',
      muted: false,
      soloed: false,
      volume: 0.8,
      events: [
        { id: 'ev-h1', beat: 0,  duration: 0.25, soundId: 'hihat', gain: 0.8, pitchShift: 0 },
        { id: 'ev-h2', beat: 1,  duration: 0.25, soundId: 'hihat', gain: 0.8, pitchShift: 0 },
        { id: 'ev-h3', beat: 2,  duration: 0.25, soundId: 'hihat', gain: 0.8, pitchShift: 0 },
        { id: 'ev-h4', beat: 3,  duration: 0.25, soundId: 'hihat', gain: 0.8, pitchShift: 0 },
        { id: 'ev-h5', beat: 4,  duration: 0.25, soundId: 'hihat', gain: 0.8, pitchShift: 0 },
        { id: 'ev-h6', beat: 5,  duration: 0.25, soundId: 'hihat', gain: 0.8, pitchShift: 0 },
        { id: 'ev-h7', beat: 6,  duration: 0.25, soundId: 'hihat', gain: 0.8, pitchShift: 0 },
        { id: 'ev-h8', beat: 7,  duration: 0.25, soundId: 'hihat', gain: 0.8, pitchShift: 0 },
      ],
    },
    {
      id: 'lane-bass',
      name: 'Bass',
      muted: false,
      soloed: false,
      volume: 1,
      events: [
        { id: 'ev-b1', beat: 0, duration: 1, soundId: 'bass', gain: 1, pitchShift: 0 },
        { id: 'ev-b2', beat: 3, duration: 1, soundId: 'bass', gain: 1, pitchShift: 0 },
        { id: 'ev-b3', beat: 8, duration: 1, soundId: 'bass', gain: 1, pitchShift: 0 },
        { id: 'ev-b4', beat: 11, duration: 1, soundId: 'bass', gain: 1, pitchShift: 0 },
      ],
    },
    {
      id: 'lane-vox',
      name: 'Vox',
      muted: false,
      soloed: false,
      volume: 1,
      events: [],
    },
  ],
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export type ProjectState = {
  project: Project;
  /** Most recent raw mouth recording, if any. */
  rawRecording: RawRecordingRef | null;

  // Actions
  setProject: (project: Project) => void;
  setBpm: (bpm: number) => void;
  addEvent: (laneId: string, event: AudioEvent) => void;
  updateEvent: (laneId: string, eventId: string, patch: Partial<AudioEvent>) => void;
  deleteEvent: (laneId: string, eventId: string) => void;
  setRawRecording: (rec: RawRecordingRef | null) => void;
  /** Replace the analysis pipeline output. */
  setTimelineEvents: (events: TimelineEvent[]) => void;
  /** Clear analysis pipeline output. */
  clearTimelineEvents: () => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  project: DEMO_PROJECT,
  rawRecording: null,

  setProject: (project) =>
    set({ project }),

  setBpm: (bpm) =>
    set((state) => ({
      project: {
        ...state.project,
        bpm,
        updatedAt: new Date().toISOString(),
      },
    })),

  addEvent: (laneId, event) =>
    set((state) => ({
      project: {
        ...state.project,
        updatedAt: new Date().toISOString(),
        lanes: state.project.lanes.map((lane) =>
          lane.id === laneId
            ? { ...lane, events: [...lane.events, event] }
            : lane
        ),
      },
    })),

  updateEvent: (laneId, eventId, patch) =>
    set((state) => ({
      project: {
        ...state.project,
        updatedAt: new Date().toISOString(),
        lanes: state.project.lanes.map((lane) =>
          lane.id === laneId
            ? {
                ...lane,
                events: lane.events.map((ev) =>
                  ev.id === eventId ? { ...ev, ...patch } : ev
                ),
              }
            : lane
        ),
      },
    })),

  deleteEvent: (laneId, eventId) =>
    set((state) => ({
      project: {
        ...state.project,
        updatedAt: new Date().toISOString(),
        lanes: state.project.lanes.map((lane) =>
          lane.id === laneId
            ? { ...lane, events: lane.events.filter((ev) => ev.id !== eventId) }
            : lane
        ),
      },
    })),

  setRawRecording: (rec) => set({ rawRecording: rec }),

  setTimelineEvents: (events) =>
    set((state) => ({
      project: {
        ...state.project,
        events,
        updatedAt: new Date().toISOString(),
      },
    })),

  clearTimelineEvents: () =>
    set((state) => ({
      project: {
        ...state.project,
        events: [],
        updatedAt: new Date().toISOString(),
      },
    })),
}));
