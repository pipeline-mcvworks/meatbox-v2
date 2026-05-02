import { Audio } from 'expo-av';
import type { IAudioPlaybackService, LaneType, Velocity } from './types';

// ---------------------------------------------------------------------------
// Sample asset map
// ---------------------------------------------------------------------------

// Using require() so Metro bundles the assets at build time.
const SAMPLE_SOURCES: Record<LaneType, ReturnType<typeof require>> = {
  kick: require('../assets/samples/default-kit/kick.wav'),
  snare: require('../assets/samples/default-kit/snare.wav'),
  hat: require('../assets/samples/default-kit/hat.wav'),
  perc: require('../assets/samples/default-kit/perc.wav'),
  // 'unknown' falls back to kick
  unknown: require('../assets/samples/default-kit/kick.wav'),
};

/**
 * Concrete implementation of IAudioPlaybackService using expo-av.
 * Loads each sample once and keeps the Sound objects alive for low-latency
 * re-triggering via replayAsync().
 */
export class AudioPlaybackService implements IAudioPlaybackService {
  private sounds: Partial<Record<LaneType, Audio.Sound>> = {};

  async loadSample(lane: LaneType): Promise<void> {
    // Unload existing sound for this lane if present
    if (this.sounds[lane]) {
      await this.sounds[lane]!.unloadAsync();
      delete this.sounds[lane];
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      SAMPLE_SOURCES[lane],
      { shouldPlay: false, volume: 1.0 },
    );
    this.sounds[lane] = sound;
  }

  async playSample(lane: LaneType, velocity: Velocity): Promise<void> {
    const sound = this.sounds[lane];
    if (!sound) return;

    const volume = Math.max(0, Math.min(1, velocity));
    try {
      await sound.setVolumeAsync(volume);
      // Rewind to start then play
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // If the sound object is in a bad state, ignore — scheduler will continue
    }
  }

  async unloadAll(): Promise<void> {
    const lanes = Object.keys(this.sounds) as LaneType[];
    await Promise.all(
      lanes.map(async (lane) => {
        try {
          await this.sounds[lane]!.unloadAsync();
        } catch {
          // ignore
        }
        delete this.sounds[lane];
      }),
    );
  }
}

/** Module-level singleton. */
export const audioPlaybackService = new AudioPlaybackService();
