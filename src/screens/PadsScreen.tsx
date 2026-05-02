import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PadGrid, PadConfig } from '../components/pads/PadGrid';
import { colors, spacing, typography } from '../theme';
import { useProjectStore } from '../state/projectStore';
import { AudioPlaybackService } from '../audio/AudioPlaybackService';

const PAD_COLORS = [
  colors.neonOrange,
  colors.neonCyan,
  colors.neonPink,
  colors.neonGreen,
];

export function PadsScreen(): React.JSX.Element {
  const project = useProjectStore((s) => s.project);
  const lanes = project?.tracks ?? [];

  const pads = useMemo<PadConfig[]>(() => {
    const out: PadConfig[] = [];
    for (let i = 0; i < 16; i += 1) {
      const lane = lanes.length > 0 ? lanes[i % lanes.length] : undefined;
      const sampleId = lane?.sampleId ?? null;
      const label = lane ? `${lane.name}` : `Pad ${i + 1}`;
      const color = PAD_COLORS[i % PAD_COLORS.length];
      out.push({
        id: `pad-${i}`,
        label,
        color,
        onTrigger: () => {
          if (sampleId) {
            try {
              AudioPlaybackService.playSample(sampleId, {
                volume: lane?.volume ?? 1,
              });
            } catch (err) {
              // swallow — pad UI should never crash on missing sample
              // eslint-disable-next-line no-console
              console.warn('[PadsScreen] playSample failed', err);
            }
          }
        },
      });
    }
    return out;
  }, [lanes]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pads</Text>
        <Text style={styles.subtitle}>
          {lanes.length > 0
            ? 'Tap to trigger samples'
            : 'Load a project to assign pads'}
        </Text>
      </View>
      <View style={styles.gridWrap}>
        <PadGrid pads={pads} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.neonOrange,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  gridWrap: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
