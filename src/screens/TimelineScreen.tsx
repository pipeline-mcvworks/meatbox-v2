import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors, spacing, typography } from '../theme';
import { useProjectStore } from '../stores/projectStore';
import { useUiStore } from '../stores/uiStore';
import { TimelineGrid } from '../components/timeline/TimelineGrid';
import { TimelineLane } from '../components/timeline/TimelineLane';
import { TimelineBottomSheet } from '../components/timeline/TimelineBottomSheet';
import { TransportControls } from '../components/transport/TransportControls';
import { BpmStepper } from '../components/transport/BpmStepper';
import { QuantizeSlider } from '../components/transport/QuantizeSlider';

const LANE_NAMES = ['Kick', 'Snare', 'Hat', 'Perc', 'Unknown'] as const;
const LANE_KEYS: Array<'kick' | 'snare' | 'hat' | 'perc' | 'unknown'> = ['kick', 'snare', 'hat', 'perc', 'unknown'];
const BEATS_PER_BAR = 4;
const DEFAULT_BARS = 8;
const PIXELS_PER_BEAT = 80;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

export function TimelineScreen(): React.JSX.Element {
  const { events, bpm, loop, isPlaying, quantizeStrength, addEvent, updateEvent, removeEvent, setBpm, toggleLoop, togglePlay, setQuantizeStrength } = useProjectStore();
  const { selectedEventId, setSelectedEventId } = useUiStore();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  const [playheadBeat, setPlayheadBeat] = useState(0);
  const playheadRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const totalBeats = DEFAULT_BARS * BEATS_PER_BAR;
  const totalWidth = totalBeats * PIXELS_PER_BEAT * currentScale;

  // Playhead animation
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timestamp;

      const beatsPerSecond = bpm / 60;
      const beatDelta = delta * beatsPerSecond;
      let newBeat = playheadRef.current + beatDelta;

      if (loop && newBeat >= totalBeats) {
        newBeat = 0;
      } else if (newBeat >= totalBeats) {
        newBeat = totalBeats;
        togglePlay(); // stop at end
      }

      playheadRef.current = newBeat;
      setPlayheadBeat(newBeat);

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, bpm, loop, totalBeats, togglePlay]);

  const onPinch = useCallback((event: PinchGestureHandlerGestureEvent) => {
    const newScale = savedScale.value * event.nativeEvent.scale;
    scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    setCurrentScale(scale.value);
  }, []);

  const onPinchEnd = useCallback(() => {
    savedScale.value = scale.value;
  }, []);

  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, [setSelectedEventId]);

  const handleMoveEvent = useCallback((eventId: string, newStartBeat: number) => {
    const snapped = Math.round(newStartBeat / (1 / quantizeStrength)) * (1 / quantizeStrength);
    updateEvent(eventId, { startBeat: Math.max(0, snapped) });
  }, [updateEvent, quantizeStrength]);

  const handleDeleteEvent = useCallback((eventId: string) => {
    removeEvent(eventId);
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
    }
  }, [removeEvent, selectedEventId, setSelectedEventId]);

  const handleDuplicateEvent = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      addEvent({
        ...event,
        id: `${event.id}-copy-${Date.now()}`,
        startBeat: event.startBeat + 1,
      });
    }
  }, [events, addEvent]);

  const handleLaneChange = useCallback((eventId: string, newLane: string) => {
    updateEvent(eventId, { lane: newLane as any });
  }, [updateEvent]);

  const handleVelocityChange = useCallback((eventId: string, newVelocity: number) => {
    updateEvent(eventId, { velocity: newVelocity });
  }, [updateEvent]);

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <BpmStepper bpm={bpm} onBpmChange={setBpm} />
        <QuantizeSlider value={quantizeStrength} onValueChange={setQuantizeStrength} />
      </View>

      <TransportControls
        isPlaying={isPlaying}
        loop={loop}
        onPlayPause={togglePlay}
        onToggleLoop={toggleLoop}
        playheadBeat={playheadBeat}
        totalBeats={totalBeats}
        pixelsPerBeat={PIXELS_PER_BEAT * currentScale}
      />

      <PinchGestureHandler onGestureEvent={onPinch} onEnded={onPinchEnd}>
        <Animated.View style={[styles.timelineContainer, animatedStyle]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: totalWidth }}>
              <TimelineGrid totalBeats={totalBeats} beatsPerBar={BEATS_PER_BAR} pixelsPerBeat={PIXELS_PER_BEAT * currentScale} />
              {LANE_KEYS.map((laneKey, index) => (
                <TimelineLane
                  key={laneKey}
                  laneName={LANE_NAMES[index]}
                  laneKey={laneKey}
                  events={events.filter(e => e.lane === laneKey)}
                  pixelsPerBeat={PIXELS_PER_BEAT * currentScale}
                  selectedEventId={selectedEventId}
                  onSelectEvent={handleSelectEvent}
                  onMoveEvent={handleMoveEvent}
                />
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </PinchGestureHandler>

      {selectedEvent && (
        <TimelineBottomSheet
          event={selectedEvent}
          onDelete={handleDeleteEvent}
          onDuplicate={handleDuplicateEvent}
          onLaneChange={handleLaneChange}
          onVelocityChange={handleVelocityChange}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neonPurple,
  },
  timelineContainer: {
    flex: 1,
    marginTop: spacing.sm,
  },
});
