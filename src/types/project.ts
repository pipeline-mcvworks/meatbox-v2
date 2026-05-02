/**
 * Top-level project type aggregating all other model types.
 */

import type { RawRecordingRef } from './audio';
import type { DrumKitConfig } from './kit';
import type { TimelineLane, TimelineEvent } from './timeline';

/** Time signature expressed as [numerator, denominator]. */
export type TimeSignature = [number, number];

/** The root document type for a MouthBeat project. */
export interface MouthBeatProject {
  /** Unique identifier for this project. */
  id: string;
  /** Human-readable project name. */
  name: string;
  /** Project tempo in beats per minute. */
  bpm: number;
  /** Time signature, e.g. [4, 4] or [3, 4]. */
  timeSignature: TimeSignature;
  /** Total length of the project in bars. */
  bars: number;
  /** Unix timestamp (ms) when the project was created. */
  createdAt: number;
  /** Unix timestamp (ms) of the last modification. */
  updatedAt: number;
  /** All timeline lanes in display order. */
  lanes: TimelineLane[];
  /** All timeline events across all lanes. */
  events: TimelineEvent[];
  /** The drum kit configuration used by this project. */
  kit: DrumKitConfig;
  /**
   * Raw recordings attached to this project.
   * Keyed by RawRecordingRef.id for O(1) lookup.
   */
  recordings: Record<string, RawRecordingRef>;
  /** Optional freeform notes / description written by the user. */
  description?: string;
}
