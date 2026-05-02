import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { TimelineEvent } from '../../stores/projectStore';

interface TimelineBottomSheetProps {
  event: TimelineEvent;
  onDelete: (eventId: string) => void;
  onDuplicate: (eventId: string) => void;
  onLaneChange: (eventId: string, newLane: string) => void;
  onVelocityChange: (eventId: string, newVelocity: number) => void;
  onClose: () => void;
}

const LANE_OPTIONS = ['kick', 'snare', 'hat', 'perc', 'unknown'];

export function TimelineBottomSheet({
  event,
  onDelete,
  onDuplicate,
  onLaneChange,
  onVelocityChange,
  onClose,
}: TimelineBottomSheetProps): React.JSX.Element {
  const [velocity, setVelocity] = useState(event.velocity);

  const handleDelete = useCallback(() => {
    onDelete(event.id);
    onClose();
  }, [event.id, onDelete, onClose]);

  const handleDuplicate = useCallback(() => {
    onDuplicate(event.id);
    onClose();
  }, [event.id, onDuplicate, onClose]);

  const handleLaneChange = useCallback((newLane: string) => {
    onLaneChange(event.id, newLane);
    onClose();
  }, [event.id, onLaneChange, onClose]);

  const handleVelocityChange = useCallback((delta: number) => {
    const newVelocity = Math.min(127, Math.max(0, velocity + delta));
    setVelocity(newVelocity);
    onVelocityChange(event.id, newVelocity);
  }, [velocity, event.id, onVelocityChange]);

  return (
    <Modal transparent animationType="slide" visible={true} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Event Options</Text>
          <Text style={styles.eventInfo}>Lane: {event.lane} | Beat: {event.startBeat.toFixed(2)}</Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={handleDelete}>
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleDuplicate}>
              <Text style={styles.buttonText}>Duplicate</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Change Lane</Text>
          <View style={styles.laneRow}>
            {LANE_OPTIONS.map(lane => (
              <Pressable
                key={lane}
                style={[styles.laneButton, event.lane === lane && styles.laneButtonActive]}
                onPress={() => handleLaneChange(lane)}
              >
                <Text style={[styles.laneButtonText, event.lane === lane && styles.laneButtonTextActive]}>
                  {lane}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Velocity: {velocity}</Text>
          <View style={styles.velocityRow}>
            <Pressable style={styles.velocityButton} onPress={() => handleVelocityChange(-10)}>
              <Text style={styles.velocityButtonText}>-10</Text>
            </Pressable>
            <Pressable style={styles.velocityButton} onPress={() => handleVelocityChange(-1)}>
              <Text style={styles.velocityButtonText}>-1</Text>
            </Pressable>
            <Pressable style={styles.velocityButton} onPress={() => handleVelocityChange(1)}>
              <Text style={styles.velocityButtonText}>+1</Text>
            </Pressable>
            <Pressable style={styles.velocityButton} onPress={() => handleVelocityChange(10)}>
              <Text style={styles.velocityButtonText}>+10</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  eventInfo: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.neonPurple,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  laneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  laneButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  laneButtonActive: {
    backgroundColor: colors.neonPurple,
    borderColor: colors.neonPurple,
  },
  laneButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  laneButtonTextActive: {
    color: colors.white,
  },
  velocityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  velocityButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  velocityButtonText: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
});
