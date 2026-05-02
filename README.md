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

## ⚠️ Asset Gap: Placeholder WAV Files (action required for audible playback)

The four drum sample files under `src/assets/samples/default-kit/` are **placeholder silent WAV files**:

```
src/assets/samples/default-kit/
  kick.wav   ← silent placeholder (0 PCM samples)
  snare.wav  ← silent placeholder (0 PCM samples)
  hat.wav    ← silent placeholder (0 PCM samples)
  perc.wav   ← silent placeholder (0 PCM samples)
```

These files contain valid RIFF/WAVE headers but **no audio data** (0-length PCM payload). They will load without errors via `Audio.Sound.createAsync(require('./...wav'))` and the scheduler will trigger them at the correct beats, but they produce **no audible sound**.

### Why placeholders?

The automated code-generation pipeline used to build this project transmits all file content as JSON-encoded text. Binary WAV bytes cannot round-trip through that channel without corruption, so the four committed files are minimal RIFF headers with no PCM payload.

### How to fix (one command, ~30 seconds)

Run this Node script from the repo root to generate four real binary WAV tones that vary by lane:

```bash
node -e "
const fs = require('fs');
const path = require('path');
const dir = 'src/assets/samples/default-kit';
const lanes = [
  { name: 'kick',  freq: 80,   decay: 6  },
  { name: 'snare', freq: 200,  decay: 10 },
  { name: 'hat',   freq: 2000, decay: 30 },
  { name: 'perc',  freq: 600,  decay: 12 },
];
for (const { name, freq, decay } of lanes) {
  const sr = 44100, dur = 0.15, n = Math.floor(sr * dur);
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + n * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24);
  b.writeUInt32LE(sr * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.sin(2 * Math.PI * freq * i / sr) * Math.exp(-i / sr * decay) * 32767;
    b.writeInt16LE(v | 0, 44 + i * 2);
  }
  fs.writeFileSync(path.join(dir, name + '.wav'), b);
  console.log('wrote', name + '.wav');
}
"
```

Verify the output is real binary audio (not text):

```bash
file src/assets/samples/default-kit/kick.wav
# expected: RIFF (little-endian) data, WAVE audio, ...
```

Then restart Metro with cache cleared:

```bash
npx expo start --clear
```

For production-quality kits, replace the generated tones with royalty-free one-shot WAVs from sources like [freesound.org](https://freesound.org) or [sampleswap.org](https://sampleswap.org). Recommended format: 44.1 kHz, 16-bit mono, < 1 second.

A follow-up ticket should track: **replace placeholder kit with real one-shot samples**.

## Audio Services

### AudioRecorderService

Handles microphone recording via `expo-av`. Requests permission, records up to 30 seconds, and returns the local URI and duration on stop.

### AudioPlaybackService

Loads WAV samples from `src/assets/samples/default-kit/` using Metro's `require()` asset bundler. Each sample is pre-loaded into an `Audio.Sound` object for low-latency re-triggering. Velocity (0–1) maps to volume.

### SampleScheduler

Wall-clock-based scheduler using `setInterval` at ~10 ms resolution. Walks a sorted event list and dispatches `playSample()` calls at the correct beat position. Tick callbacks drive the visual playhead. All scheduling logic is outside React.

**Subscriber model:** Call `const unsub = scheduler.onTick(cb)` once at component mount and call `unsub()` at unmount. Subscribers persist across `start()`/`stop()` cycles — `stop()` only halts the interval and resets position; it does **not** drop subscribers. This means the screen registers exactly one tick callback for its lifetime, regardless of how many times the user toggles play.
