import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface BpmStepperProps {
  bpm: number;
  onBpmChange: (newBpm: number) => void;
}

const MIN_BPM = 20;
const MAX_BPM = 300;
const STEP = 5;

export function BpmStepper({ bpm, onBpmChange }: BpmStepperProps): React.JSX.Element {
  const increment = useCallback(() => {
    onBpmChange(Math.min(MAX_BPM, bpm + STEP));
  }, [bpm, onBpmChange]);

  const decrement = useCallback(() => {
    onBpmChange(Math.max(MIN_BPM, bpm - STEP));
  }, [bpm, onBpmChange]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={decrement}>
        <Text style={styles.buttonText}>-</Text>
      </Pressable>
      <Text style={styles.bpmText}>{bpm} BPM</Text>
      <Pressable style={styles.button} onPress={increment}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  buttonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  bpmText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.neonPurple,
    minWidth: 80,
    textAlign: 'center',
  },
});
