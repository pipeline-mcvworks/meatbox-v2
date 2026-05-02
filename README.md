# mouthbeat-machine

A React Native + Expo beatbox studio app. Record, analyze, and perform vocal percussion with real-time visualization and a pad-based sequencer.

## Quick Start

```bash
# Install dependencies
npm install

# Start the Expo dev server
npx expo start
```

Scan the QR code with the Expo Go app (iOS/Android) or press `i` / `a` to open in a simulator.

## Project Structure

```
App.tsx                  # Root component — mounts NavigationContainer
index.ts                 # Expo entry point
src/
  app/
    AppNavigator.tsx     # Native stack navigator with all screens
  screens/               # Placeholder screens (9 total)
    HomeScreen.tsx
    RecordScreen.tsx
    AnalyzeScreen.tsx
    TimelineScreen.tsx
    PadsScreen.tsx
    VisualizerScreen.tsx
    KitScreen.tsx
    ExportScreen.tsx
    ProjectListScreen.tsx
  theme/                 # Design tokens
    colors.ts            # Dark/neon palette
    spacing.ts           # Spacing scale
    typography.ts        # Font sizes & weights
    index.ts             # Re-exports
```

## Theme

Import tokens from `src/theme`:

```ts
import { colors, spacing, typography } from '../theme';
```

## Requirements

- Node >= 18
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
