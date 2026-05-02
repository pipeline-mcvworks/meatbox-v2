import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { TimelineEventBlock } from './TimelineEventBlock';
import { TimelineEvent } from '../../stores/projectStore';

interface TimelineLaneProps {
  laneName: string;
  laneKey: string;
  events: TimelineEvent[];
  pixelsPerBeat: number;
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
  onMoveEvent: (eventId: string, newStartBeat: number) => void;
}

export function TimelineLane({
  laneName,
  laneKey,
  events,
  pixelsPerBeat,
  selectedEventId,
  onSelectEvent,
  onMoveEvent,
}: TimelineLaneProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.laneLabel}>{laneName}</Text>
      <View style={styles.laneTrack}>
        {events.map(event => (
          <TimelineEventBlock
            key={event.id}
            event={event}
            pixelsPerBeat={pixelsPerBeat}
            isSelected={event.id === selectedEventId}
            onSelect={() => onSelectEvent(event.id)}
            onMove={(newStartBeat) => onMoveEvent(event.id, newStartBeat)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  laneLabel: {
    width: 60,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  laneTrack: {
    flex: 1,
    position: 'relative',
    height: '100%',
  },
});
