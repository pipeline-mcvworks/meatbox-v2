/**
 * Heuristic hit classifier.
 *
 * Maps the time-domain feature proxies from featureExtraction.ts to one of
 * { kick, snare, hat, perc, unknown } with a confidence score in [0, 1].
 *
 * The rules are deliberately simple and tuned for mouth percussion:
 *
 *   - kick:  high peak, slow-to-medium decay, low zero-crossing rate, low centroid.
 *   - snare: medium peak, medium decay, medium-to-high ZCR, mid centroid.
 *   - hat:   lower peak, fast decay, high ZCR.
 *   - perc:  doesn't fit cleanly above but has clear energy.
 *   - unknown: very low energy.
 *
 * Confidence is the margin between the winning class score and the runner-up,
 * normalized — so two equally-likely candidates produce a low-confidence
 * result rather than a spurious one.
 */

import type { HitFeatures } from './featureExtraction';

export type HitClass = 'kick' | 'snare' | 'hat' | 'perc' | 'unknown';

export type Classification = {
  label: HitClass;
  confidence: number;
  /** Per-class scores, exposed for debugging/tuning. */
  scores: Record<HitClass, number>;
};

export function classifyHit(features: HitFeatures): Classification {
  const { energy, peakAmplitude, decayRate, zeroCrossingRate, centroidProxy } =
    features;

  if (energy < 0.02 && peakAmplitude < 0.05) {
    return {
      label: 'unknown',
      confidence: 0.2,
      scores: { kick: 0, snare: 0, hat: 0, perc: 0, unknown: 1 },
    };
  }

  // Each score is a weighted sum of (feature matches expectation).
  // Higher = more like that class.
  const kickScore =
    weight(peakAmplitude, 0.7, 1.0) * 1.2 +
    weight(1 - decayRate, 0.4, 0.9) * 1.0 +
    weight(1 - zeroCrossingRate, 0.6, 1.0) * 0.8 +
    weight(1 - centroidProxy, 0.5, 1.0) * 0.6;

  const snareScore =
    weight(peakAmplitude, 0.4, 0.85) * 1.0 +
    weight(decayRate, 0.4, 0.8) * 0.9 +
    weight(zeroCrossingRate, 0.25, 0.6) * 1.1 +
    weight(centroidProxy, 0.3, 0.7) * 0.7;

  const hatScore =
    weight(peakAmplitude, 0.1, 0.6) * 0.9 +
    weight(decayRate, 0.7, 1.0) * 1.2 +
    weight(zeroCrossingRate, 0.5, 1.0) * 1.3 +
    weight(centroidProxy, 0.5, 1.0) * 0.8;

  const percScore =
    weight(peakAmplitude, 0.2, 0.8) * 0.6 +
    weight(decayRate, 0.3, 0.8) * 0.6 +
    weight(zeroCrossingRate, 0.2, 0.7) * 0.6 +
    0.4; // baseline catch-all

  const scores: Record<HitClass, number> = {
    kick: kickScore,
    snare: snareScore,
    hat: hatScore,
    perc: percScore,
    unknown: 0,
  };

  // Pick winner.
  let winner: HitClass = 'perc';
  let winnerScore = -Infinity;
  let runnerUp = -Infinity;
  (Object.keys(scores) as HitClass[]).forEach((k) => {
    const s = scores[k];
    if (s > winnerScore) {
      runnerUp = winnerScore;
      winnerScore = s;
      winner = k;
    } else if (s > runnerUp) {
      runnerUp = s;
    }
  });

  // Confidence = normalised margin, plus a floor so anything classified at
  // all has at least 0.3 confidence (we wouldn't have produced a label
  // otherwise).
  const margin = winnerScore - Math.max(0, runnerUp);
  const totalish = Math.max(0.0001, winnerScore + Math.max(0, runnerUp));
  const rawConf = margin / totalish;
  const confidence = clamp(0.3 + 0.65 * rawConf, 0, 0.99);

  return { label: winner, confidence, scores };
}

/**
 * Smoothly map `value` into [0, 1] across the [lo, hi] band.
 * Below lo → 0, above hi → 1, linear in between.
 */
function weight(value: number, lo: number, hi: number): number {
  if (hi <= lo) return value >= hi ? 1 : 0;
  if (value <= lo) return 0;
  if (value >= hi) return 1;
  return (value - lo) / (hi - lo);
}

function clamp(v: number, lo: number, hi: number): number {
  if (!isFinite(v)) return lo;
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}
