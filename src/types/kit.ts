/**
 * Drum kit and sample configuration types.
 */

/** Broad category for a drum sample, used for display grouping. */
export type SampleCategory = 'kick' | 'snare' | 'hihat' | 'tom' | 'cymbal' | 'percussion' | 'fx';

/** A single drum sample asset. */
export interface DrumSample {
  /** Unique identifier for this sample. */
  id: string;
  /** Human-readable name (e.g. "Boom Kick 01"). */
  name: string;
  /** Asset URI – can be a bundled require() result path or a file URI. */
  uri: string;
  /** Broad category this sample belongs to. */
  category: SampleCategory;
  /** Duration of the sample in seconds. */
  durationSeconds: number;
  /** Optional: base pitch of the sample in MIDI note number. */
  basePitch?: number;
}

/** A complete drum kit: a named collection of samples. */
export interface DrumKitConfig {
  /** Unique identifier for this kit. */
  id: string;
  /** Human-readable kit name (e.g. "Classic Boom Bap"). */
  name: string;
  /** All samples that belong to this kit, keyed by sample id. */
  samples: Record<string, DrumSample>;
  /**
   * Mapping from LaneType to the default sample id used for that lane.
   * Allows a project to say "kick lane uses sample X from this kit".
   */
  defaultSampleIds: Partial<Record<string, string>>;
}
