import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '../../theme';

export interface PadCellProps {
  label: string;
  color: string;
  onTrigger: () => void;
  disabled?: boolean;
}

export function PadCell({ label, color, onTrigger, disabled }: PadCellProps): React.JSX.Element {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.4 + glow.value * 0.6,
    shadowRadius: 6 + glow.value * 18,
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 60, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }),
    );
    glow.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 260 }),
    );
    onTrigger();
  }, [scale, glow, onTrigger]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel={`Pad ${label}`}
    >
      <Animated.View
        style={[
          styles.pad,
          { borderColor: color, shadowColor: color },
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <View style={[styles.inner, { backgroundColor: color + '22' }]}>
          <Text style={[styles.label, { color }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    aspectRatio: 1,
    margin: spacing.xs,
  },
  pad: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: colors.surface,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  inner: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
