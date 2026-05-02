import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PadCell } from './PadCell';

export interface PadConfig {
  id: string;
  label: string;
  color: string;
  onTrigger: () => void;
}

export interface PadGridProps {
  pads: PadConfig[]; // expected length 16 (4x4)
  rows?: number;
  cols?: number;
}

export function PadGrid({ pads, rows = 4, cols = 4 }: PadGridProps): React.JSX.Element {
  const grid: PadConfig[][] = [];
  for (let r = 0; r < rows; r += 1) {
    grid.push(pads.slice(r * cols, r * cols + cols));
  }

  return (
    <View style={styles.container}>
      {grid.map((row, rIdx) => (
        <View key={`row-${rIdx}`} style={styles.row}>
          {row.map((pad) => (
            <PadCell
              key={pad.id}
              label={pad.label}
              color={pad.color}
              onTrigger={pad.onTrigger}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});
