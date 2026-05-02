# MouthBeat Machine

A React Native / Expo beat-making app for creating rhythms with your voice.

## Getting Started

```bash
npm install
npx expo start
```

## Architecture

- **src/audio/** — Audio services (recorder, playback, scheduler). All scheduling logic lives outside React.
- **src/screens/** — Screen components (Record, Timeline, Pads, Kit, Visualizer).
- **src/stores/** — Zustand project/UI stores.
- **src/state/** — Zustand audio/playback stores.
- **src/components/** — Reusable UI components.
- **src/assets/samples/default-kit/** — Bundled drum sample WAV files.

## ⚠️ Asset Gap: Placeholder WAV Files

The four drum sample files under `src/assets/samples/default-kit/` are **placeholder silent WAV files**:

```
src/assets/samples/default-kit/
  kick.wav   ← silent placeholder (0 PCM samples)
  snare.wav  ← silent placeholder (0 PCM samples)
  hat.wav    ← silent placeholder (0 PCM samples)
  perc.wav   ← silent placeholder (0 PCM samples)
```

These files contain valid RIFF/WAVE headers but **no audio data** (0-length PCM payload). They will load without errors but produce **no audible sound** when triggered.

### Why placeholders?

Binary audio files cannot be committed through the automated code-generation pipeline used to build this project. The files are stored as base64-encoded text representations of minimal WAV headers, which Metro's asset bundler treats as text rather than binary audio assets.

### How to fix (required for audible playback)

Replace the four placeholder files with real WAV samples:

1. Obtain royalty-free drum one-shot samples (kick, snare, hi-hat, percussion) in WAV format.
   - Suggested sources: [freesound.org](https://freesound.org), [sampleswap.org](https://sampleswap.org), or any free drum kit pack.
   - Recommended format: 44.1 kHz, 16-bit, mono or stereo, short one-shots (< 1 second).

2. Copy the files into the project:
   ```
   cp your-kick.wav   src/assets/samples/default-kit/kick.wav
   cp your-snare.wav  src/assets/samples/default-kit/snare.wav
   cp your-hat.wav    src/assets/samples/default-kit/hat.wav
   cp your-perc.wav   src/assets/samples/default-kit/perc.wav
   ```

3. Restart the Metro bundler:
   ```bash
   npx expo start --clear
   ```

Once real WAV files are in place, the Timeline screen's play button will trigger each lane's assigned sample at the correct beat position through the phone speaker.

## Audio Services

### AudioRecorderService

Handles microphone recording via `expo-av`. Requests permission, records up to 30 seconds, and returns the local URI and duration on stop.

### AudioPlaybackService

Loads WAV samples from `src/assets/samples/default-kit/` using Metro's `require()` asset bundler. Each sample is pre-loaded into an `Audio.Sound` object for low-latency re-triggering. Velocity (0–1) maps to volume.

### SampleScheduler

Wall-clock-based scheduler using `setInterval` at ~10 ms resolution. Walks a sorted event list and dispatches `playSample()` calls at the correct beat position. Tick callbacks drive the visual playhead. All scheduling logic is outside React.

**Important:** Call `scheduler.onTick(cb)` before `scheduler.start()` each play session. `stop()` clears all tick callbacks to prevent stale-closure accumulation across multiple play/stop cycles.
