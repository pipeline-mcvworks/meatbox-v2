import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/AppNavigator';
import { colors, spacing, typography } from '../theme';
import { SensitivitySlider } from '../components/controls/SensitivitySlider';
import { Waveform } from '../components/waveform';
import { useProjectStore } from '../state/projectStore';
import { useAudioStore } from '../state/audioStore';
import { createTimelineEvents } from '../analysis/createTimelineEvents';
import type { TimelineEventLabel } from '../state/projectStore';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Analyze'>;

export function AnalyzeScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const [sensitivity, setSensitivity] = useState(0.5);
  const [scrubPosition, setScrubPosition] = useState(0);

  const rawRecording = useProjectStore((s) => s.rawRecording);
  const project = useProjectStore((s) => s.project);
  const setTimelineEvents = useProjectStore((s) => s.setTimelineEvents);
  const audioPeaksFallback = useAudioStore((s) => s.waveformPeaks);
  const audioDurationFallback = useAudioStore((s) => s.durationSeconds);

  const peaks = rawRecording?.peaks ?? audioPeaksFallback;
  const duration = rawRecording?.durationSeconds ?? audioDurationFallback;
  const hasPeaks = peaks.length > 0;

  const events = project.events;

  const summary = useMemo(() => {
    if (events.length === 0) return null;
    const counts: Record<TimelineEventLabel, number> = {
      kick: 0,
      snare: 0,
      hat: 0,
      perc: 0,
      unknown: 0,
    };
    for (const ev of events) counts[ev.label] += 1;
    return counts;
  }, [events]);

  const handleAutoClean = (): void => {
    if (!hasPeaks || duration <= 0) return;
    const newEvents = createTimelineEvents({
      peaks,
      durationSeconds: duration,
      bpm: project.bpm,
      sensitivity,
      quantizeStrength: 100,
      previousEvents: project.events,
    });
    setTimelineEvents(newEvents);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analyze</Text>

      {/* Waveform */}
      {hasPeaks ? (
        <View style={styles.waveformWrapper}>
          <Waveform
            peaks={peaks}
            scrubPosition={scrubPosition}
            onScrubChange={setScrubPosition}
            onScrubEnd={setScrubPosition}
          />
          <Text style={styles.waveformMeta}>
            {duration.toFixed(2)}s · {peaks.length} bins · scrub {(scrubPosition * 100).toFixed(0)}%
          </Text>
        </View>
      ) : (
        <View style={styles.waveformPlaceholder}>
          <Text style={styles.waveformText}>No recording yet</Text>
        </View>
      )}

      {/* Sensitivity Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Sensitivity: {Math.round(sensitivity * 100)}%</Text>
        <SensitivitySlider
          value={sensitivity}
          onValueChange={setSensitivity}
        />
      </View>

      {/* Detection Summary Text */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Detection Summary</Text>
        {summary ? (
          <Text style={styles.summaryText}>
            {events.length} hits · kick {summary.kick} · snare {summary.snare} · hat {summary.hat}
            {summary.perc > 0 ? ` · perc ${summary.perc}` : ''}
            {summary.unknown > 0 ? ` · ? ${summary.unknown}` : ''}
          </Text>
        ) : (
          <Text style={styles.summaryText}>
            {hasPeaks
              ? 'Waveform loaded. Tap Auto Clean to detect hits.'
              : 'No audio analyzed yet. Record or import a track to see detection results.'}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[styles.actionButton, !hasPeaks && styles.actionButtonDisabled]}
        onPress={handleAutoClean}
        disabled={!hasPeaks}
        activeOpacity={0.75}
      >
        <Text style={styles.actionButtonText}>Auto Clean</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          navigation.navigate('Record');
        }}
        activeOpacity={0.75}
      >
        <Text style={styles.actionButtonText}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          navigation.navigate('Timeline');
        }}
        activeOpacity={0.75}
      >
        <Text style={styles.actionButtonText}>Edit Timeline</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.neonCyan,
    marginBottom: spacing.md,
  },
  waveformWrapper: {
    width: '100%',
    marginBottom: spacing.md,
  },
  waveformMeta: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  waveformPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neonCyan,
  },
  waveformText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  sliderLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
  summaryContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    color: colors.neonCyan,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  actionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neonCyan,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    width: '100%',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
  },
});
