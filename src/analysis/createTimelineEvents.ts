/**
 * Top-level analysis pipeline.
 *
 * Composes preprocess → onset detection → feature extraction → classification
 * → quantization, producing a TimelineEvent[] suitable for storage on the
 * project.
 *
 * Re-running with different parameters preserves originalTimeSeconds for
 * events whose detected onset matches an event from the previous run
 * (within a small tolerance). This means tweaking sensitivity doesn't
 * destroy the user's record of "where this hit really was".
 */

import { preprocess } from './preprocess';
import { detectOnsets } from './onsetDetection';
import { extractFeatures } from './featureExtraction';
import { classifyHit, type HitClass } from './classifyHit';
import { quantizeTime } from './quantize';
import type { TimelineEvent } from '../state/projectStore';

export type PipelineInput = {
  peaks: number[];
  durationSeconds: number;
  bpm: number;
  /** [0, 1] sensitivity from the UI slider. */
  sensitivity: number;
  /** [0, 100] quantize strength. Defaults to 100. */
  quantizeStrength?: number;
  /** Existing events from a previous run, used to preserve originalTimeSeconds. */
  previousEvents?: TimelineEvent[];
  /** Optional id factory for testability. */
  idFactory?: () => string;
};

const ORIGINAL_MATCH_TOLERANCE_SECONDS = 0.05;

export function createTimelineEvents(input: PipelineInput): TimelineEvent[] {
  const {
    peaks,
    durationSeconds,
    bpm,
    sensitivity,
    quantizeStrength = 100,
    previousEvents = [],
    idFactory = defaultIdFactory,
  } = input;

  if (peaks.length === 0 || durationSeconds <= 0) return [];

  const { envelope, binsPerSecond } = preprocess(peaks, durationSeconds);
  if (envelope.length === 0 || binsPerSecond <= 0) return [];

  const hits = detectOnsets(envelope, binsPerSecond, { sensitivity });

  const events: TimelineEvent[] = hits.map((hit) => {
    const features = extractFeatures(envelope, binsPerSecond, hit);
    const classification = classifyHit(features);
    const quantizedTimeSeconds = quantizeTime(hit.timeSeconds, bpm, {
      strength: quantizeStrength,
    });

    const original = findPreviousOriginal(previousEvents, hit.timeSeconds);
    const originalTimeSeconds = original ?? hit.timeSeconds;

    return {
      id: idFactory(),
      label: classification.label,
      confidence: classification.confidence,
      originalTimeSeconds,
      quantizedTimeSeconds,
      amplitude: hit.amplitude,
    };
  });

  return events;
}

function findPreviousOriginal(
  previous: TimelineEvent[],
  detectedTime: number
): number | null {
  let best: TimelineEvent | null = null;
  let bestDelta = ORIGINAL_MATCH_TOLERANCE_SECONDS;
  for (const ev of previous) {
    const delta = Math.abs(ev.originalTimeSeconds - detectedTime);
    if (delta <= bestDelta) {
      best = ev;
      bestDelta = delta;
    }
  }
  return best ? best.originalTimeSeconds : null;
}

let idCounter = 0;
function defaultIdFactory(): string {
  idCounter += 1;
  return `tl-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

export type { HitClass };
