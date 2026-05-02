import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  PanResponder,
  type LayoutChangeEvent,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { Canvas, Rect, Line, vec } from '@shopify/react-native-skia';
import { colors } from '../../theme';

export type WaveformProps = {
  /** Normalised peaks, values in [0, 1]. */
  peaks: number[];
  /** Height of the waveform in px. */
  height?: number;
  /** Width per peak bin in px. Total content width = peaks.length * pxPerBin. */
  pxPerBin?: number;
  /** Scrub position as a fraction of the total length, in [0, 1]. */
  scrubPosition: number;
  /** Called as the user drags, with a fraction in [0, 1]. */
  onScrubChange?: (position: number) => void;
  /** Called when the user releases. */
  onScrubEnd?: (position: number) => void;
};

const DEFAULT_HEIGHT = 120;
const DEFAULT_PX_PER_BIN = 4;
const BAR_GAP = 1;

/**
 * Renders a peaks array as vertical neon bars on a Skia canvas, with a
 * draggable scrub marker. If the content is wider than the viewport the
 * canvas scrolls horizontally.
 */
export function Waveform({
  peaks,
  height = DEFAULT_HEIGHT,
  pxPerBin = DEFAULT_PX_PER_BIN,
  scrubPosition,
  onScrubChange,
  onScrubEnd,
}: WaveformProps): React.JSX.Element {
  const [viewportWidth, setViewportWidth] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollXRef = useRef(0);

  const binCount = peaks.length;
  const contentWidth = Math.max(viewportWidth, binCount * pxPerBin);

  const handleViewportLayout = (e: LayoutChangeEvent) => {
    setViewportWidth(e.nativeEvent.layout.width);
  };

  const clampFraction = (f: number) => Math.max(0, Math.min(1, f));

  const fractionFromTouch = (touchX: number): number => {
    // touchX is relative to the ScrollView viewport; add scroll offset to get
    // a position in content space.
    const xInContent = touchX + scrollXRef.current;
    if (contentWidth <= 0) return 0;
    return clampFraction(xInContent / contentWidth);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          const f = fractionFromTouch(evt.nativeEvent.locationX);
          onScrubChange?.(f);
        },
        onPanResponderMove: (
          evt: GestureResponderEvent,
          _g: PanResponderGestureState
        ) => {
          const f = fractionFromTouch(evt.nativeEvent.locationX);
          onScrubChange?.(f);
        },
        onPanResponderRelease: (evt: GestureResponderEvent) => {
          const f = fractionFromTouch(evt.nativeEvent.locationX);
          onScrubEnd?.(f);
        },
        onPanResponderTerminate: (evt: GestureResponderEvent) => {
          const f = fractionFromTouch(evt.nativeEvent.locationX);
          onScrubEnd?.(f);
        },
      }),
    // We intentionally re-create when sizing changes so closures use fresh values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contentWidth, viewportWidth, onScrubChange, onScrubEnd]
  );

  const scrubX = clampFraction(scrubPosition) * contentWidth;

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={handleViewportLayout}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollXRef.current = e.nativeEvent.contentOffset.x;
        }}
        contentContainerStyle={{ width: contentWidth, height }}
      >
        <View
          style={{ width: contentWidth, height }}
          {...panResponder.panHandlers}
        >
          <Canvas style={{ width: contentWidth, height }}>
            {peaks.map((p, i) => {
              const barHeight = Math.max(1, p * (height - 4));
              const x = i * pxPerBin;
              const w = Math.max(1, pxPerBin - BAR_GAP);
              const y = (height - barHeight) / 2;
              return (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  width={w}
                  height={barHeight}
                  color={colors.neonCyan}
                />
              );
            })}
            {/* Scrub marker */}
            <Line
              p1={vec(scrubX, 0)}
              p2={vec(scrubX, height)}
              color={colors.neonMagenta ?? '#ff2bd6'}
              strokeWidth={2}
            />
          </Canvas>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neonCyan,
    overflow: 'hidden',
  },
});
