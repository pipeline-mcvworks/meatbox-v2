import type { IAudioPlaybackService } from './types';
import type { ISampleScheduler, ScheduledEvent, TickCallback } from './types';

/**
 * Wall-clock-based sample scheduler.
 *
 * Uses setInterval at ~10 ms resolution to walk a sorted event list and
 * dispatch sample triggers at the correct beat position. All logic is
 * outside React — the scheduler is a plain class.
 */
export class SampleScheduler implements ISampleScheduler {
  private playbackService: IAudioPlaybackService;
  private tickCallbacks: TickCallback[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private events: ScheduledEvent[] = [];
  private bpm: number = 120;
  private loop: boolean = false;
  private totalBeats: number = 0;

  /** Current playhead position in beats. */
  private currentBeat: number = 0;
  /** Wall-clock timestamp of the last tick (ms). */
  private lastTickMs: number = 0;
  /** Index into sorted events of the next event to fire. */
  private nextEventIndex: number = 0;

  /** Scheduler tick interval in milliseconds. */
  private static readonly TICK_INTERVAL_MS = 10;

  constructor(playbackService: IAudioPlaybackService) {
    this.playbackService = playbackService;
  }

  onTick(callback: TickCallback): void {
    this.tickCallbacks.push(callback);
  }

  start(events: ScheduledEvent[], bpm: number, loop: boolean): void {
    this.stop();

    // Sort events by startBeat ascending
    this.events = [...events].sort((a, b) => a.startBeat - b.startBeat);
    this.bpm = bpm;
    this.loop = loop;
    this.currentBeat = 0;
    this.nextEventIndex = 0;
    this.lastTickMs = Date.now();

    // Compute total beats from last event (round up to next bar of 4)
    if (this.events.length > 0) {
      const lastBeat = this.events[this.events.length - 1].startBeat;
      const bars = Math.ceil((lastBeat + 1) / 4);
      this.totalBeats = bars * 4;
    } else {
      this.totalBeats = 32; // default 8 bars
    }

    this.intervalId = setInterval(() => this._tick(), SampleScheduler.TICK_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentBeat = 0;
    this.nextEventIndex = 0;
  }

  private _tick(): void {
    const now = Date.now();
    const deltaMs = now - this.lastTickMs;
    this.lastTickMs = now;

    const beatsPerMs = this.bpm / 60 / 1000;
    const beatDelta = deltaMs * beatsPerMs;
    const prevBeat = this.currentBeat;
    let newBeat = prevBeat + beatDelta;

    // Fire all events whose startBeat falls in [prevBeat, newBeat)
    while (
      this.nextEventIndex < this.events.length &&
      this.events[this.nextEventIndex].startBeat < newBeat
    ) {
      const evt = this.events[this.nextEventIndex];
      this.nextEventIndex++;
      // Fire and forget — don't await inside setInterval
      this.playbackService
        .playSample(evt.lane, evt.velocity)
        .catch(() => {/* ignore */});
    }

    // Handle loop / end
    if (newBeat >= this.totalBeats) {
      if (this.loop) {
        newBeat = newBeat % this.totalBeats;
        this.nextEventIndex = 0;
        // Re-fire any events at beat 0 that we just looped past
        while (
          this.nextEventIndex < this.events.length &&
          this.events[this.nextEventIndex].startBeat < newBeat
        ) {
          const evt = this.events[this.nextEventIndex];
          this.nextEventIndex++;
          this.playbackService
            .playSample(evt.lane, evt.velocity)
            .catch(() => {/* ignore */});
        }
      } else {
        newBeat = this.totalBeats;
        this.stop();
      }
    }

    this.currentBeat = newBeat;

    // Notify tick listeners
    for (const cb of this.tickCallbacks) {
      try {
        cb(this.currentBeat);
      } catch {
        // ignore
      }
    }
  }
}
