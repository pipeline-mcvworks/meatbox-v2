/**
 * Audio-related types for raw recordings and analysis pipeline.
 */

/** Reference to a raw audio recording stored on device. */
export interface RawRecordingRef {
  /** Unique identifier for this recording. */
  id: string;
  /** File URI (local path or content URI). */
  uri: string;
  /** Duration of the recording in seconds. */
  durationSeconds: number;
  /** Unix timestamp (ms) when the recording was captured. */
  capturedAt: number;
  /** Sample rate of the recording in Hz (e.g. 44100). */
  sampleRate: number;
  /** Number of audio channels (1 = mono, 2 = stereo). */
  channels: number;
}

/** A single percussion hit detected by the analysis pipeline. */
export interface DetectedHit {
  /** Time offset from the start of the recording in seconds. */
  timeSeconds: number;
  /** Normalised confidence score [0, 1] from the detector. */
  confidence: number;
  /**
   * Rough onset energy / loudness at detection time, normalised [0, 1].
   * Used to set initial velocity on the resulting TimelineEvent.
   */
  energy: number;
  /** The recording this hit was detected in. */
  recordingId: string;
}
