import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface RecordingTimerProps {
  elapsedSeconds: number;
}

export function RecordingTimer({ elapsedSeconds }: RecordingTimerProps): React.JSX.Element {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatted}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timer: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: colors.neonGreen,
    fontVariant: ['tabular-nums'],
  },
});
