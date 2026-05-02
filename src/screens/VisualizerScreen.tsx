import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { NeonRingsVisualizer } from '../components/visualizer/NeonRingsVisualizer';
import { usePlaybackStore } from '../state/playbackStore';
import { useRecordStore } from '../state/recordStore';

export function VisualizerScreen(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const playheadBeat = usePlaybackStore((s) => s.playheadBeat ?? 0);
  const isPlaying = usePlaybackStore((s) => s.isPlaying ?? false);
  const inputLevel = useRecordStore((s) => s.inputLevel ?? 0);
  const isRecording = useRecordStore((s) => s.isRecording ?? false);

  return (
    <View style={styles.container}>
      <NeonRingsVisualizer
        width={width}
        height={height}
        beat={playheadBeat}
        inputLevel={isRecording ? inputLevel : 0}
      />
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.title}>Visualizer</Text>
        <Text style={styles.subtitle}>
          {isPlaying ? 'Playing' : isRecording ? 'Recording' : 'Idle'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.neonPink,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
