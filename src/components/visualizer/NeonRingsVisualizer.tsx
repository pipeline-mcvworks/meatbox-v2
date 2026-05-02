import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  RadialGradient,
  vec,
  BlurMask,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { colors } from '../../theme';

export interface NeonRingsVisualizerProps {
  width: number;
  height: number;
  /** Current playhead beat (monotonic). Used to trigger ring pulses. */
  beat: number;
  /** Mic input level 0..1 (live recording). */
  inputLevel?: number;
}

const RING_COLORS = [
  colors.neonPink,
  colors.neonCyan,
  colors.neonGreen,
  colors.neonOrange,
];

/**
 * Concentric neon rings preset. Beats trigger an outward pulse on the
 * outermost ring; mic input level adds steady-state radial swell.
 */
export function NeonRingsVisualizer(
  props: NeonRingsVisualizerProps,
): React.JSX.Element {
  const { width, height, beat, inputLevel = 0 } = props;
  const cx = width / 2;
  const cy = height / 2;
  const baseRadius = Math.min(width, height) * 0.12;

  const beatPulse = useSharedValue(0);
  const levelPulse = useSharedValue(0);

  // Trigger a pulse whenever the integer beat changes.
  useEffect(() => {
    beatPulse.value = 1;
    beatPulse.value = withTiming(0, {
      duration: 420,
      easing: Easing.out(Easing.quad),
    });
  }, [Math.floor(beat), beatPulse]);

  // Smooth follow of input level.
  useEffect(() => {
    levelPulse.value = withTiming(Math.max(0, Math.min(1, inputLevel)), {
      duration: 80,
    });
  }, [inputLevel, levelPulse]);

  const r0 = useDerivedValue(
    () => baseRadius * (1 + beatPulse.value * 0.25 + levelPulse.value * 0.4),
  );
  const r1 = useDerivedValue(
    () => baseRadius * 2 * (1 + beatPulse.value * 0.18 + levelPulse.value * 0.3),
  );
  const r2 = useDerivedValue(
    () => baseRadius * 3 * (1 + beatPulse.value * 0.12 + levelPulse.value * 0.22),
  );
  const r3 = useDerivedValue(
    () => baseRadius * 4 * (1 + beatPulse.value * 0.08 + levelPulse.value * 0.16),
  );

  const opacityOuter = useDerivedValue(
    () => 0.35 + beatPulse.value * 0.5 + levelPulse.value * 0.3,
  );
  const opacityInner = useDerivedValue(
    () => 0.6 + beatPulse.value * 0.3 + levelPulse.value * 0.2,
  );

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={{ width, height }}>
        <Group>
          <Circle cx={cx} cy={cy} r={r3} color={RING_COLORS[3]} opacity={opacityOuter} style="stroke" strokeWidth={3}>
            <BlurMask blur={18} style="normal" />
          </Circle>
          <Circle cx={cx} cy={cy} r={r2} color={RING_COLORS[2]} opacity={opacityOuter} style="stroke" strokeWidth={3}>
            <BlurMask blur={14} style="normal" />
          </Circle>
          <Circle cx={cx} cy={cy} r={r1} color={RING_COLORS[1]} opacity={opacityInner} style="stroke" strokeWidth={3}>
            <BlurMask blur={10} style="normal" />
          </Circle>
          <Circle cx={cx} cy={cy} r={r0} opacity={opacityInner}>
            <RadialGradient
              c={vec(cx, cy)}
              r={baseRadius * 1.6}
              colors={[RING_COLORS[0], 'transparent']}
            />
            <BlurMask blur={20} style="normal" />
          </Circle>
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
});
