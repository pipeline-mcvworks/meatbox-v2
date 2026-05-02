/**
 * Barrel export for all MouthBeat data model types and the demo fixture.
 */

export type { RawRecordingRef, DetectedHit } from './audio';
export type { SampleCategory, DrumSample, DrumKitConfig } from './kit';
export type { LaneType, TimelineEvent, TimelineLane } from './timeline';
export type { TimeSignature, MouthBeatProject } from './project';
export { demoProject } from './demoProject';
