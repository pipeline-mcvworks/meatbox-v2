import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '../../theme';

export interface SampleOption {
  id: string;
  name: string;
}

export interface KitLaneRowProps {
  laneId: string;
  laneName: string;
  sampleId: string | null;
  volume: number; // 0..1
  muted: boolean;
  soloed: boolean;
  availableSamples: SampleOption[];
  onChangeSample: (sampleId: string) => void;
  onChangeVolume: (volume: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  accentColor?: string;
}

export function KitLaneRow(props: KitLaneRowProps): React.JSX.Element {
  const {
    laneName,
    sampleId,
    volume,
    muted,
    soloed,
    availableSamples,
    onChangeSample,
    onChangeVolume,
    onToggleMute,
    onToggleSolo,
    accentColor = colors.neonGreen,
  } = props;

  const [pickerOpen, setPickerOpen] = useState(false);
  const currentSample = availableSamples.find((s) => s.id === sampleId);

  return (
    <View style={[styles.row, { borderColor: accentColor }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.laneName, { color: accentColor }]} numberOfLines={1}>
          {laneName}
        </Text>
        <View style={styles.toggles}>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>M</Text>
            <Switch
              value={muted}
              onValueChange={onToggleMute}
              trackColor={{ false: colors.surfaceAlt, true: colors.neonOrange }}
              thumbColor={muted ? colors.neonOrange : colors.textSecondary}
            />
          </View>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>S</Text>
            <Switch
              value={soloed}
              onValueChange={onToggleSolo}
              trackColor={{ false: colors.surfaceAlt, true: colors.neonCyan }}
              thumbColor={soloed ? colors.neonCyan : colors.textSecondary}
            />
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => setPickerOpen(true)}
        style={styles.sampleButton}
        accessibilityRole="button"
        accessibilityLabel={`Choose sample for ${laneName}`}
      >
        <Text style={styles.sampleButtonLabel}>Sample</Text>
        <Text style={[styles.sampleButtonValue, { color: accentColor }]} numberOfLines={1}>
          {currentSample?.name ?? sampleId ?? '— none —'}
        </Text>
      </Pressable>

      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>Vol</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={onChangeVolume}
          minimumTrackTintColor={accentColor}
          maximumTrackTintColor={colors.surfaceAlt}
          thumbTintColor={accentColor}
        />
        <Text style={styles.sliderValue}>{Math.round(volume * 100)}</Text>
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Choose sample</Text>
            <ScrollView style={styles.modalList}>
              {availableSamples.length === 0 ? (
                <Text style={styles.modalEmpty}>No samples available.</Text>
              ) : (
                availableSamples.map((s) => {
                  const selected = s.id === sampleId;
                  return (
                    <Pressable
                      key={s.id}
                      style={[
                        styles.modalItem,
                        selected && { borderColor: accentColor, borderWidth: 1 },
                      ]}
                      onPress={() => {
                        onChangeSample(s.id);
                        setPickerOpen(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{s.name}</Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
            <Pressable style={styles.modalClose} onPress={() => setPickerOpen(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  laneName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    flex: 1,
    marginRight: spacing.sm,
  },
  toggles: {
    flexDirection: 'row',
  },
  toggleItem: {
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  toggleLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginBottom: 2,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  sampleButtonLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  sampleButtonValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    flexShrink: 1,
    marginLeft: spacing.md,
    textAlign: 'right',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    width: 32,
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  sliderValue: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    width: 32,
    textAlign: 'right',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  modalList: {
    maxHeight: 320,
  },
  modalEmpty: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.md,
  },
  modalItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.xs,
  },
  modalItemText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
  },
  modalClose: {
    marginTop: spacing.md,
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalCloseText: {
    color: colors.neonCyan,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
