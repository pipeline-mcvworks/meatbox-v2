/**
 * Feature extraction around each detected hit.
 *
 * NOTE — fallback features:
 *
 * A proper classifier would compute spectral features (centroid, rolloff,
 * MFCCs) from FFTs of windowed PCM. We don't have PCM in pure-JS RN, so the
 * "spectral" features below are time-domain proxies computed from the
 * envelope produced by preprocess.ts:
 *
 *   - `energy`: mean amplitude in the post-onset window.
 *   - `peakAmplitude`: max amplitude in the window (kick/clap proxy).
 *   - `decayRate`: how quickly the envelope falls after the onset.
 *                  Fast decay → percussive/high (hat). Slow decay → kick/snare body.
 *   - `zeroCrossingRate`: rate at which the envelope crosses its mean. The
 *                  envelope already collapses fine timing detail, so this is
 *                  a coarse "busyness" proxy rather than true ZCR. Higher
 *                  values correlate with hi-hat-like noise content.
 *   - `centroidProxy`: weighted mean of bin index within the window,
 *                  normalised to [0,1]. Higher values mean energy is
 *                  concentrated late in the window — a weak proxy for
 *                  brighter/sharper transients.
 *
 * These are intentionally cheap. They're sufficient to separate
 * kick/snare/hat with reasonable accuracy on mouth percussion, and the
 * pipeline's confidence score reflects the imprecision honestly.
 */

import type { DetectedHit } from './onsetDetection';

export type HitFeatures = {
  energy: number;
  peakAmplitude: number;
  decayRate: number;
  zeroCrossingRate: number;
  centroidProxy: number;
};

export type FeatureExtractionOptions = {
  /** Window length in seconds analysed after each onset. */
  windowSeconds?: number;
};

const DEFAULT_WINDOW_SECONDS = 0.08; // 80ms

export function extractFeatures(
  envelope: number[],
  binsPerSecond: number,
  hit: DetectedHit,
  opts: FeatureExtractionOptions = {}
): HitFeatures {
  const windowSeconds = opts.windowSeconds ?? DEFAULT_WINDOW_SECONDS;

  if (envelope.length === 0 || binsPerSecond <= 0) {
    return zeroFeatures();
  }

  const start = hit.binIndex;
  const windowBins = Math.max(2, Math.round(windowSeconds * binsPerSecond));
  const end = Math.min(envelope.length, start + windowBins);

  if (end <= start + 1) return zeroFeatures();

  let sum = 0;
  let peak = 0;
  let weightedIndexSum = 0;
  let crossings = 0;
  let prevSign = 0;

  // First pass: peak + sum to compute mean (used by ZCR)
  for (let i = start; i < end; i++) {
    const v = envelope[i];
    sum += v;
    if (v > peak) peak = v;
  }
  const len = end - start;
  const mean = sum / len;

  // Second pass: weighted centroid + zero-crossings around mean
  for (let i = start; i < end; i++) {
    const v = envelope[i];
    const offset = i - start;
    weightedIndexSum += v * offset;

    const sign = v - mean >= 0 ? 1 : -1;
    if (prevSign !== 0 && sign !== prevSign) crossings++;
    prevSign = sign;
  }

  const energy = mean;
  const peakAmplitude = peak;

  // Decay rate: ratio of (peak - amplitude at end of window) to peak.
  // 1.0 = fully decayed, 0.0 = held flat. Clamped.
  const tail = envelope[end - 1] ?? 0;
  const decayRate =
    peak > 0 ? clamp01((peak - tail) / peak) : 0;

  const zeroCrossingRate = crossings / len;

  // Centroid proxy in [0,1]: 0 → energy at start, 1 → energy at end.
  const centroidProxy =
    sum > 0 ? clamp01(weightedIndexSum / sum / Math.max(1, len - 1)) : 0;

  return {
    energy,
    peakAmplitude,
    decayRate,
    zeroCrossingRate,
    centroidProxy,
  };
}

function zeroFeatures(): HitFeatures {
  return {
    energy: 0,
    peakAmplitude: 0,
    decayRate: 0,
    zeroCrossingRate: 0,
    centroidProxy: 0,
  };
}

function clamp01(v: number): number {
  if (!isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
