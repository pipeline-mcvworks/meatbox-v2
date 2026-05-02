import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export function VisualizerScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visualizer</Text>
      <Text style={styles.placeholder}>Audio visualizer coming soon.</Text>
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
    color: colors.neonPink,
    marginBottom: spacing.md,
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
