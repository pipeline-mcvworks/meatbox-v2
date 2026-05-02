/**
 * Onset detection over a preprocessed envelope.
 *
 * We don't have raw PCM, so a spectral-flux onset detector isn't available.
 * Instead we treat the envelope as an amplitude curve and pick local maxima
 * that exceed a sensitivity-driven threshold, then dedupe anything closer
 * than `minDistanceSeconds` to its predecessor.
 *
 * Sensitivity is in [0, 1]:
 *   - 0.0  → very strict, only the loudest peaks survive
 *   - 0.5  → balanced default
 *   - 1.0  → permissive, picks up quiet ghost notes
 */

export type DetectedHit = {
  /** Index into the envelope array where the peak was found. */
  binIndex: number;
  /** Time in seconds from the start of the recording. */
  timeSeconds: number;
  /** Envelope amplitude at the peak, in [0, 1]. */
  amplitude: number;
};

export type OnsetDetectionOptions = {
  /** [0,1] sensitivity. Higher = more hits. */
  sensitivity?: number;
  /** Minimum spacing between detected hits, in seconds. */
  minDistanceSeconds?: number;
};

const DEFAULT_SENSITIVITY = 0.5;
const DEFAULT_MIN_DISTANCE_SECONDS = 0.06; // 60ms — ~16th notes at 250bpm

/**
 * Detect onsets in a normalized envelope.
 */
export function detectOnsets(
  envelope: number[],
  binsPerSecond: number,
  opts: OnsetDetectionOptions = {}
): DetectedHit[] {
  const sensitivity = clamp01(opts.sensitivity ?? DEFAULT_SENSITIVITY);
  const minDistanceSeconds =
    opts.minDistanceSeconds ?? DEFAULT_MIN_DISTANCE_SECONDS;

  if (envelope.length === 0 || binsPerSecond <= 0) return [];

  // Threshold: at sensitivity=0 we require ~0.6 of peak; at 1.0 we require ~0.05.
  // Linear interpolation gives a wide, predictable range.
  const threshold = lerp(0.6, 0.05, sensitivity);

  const minDistanceBins = Math.max(1, Math.round(minDistanceSeconds * binsPerSecond));

  const hits: DetectedHit[] = [];
  let lastAcceptedBin = -Infinity;

  for (let i = 1; i < envelope.length - 1; i++) {
    const v = envelope[i];
    if (v < threshold) continue;

    // Local maximum: strictly greater than left neighbour, >= right neighbour.
    // The asymmetric comparison breaks plateaus deterministically on the
    // leading edge, which matches what a human ear hears as the onset.
    if (v <= envelope[i - 1] || v < envelope[i + 1]) continue;

    if (i - lastAcceptedBin < minDistanceBins) {
      // Too close to last hit. Keep whichever is louder.
      const last = hits[hits.length - 1];
      if (last && v > last.amplitude) {
        last.binIndex = i;
        last.timeSeconds = i / binsPerSecond;
        last.amplitude = v;
        lastAcceptedBin = i;
      }
      continue;
    }

    hits.push({
      binIndex: i,
      timeSeconds: i / binsPerSecond,
      amplitude: v,
    });
    lastAcceptedBin = i;
  }

  return hits;
}

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
