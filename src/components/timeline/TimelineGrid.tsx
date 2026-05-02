import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface TimelineGridProps {
  totalBeats: number;
  beatsPerBar: number;
  pixelsPerBeat: number;
}

export function TimelineGrid({ totalBeats, beatsPerBar, pixelsPerBeat }: TimelineGridProps): React.JSX.Element {
  const bars = Math.ceil(totalBeats / beatsPerBar);
  const gridLines: React.JSX.Element[] = [];

  for (let bar = 0; bar < bars; bar++) {
    for (let beat = 0; beat < beatsPerBar; beat++) {
      const globalBeat = bar * beatsPerBar + beat;
      if (globalBeat >= totalBeats) break;
      const x = globalBeat * pixelsPerBeat;
      const isBarLine = beat === 0;
      gridLines.push(
        <View
          key={`grid-${globalBeat}`}
          style={[
            styles.gridLine,
            {
              left: x,
              height: isBarLine ? 40 : 20,
              backgroundColor: isBarLine ? colors.neonPurple : colors.border,
              opacity: isBarLine ? 0.6 : 0.3,
            },
          ]}
        />
      );
    }
  }

  return <View style={styles.container}>{gridLines}</View>;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 40,
  },
  gridLine: {
    position: 'absolute',
    width: 1,
    bottom: 0,
  },
});
