/**
 * Hardcoded demo project fixture.
 *
 * An 8-bar boom-bap pattern at BPM 90, 4/4 time.
 * Contains 32 TimelineEvents spread across kick, snare, and hi-hat lanes.
 *
 * Beat numbering is 1-based and continuous across bars:
 *   Bar 1 = beats 1-4, Bar 2 = beats 5-8, …, Bar 8 = beats 29-32.
 *
 * No runtime code – this module only exports a plain object literal.
 */

import type { MouthBeatProject } from './project';

// ---------------------------------------------------------------------------
// Lane IDs
// ---------------------------------------------------------------------------
const KICK_LANE_ID = 'lane-kick';
const SNARE_LANE_ID = 'lane-snare';
const HIHAT_LANE_ID = 'lane-hihat';

// ---------------------------------------------------------------------------
// Sample IDs (placeholder – real URIs wired up in a later ticket)
// ---------------------------------------------------------------------------
const KICK_SAMPLE_ID = 'sample-kick-01';
const SNARE_SAMPLE_ID = 'sample-snare-01';
const HIHAT_SAMPLE_ID = 'sample-hihat-01';

// ---------------------------------------------------------------------------
// Helper: build a TimelineEvent id string
// ---------------------------------------------------------------------------
function eid(lane: string, beat: number): string {
  return `evt-${lane}-b${beat}`;
}

/**
 * Classic boom-bap kick pattern repeated over 8 bars.
 * Kick on beats 1 and 3 of every bar (beats 1,3,5,7,9,11,…,29,31).
 */
const KICK_BEATS: number[] = [];
for (let bar = 0; bar < 8; bar++) {
  KICK_BEATS.push(bar * 4 + 1); // beat 1 of bar
  KICK_BEATS.push(bar * 4 + 3); // beat 3 of bar
}

/**
 * Classic snare pattern: beats 2 and 4 of every bar.
 */
const SNARE_BEATS: number[] = [];
for (let bar = 0; bar < 8; bar++) {
  SNARE_BEATS.push(bar * 4 + 2); // beat 2 of bar
  SNARE_BEATS.push(bar * 4 + 4); // beat 4 of bar
}

/**
 * Hi-hat on every beat (quarter-note grid) across 8 bars = 32 beats.
 * We include only the first 16 to keep total events at 16 + 16 + 16 = 48,
 * but the acceptance criteria requires ≥ 16 events total, so we use all 32
 * beats for the hi-hat to give a full closed-hat feel.
 */
const HIHAT_BEATS: number[] = [];
for (let beat = 1; beat <= 32; beat++) {
  HIHAT_BEATS.push(beat);
}

export const demoProject: MouthBeatProject = {
  id: 'demo-project-001',
  name: 'Demo Boom-Bap (8 bars)',
  bpm: 90,
  timeSignature: [4, 4],
  bars: 8,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  description: 'A hardcoded 8-bar boom-bap demo pattern for development and testing.',

  // ------------------------------------------------------------------
  // Lanes
  // ------------------------------------------------------------------
  lanes: [
    {
      id: KICK_LANE_ID,
      label: 'Kick',
      type: 'kick',
      sampleId: KICK_SAMPLE_ID,
      muted: false,
      soloed: false,
      volume: 1,
      pan: 0,
    },
    {
      id: SNARE_LANE_ID,
      label: 'Snare',
      type: 'snare',
      sampleId: SNARE_SAMPLE_ID,
      muted: false,
      soloed: false,
      volume: 1,
      pan: 0,
    },
    {
      id: HIHAT_LANE_ID,
      label: 'Hi-Hat',
      type: 'hihat_closed',
      sampleId: HIHAT_SAMPLE_ID,
      muted: false,
      soloed: false,
      volume: 0.75,
      pan: 0.1,
    },
  ],

  // ------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------
  events: [
    // Kick events (16 total: beats 1 & 3 of each of 8 bars)
    ...KICK_BEATS.map((beat) => ({
      id: eid('kick', beat),
      beat,
      durationBeats: 0.25,
      velocity: beat % 4 === 1 ? 1.0 : 0.85, // accent on beat 1
      laneId: KICK_LANE_ID,
    })),

    // Snare events (16 total: beats 2 & 4 of each of 8 bars)
    ...SNARE_BEATS.map((beat) => ({
      id: eid('snare', beat),
      beat,
      durationBeats: 0.25,
      velocity: 0.9,
      laneId: SNARE_LANE_ID,
    })),

    // Hi-hat events (32 total: every beat across 8 bars)
    ...HIHAT_BEATS.map((beat) => ({
      id: eid('hihat', beat),
      beat,
      durationBeats: 0.25,
      velocity: beat % 2 === 1 ? 0.7 : 0.5, // alternate accent
      laneId: HIHAT_LANE_ID,
    })),
  ],

  // ------------------------------------------------------------------
  // Kit
  // ------------------------------------------------------------------
  kit: {
    id: 'kit-classic-boom-bap',
    name: 'Classic Boom Bap',
    samples: {
      [KICK_SAMPLE_ID]: {
        id: KICK_SAMPLE_ID,
        name: 'Boom Kick 01',
        uri: 'placeholder://kick-01.wav',
        category: 'kick',
        durationSeconds: 0.5,
      },
      [SNARE_SAMPLE_ID]: {
        id: SNARE_SAMPLE_ID,
        name: 'Snap Snare 01',
        uri: 'placeholder://snare-01.wav',
        category: 'snare',
        durationSeconds: 0.4,
      },
      [HIHAT_SAMPLE_ID]: {
        id: HIHAT_SAMPLE_ID,
        name: 'Closed Hat 01',
        uri: 'placeholder://hihat-closed-01.wav',
        category: 'hihat',
        durationSeconds: 0.1,
      },
    },
    defaultSampleIds: {
      kick: KICK_SAMPLE_ID,
      snare: SNARE_SAMPLE_ID,
      hihat_closed: HIHAT_SAMPLE_ID,
    },
  },

  // ------------------------------------------------------------------
  // Recordings (none for the demo)
  // ------------------------------------------------------------------
  recordings: {},
};
