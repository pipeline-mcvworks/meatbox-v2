/**
 * Waveform peak generation.
 *
 * IMPORTANT — fallback implementation:
 *
 * Fully decoding an arbitrary recorded audio file to raw PCM samples in pure
 * JavaScript on a React Native runtime is not feasible without a native
 * module. `expo-av` does not expose decoded PCM data — it only gives us
 * playback status (position, duration) and an opaque file URI for the
 * recording on disk. Reading the raw file bytes via `expo-file-system` would
 * give us a container (e.g. .m4a/AAC or .caf) that still requires a decoder.
 *
 * Rather than ship a broken "real" analyzer, this module implements a
 * **best-effort fallback**: it generates a deterministic, visually plausible
 * peaks array from the recording's duration. The peaks have an envelope that
 * loosely resembles speech/percussion (a slow attack, a busy middle, a
 * decaying tail) plus per-bin variation derived from a seeded pseudo-random
 * sequence so the same duration always produces the same waveform.
 *
 * Downstream code should treat the peaks as a UI affordance (so the user
 * sees *something* representative of their recording) rather than as ground
 * truth for analysis. Onset detection (T-008) will operate on real audio via
 * its own pipeline, not on these peaks.
 *
 * If/when a native PCM-decoding module is added (e.g. via a custom Expo
 * config plugin or a library like react-native-audio-toolkit), replace
 * `generatePeaksFromUri` with a real implementation; the rest of the app
 * only depends on the `number[]` shape (values in [0, 1]).
 */

export const DEFAULT_PEAK_COUNT = 256;

/** Fast deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string to a 32-bit integer seed. */
function hashStringToSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Build an envelope value in [0, 1] for a normalized position t in [0, 1].
 * Models a typical short recording: quick attack, sustained body, gentle
 * decay at the end.
 */
function envelope(t: number): number {
  // Attack ramp over the first 5%.
  const attack = Math.min(1, t / 0.05);
  // Decay ramp over the last 15%.
  const decay = t > 0.85 ? Math.max(0, 1 - (t - 0.85) / 0.15) : 1;
  return attack * decay;
}

/**
 * Generate a peaks array directly from a duration.
 *
 * Exported separately so tests / callers without a URI (e.g. preview UI)
 * can produce the same fallback shape.
 */
export function generatePeaksFromDuration(
  durationSeconds: number,
  peakCount: number = DEFAULT_PEAK_COUNT,
  seedKey?: string
): number[] {
  const safeCount = Math.max(1, Math.floor(peakCount));
  const safeDuration = Math.max(0, durationSeconds);

  if (safeDuration <= 0) {
    return new Array(safeCount).fill(0);
  }

  const seed = hashStringToSeed(
    seedKey ?? `dur:${safeDuration.toFixed(3)}:n:${safeCount}`
  );
  const rand = mulberry32(seed);

  const peaks: number[] = new Array(safeCount);
  for (let i = 0; i < safeCount; i++) {
    const t = i / (safeCount - 1 || 1);
    const env = envelope(t);
    // Mix a low-frequency wobble with per-bin noise for variation.
    const wobble = 0.5 + 0.5 * Math.sin(t * Math.PI * 6 + rand() * Math.PI * 2);
    const noise = 0.4 + 0.6 * rand();
    const v = env * (0.55 * wobble + 0.45 * noise);
    peaks[i] = Math.max(0, Math.min(1, v));
  }

  return peaks;
}

/**
 * Generate a normalized peaks array (values in [0, 1]) for a recorded audio
 * file URI. Currently uses the duration-based fallback documented at the top
 * of this file. The URI is used as part of the seed so different recordings
 * of the same length still produce slightly different visuals.
 */
export async function generatePeaksFromUri(
  uri: string,
  durationSeconds: number,
  peakCount: number = DEFAULT_PEAK_COUNT
): Promise<number[]> {
  const seedKey = `${uri}|${durationSeconds.toFixed(3)}|${peakCount}`;
  return generatePeaksFromDuration(durationSeconds, peakCount, seedKey);
}

/**
 * Downsample or upsample an existing peaks array to a target length.
 * Useful when the renderer wants a different bin count than what was stored.
 */
export function resamplePeaks(peaks: number[], targetLength: number): number[] {
  if (targetLength <= 0) return [];
  if (peaks.length === 0) return new Array(targetLength).fill(0);
  if (peaks.length === targetLength) return peaks.slice();

  const out = new Array<number>(targetLength);
  const ratio = peaks.length / targetLength;
  for (let i = 0; i < targetLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.max(start + 1, Math.floor((i + 1) * ratio));
    let max = 0;
    for (let j = start; j < end && j < peaks.length; j++) {
      const v = peaks[j];
      if (v > max) max = v;
    }
    out[i] = max;
  }
  return out;
}
