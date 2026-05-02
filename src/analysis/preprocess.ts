/**
 * Preprocessing for the analysis pipeline.
 *
 * Operates on the peaks array (values in [0, 1]) produced by
 * `src/analysis/waveform.ts`. Real PCM is not available to pure-JS RN code
 * (see waveform.ts for the rationale), so all downstream stages — onset
 * detection, feature extraction, classification — work off this normalised
 * envelope-like sequence.
 *
 * Steps:
 *   1. Treat the input as a mono signal (peaks already represent a single
 *      channel envelope; this is a no-op pass kept for clarity).
 *   2. Normalize so the loudest bin sits at 1.0. Avoids sensitivity
 *      depending on absolute recording volume.
 *   3. Apply a simple noise gate: any bin below `noiseFloor` is zeroed.
 *      This keeps room hiss out of the onset detector.
 */

export type PreprocessOptions = {
  /** Bins below this fraction of the peak (after normalize) are zeroed. */
  noiseFloor?: number;
};

export type PreprocessResult = {
  /** Cleaned, normalized envelope. Same length as input. */
  envelope: number[];
  /** Sample rate of the envelope, in bins per second. */
  binsPerSecond: number;
};

const DEFAULT_NOISE_FLOOR = 0.08;

/**
 * Convert a peaks array + duration into a cleaned envelope ready for onset
 * detection.
 */
export function preprocess(
  peaks: number[],
  durationSeconds: number,
  opts: PreprocessOptions = {}
): PreprocessResult {
  const noiseFloor = opts.noiseFloor ?? DEFAULT_NOISE_FLOOR;

  if (peaks.length === 0 || durationSeconds <= 0) {
    return { envelope: [], binsPerSecond: 0 };
  }

  // 1. mono pass-through (peaks are already a single envelope).
  const mono = peaks.slice();

  // 2. normalize to peak = 1.0
  let max = 0;
  for (let i = 0; i < mono.length; i++) {
    if (mono[i] > max) max = mono[i];
  }
  const norm: number[] = new Array(mono.length);
  if (max > 0) {
    for (let i = 0; i < mono.length; i++) {
      norm[i] = mono[i] / max;
    }
  } else {
    for (let i = 0; i < mono.length; i++) norm[i] = 0;
  }

  // 3. noise gate
  for (let i = 0; i < norm.length; i++) {
    if (norm[i] < noiseFloor) norm[i] = 0;
  }

  const binsPerSecond = mono.length / durationSeconds;
  return { envelope: norm, binsPerSecond };
}
