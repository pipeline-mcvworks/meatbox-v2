import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../../theme';

interface SensitivitySliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export function SensitivitySlider({ value, onValueChange }: SensitivitySliderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.neonCyan}
        maximumTrackTintColor={colors.surface}
        thumbTintColor={colors.neonCyan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 0,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
