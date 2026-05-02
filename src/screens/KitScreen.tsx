import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { useProjectStore } from '../state/projectStore';
import { KitLaneRow, SampleOption } from '../components/kit/KitLaneRow';

const LANE_COLORS = [
  colors.neonGreen,
  colors.neonCyan,
  colors.neonPink,
  colors.neonOrange,
];

export function KitScreen(): React.JSX.Element {
  const project = useProjectStore((s) => s.project);
  const setLaneSample = useProjectStore((s) => s.setLaneSample);
  const setLaneVolume = useProjectStore((s) => s.setLaneVolume);
  const setLaneMuted = useProjectStore((s) => s.setLaneMuted);
  const setLaneSoloed = useProjectStore((s) => s.setLaneSoloed);

  const lanes = project?.tracks ?? [];

  const availableSamples: SampleOption[] = useMemo(() => {
    const samples = project?.samples ?? [];
    return samples.map((s: { id: string; name?: string }) => ({
      id: s.id,
      name: s.name ?? s.id,
    }));
  }, [project?.samples]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kit</Text>
        <Text style={styles.subtitle}>
          {project?.kitId ? `Active kit: ${project.kitId}` : 'No active kit'}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {lanes.length === 0 ? (
          <Text style={styles.placeholder}>No lanes in this project yet.</Text>
        ) : (
          lanes.map((lane: any, idx: number) => (
            <KitLaneRow
              key={lane.id}
              laneId={lane.id}
              laneName={lane.name ?? `Lane ${idx + 1}`}
              sampleId={lane.sampleId ?? null}
              volume={typeof lane.volume === 'number' ? lane.volume : 1}
              muted={!!lane.muted}
              soloed={!!lane.soloed}
              availableSamples={availableSamples}
              accentColor={LANE_COLORS[idx % LANE_COLORS.length]}
              onChangeSample={(sid) => setLaneSample(lane.id, sid)}
              onChangeVolume={(v) => setLaneVolume(lane.id, v)}
              onToggleMute={() => setLaneMuted(lane.id, !lane.muted)}
              onToggleSolo={() => setLaneSoloed(lane.id, !lane.soloed)}
            />
          ))
        )}
      </ScrollView>
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
    color: colors.neonGreen,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scroll: {
    padding: spacing.lg,
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
