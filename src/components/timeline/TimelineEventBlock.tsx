import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, PanResponder } from 'react-native';
import { colors } from '../../theme';
import { TimelineEvent } from '../../stores/projectStore';

interface TimelineEventBlockProps {
  event: TimelineEvent;
  pixelsPerBeat: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (newStartBeat: number) => void;
}

const LANE_COLORS: Record<string, string> = {
  kick: colors.neonPurple,
  snare: colors.neonBlue,
  hat: colors.neonGreen,
  perc: colors.neonOrange,
  unknown: colors.textSecondary,
};

const BLOCK_HEIGHT = 40;
const MIN_BLOCK_WIDTH = 10;

export function TimelineEventBlock({
  event,
  pixelsPerBeat,
  isSelected,
  onSelect,
  onMove,
}: TimelineEventBlockProps): React.JSX.Element {
  const startXRef = useRef(0);
  const startBeatRef = useRef(event.startBeat);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startXRef.current = event.startBeat * pixelsPerBeat;
        startBeatRef.current = event.startBeat;
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = startXRef.current + gestureState.dx;
        const newBeat = newX / pixelsPerBeat;
        onMove(newBeat);
      },
      onPanResponderRelease: () => {
        // final position is already set via onMove
      },
    })
  ).current;

  const blockWidth = Math.max(MIN_BLOCK_WIDTH, pixelsPerBeat * 0.8);
  const left = event.startBeat * pixelsPerBeat;

  return (
    <Pressable
      onPress={onSelect}
      onLongPress={onSelect}
      style={({ pressed }) => [
        styles.block,
        {
          left,
          width: blockWidth,
          backgroundColor: LANE_COLORS[event.lane] || colors.textSecondary,
          opacity: pressed ? 0.7 : isSelected ? 1 : 0.8,
          borderColor: isSelected ? colors.white : 'transparent',
          borderWidth: isSelected ? 2 : 0,
        },
      ]}
      {...panResponder.panHandlers}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    height: BLOCK_HEIGHT,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
