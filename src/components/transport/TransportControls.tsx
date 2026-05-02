import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface TransportControlsProps {
  isPlaying: boolean;
  loop: boolean;
  onPlayPause: () => void;
  onToggleLoop: () => void;
  playheadBeat: number;
  totalBeats: number;
  pixelsPerBeat: number;
}

export function TransportControls({
  isPlaying,
  loop,
  onPlayPause,
  onToggleLoop,
  playheadBeat,
  totalBeats,
  pixelsPerBeat,
}: TransportControlsProps): React.JSX.Element {
  const playheadPosition = playheadBeat * pixelsPerBeat;

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Pressable style={[styles.button, isPlaying && styles.buttonActive]} onPress={onPlayPause}>
          <Text style={styles.buttonText}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>
        <Pressable style={[styles.button, loop && styles.buttonActive]} onPress={onToggleLoop}>
          <Text style={styles.buttonText}>🔁</Text>
        </Pressable>
      </View>
      <View style={styles.playheadTrack}>
        <View style={[styles.playhead, { left: playheadPosition }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  buttons: {
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  button: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  buttonActive: {
    backgroundColor: colors.neonPurple,
  },
  buttonText: {
    fontSize: typography.sizes.lg,
  },
  playheadTrack: {
    flex: 1,
    height: 20,
    position: 'relative',
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
  },
  playhead: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: colors.neonRed,
    borderRadius: 1,
  },
});
