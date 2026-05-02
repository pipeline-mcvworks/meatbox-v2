import { Audio } from 'expo-av';
import type { IAudioRecorderService } from './types';

/**
 * Concrete implementation of IAudioRecorderService using expo-av.
 * All logic lives outside React — instantiate once and share via a module-level singleton.
 */
export class AudioRecorderService implements IAudioRecorderService {
  private recording: Audio.Recording | null = null;
  private lastUri: string | null = null;
  private lastDurationSeconds: number = 0;
  private startedAt: number = 0;

  /** Maximum recording duration in milliseconds (30 seconds). */
  private static readonly MAX_DURATION_MS = 30_000;

  async requestPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') return 'granted';
      if (status === 'denied') return 'denied';
      return 'undetermined';
    } catch {
      return 'undetermined';
    }
  }

  async start(): Promise<void> {
    // Stop any existing recording first
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {
        // ignore
      }
      this.recording = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    this.recording = recording;
    this.startedAt = Date.now();
    this.lastUri = null;
    this.lastDurationSeconds = 0;

    // Auto-stop after MAX_DURATION_MS
    setTimeout(() => {
      if (this.recording) {
        this.stop().catch(() => {/* ignore */});
      }
    }, AudioRecorderService.MAX_DURATION_MS);
  }

  async stop(): Promise<{ uri: string; durationSeconds: number }> {
    if (!this.recording) {
      return { uri: this.lastUri ?? '', durationSeconds: this.lastDurationSeconds };
    }

    const elapsed = (Date.now() - this.startedAt) / 1000;

    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI() ?? '';
    this.lastUri = uri;
    this.lastDurationSeconds = elapsed;
    this.recording = null;

    // Restore audio mode for playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    return { uri, durationSeconds: elapsed };
  }

  getRecordingUri(): string | null {
    return this.lastUri;
  }

  getDurationSeconds(): number {
    return this.lastDurationSeconds;
  }
}

/** Module-level singleton — import this in screens/hooks. */
export const audioRecorderService = new AudioRecorderService();
