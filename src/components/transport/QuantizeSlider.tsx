import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '../../theme';

interface QuantizeSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export function QuantizeSlider({ value, onValueChange }: QuantizeSliderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quantize: {Math.round(value * 100)}%</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.neonPurple}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.neonPurple}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  slider: {
    width: 100,
    height: 40,
  },
});
