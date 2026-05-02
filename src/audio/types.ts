// ---------------------------------------------------------------------------
// Audio service interfaces
// ---------------------------------------------------------------------------

export type LaneType = 'kick' | 'snare' | 'hat' | 'perc' | 'unknown';

/** Velocity is 0–1 */
export type Velocity = number;

// ---------------------------------------------------------------------------
// Recorder
// ---------------------------------------------------------------------------

export interface IAudioRecorderService {
  /** Request microphone permission. Returns the resulting status. */
  requestPermission(): Promise<'granted' | 'denied' | 'undetermined'>;

  /** Start a new recording session. Resolves when recording has begun. */
  start(): Promise<void>;

  /**
   * Stop the current recording.
   * Returns the local URI of the recorded file and its duration in seconds.
   */
  stop(): Promise<{ uri: string; durationSeconds: number }>;

  /** Returns the URI of the most recent recording, or null if none. */
  getRecordingUri(): string | null;

  /** Returns the duration of the most recent recording in seconds. */
  getDurationSeconds(): number;
}

// ---------------------------------------------------------------------------
// Playback
// ---------------------------------------------------------------------------

export interface IAudioPlaybackService {
  /**
   * Pre-load a sample for the given lane.
   * Must be called before playSample.
   */
  loadSample(lane: LaneType): Promise<void>;

  /**
   * Trigger playback of the sample for the given lane.
   * velocity (0–1) maps to volume.
   */
  playSample(lane: LaneType, velocity: Velocity): Promise<void>;

  /** Unload all loaded samples and release resources. */
  unloadAll(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Scheduler
// ---------------------------------------------------------------------------

export type ScheduledEvent = {
  /** Beat position (0-based, fractional beats allowed) */
  startBeat: number;
  lane: LaneType;
  velocity: Velocity;
};

export type TickCallback = (currentBeat: number) => void;

export interface ISampleScheduler {
  /**
   * Start playback of the given event list at the given BPM.
   * If loop is true, wraps around after the last event.
   */
  start(events: ScheduledEvent[], bpm: number, loop: boolean): void;

  /** Stop playback immediately. */
  stop(): void;

  /**
   * Register a callback that fires on every scheduler tick
   * with the current playhead beat position. Returns an
   * unsubscribe function. Subscribers persist across start/stop;
   * subscribe once at mount, unsubscribe at unmount.
   */
  onTick(callback: TickCallback): () => void;
}
