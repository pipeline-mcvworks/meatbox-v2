/**
 * Quantize a time (in seconds) to the nearest 1/16-note grid for a given BPM.
 *
 * Strength is in [0, 100]:
 *   - 0   → no quantization, returns input unchanged.
 *   - 100 → snap fully to grid.
 *   - In between, linearly interpolate between the original and snapped time.
 */

export type QuantizeOptions = {
  /** [0, 100] strength. Defaults to 100. */
  strength?: number;
  /** Grid divisions per beat. Defaults to 4 (= 1/16 notes when beat = quarter). */
  divisionsPerBeat?: number;
};

export function quantizeTime(
  timeSeconds: number,
  bpm: number,
  opts: QuantizeOptions = {}
): number {
  const strength = clamp(opts.strength ?? 100, 0, 100) / 100;
  const divisionsPerBeat = opts.divisionsPerBeat ?? 4;

  if (bpm <= 0 || divisionsPerBeat <= 0) return timeSeconds;
  if (strength === 0) return timeSeconds;

  const secondsPerBeat = 60 / bpm;
  const gridSeconds = secondsPerBeat / divisionsPerBeat;

  const snapped = Math.round(timeSeconds / gridSeconds) * gridSeconds;
  return timeSeconds + (snapped - timeSeconds) * strength;
}

function clamp(v: number, lo: number, hi: number): number {
  if (!isFinite(v)) return lo;
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}
