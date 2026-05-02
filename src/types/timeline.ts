/**
 * Timeline types: lanes, events, and lane classification.
 */

/**
 * The logical role of a timeline lane.
 * Drives both UI colour-coding and the analysis classifier target.
 */
export type LaneType =
  | 'kick'
  | 'snare'
  | 'hihat_closed'
  | 'hihat_open'
  | 'tom_high'
  | 'tom_mid'
  | 'tom_low'
  | 'cymbal'
  | 'percussion'
  | 'custom';

/** A single placed note / hit on the timeline. */
export interface TimelineEvent {
  /** Unique identifier for this event. */
  id: string;
  /** Beat position from the start of the project (1-based, fractional). */
  beat: number;
  /**
   * Duration in beats.
   * For one-shot drum hits this is typically a small value (e.g. 0.25).
   */
  durationBeats: number;
  /** Velocity / loudness [0, 1]. */
  velocity: number;
  /** The lane this event belongs to. */
  laneId: string;
  /**
   * Optional reference to the raw recording that produced this event
   * (populated after analysis; absent for manually placed events).
   */
  sourceRecordingId?: string;
  /** Optional reference to the specific DetectedHit index within the recording. */
  sourceHitIndex?: number;
}

/** A single horizontal lane in the timeline (one instrument / voice). */
export interface TimelineLane {
  /** Unique identifier for this lane. */
  id: string;
  /** Human-readable label shown in the UI. */
  label: string;
  /** Logical type of this lane. */
  type: LaneType;
  /**
   * The sample id (from the project's DrumKitConfig) assigned to this lane.
   * When null the lane is muted / unassigned.
   */
  sampleId: string | null;
  /** Whether this lane is currently muted. */
  muted: boolean;
  /** Whether this lane is soloed. */
  soloed: boolean;
  /** Per-lane volume multiplier [0, 2], default 1. */
  volume: number;
  /** Per-lane stereo pan [-1 (L), 1 (R)], default 0. */
  pan: number;
}
