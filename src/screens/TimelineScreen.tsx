import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { colors, spacing, typography } from '../theme';
import { useProjectStore } from '../stores/projectStore';
import { useUiStore } from '../stores/uiStore';
import { TimelineGrid } from '../components/timeline/TimelineGrid';
import { TimelineLane } from '../components/timeline/TimelineLane';
import { TimelineBottomSheet } from '../components/timeline/TimelineBottomSheet';
import { TransportControls } from '../components/transport/TransportControls';
import { BpmStepper } from '../components/transport/BpmStepper';
import { QuantizeSlider } from '../components/transport/QuantizeSlider';
import { SampleScheduler } from '../audio/SampleScheduler';
import { audioPlaybackService } from '../audio/AudioPlaybackService';
import type { LaneType, ScheduledEvent } from '../audio/types';

const LANE_NAMES = ['Kick', 'Snare', 'Hat', 'Perc', 'Unknown'] as const;
const LANE_KEYS: Array<LaneType> = ['kick', 'snare', 'hat', 'perc', 'unknown'];
const BEATS_PER_BAR = 4;
const DEFAULT_BARS = 8;
const PIXELS_PER_BEAT = 80;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const GRID_DIVISION = 0.25; // 16th notes

function snapBeat(rawBeat: number, strength: number): number {
  const snapped = Math.round(rawBeat / GRID_DIVISION) * GRID_DIVISION;
  return rawBeat + (snapped - rawBeat) * strength;
}

// ---------------------------------------------------------------------------
// Module-level scheduler singleton — lives outside React
// ---------------------------------------------------------------------------
const scheduler = new SampleScheduler(audioPlaybackService);

export function TimelineScreen(): React.JSX.Element {
  const {
    events,
    bpm,
    loop,
    isPlaying,
    quantizeStrength,
    addEvent,
    updateEvent,
    removeEvent,
    setBpm,
    toggleLoop,
    togglePlay,
    setQuantizeStrength,
  } = useProjectStore();
  const { selectedEventId, setSelectedEventId } = useUiStore();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  const [playheadBeat, setPlayheadBeat] = useState(0);
  const [sheetEventId, setSheetEventId] = useState<string | null>(null);
  const isPlayingRef = useRef(isPlaying);

  // Keep ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const totalBeats = DEFAULT_BARS * BEATS_PER_BAR;
  const totalWidth = totalBeats * PIXELS_PER_BEAT * currentScale;

  // ---------------------------------------------------------------------------
  // Deferred sample pre-loading — runs after mount so Audio mode is set first
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const LANES_TO_LOAD: LaneType[] = ['kick', 'snare', 'hat', 'perc', 'unknown'];
    Promise.all(LANES_TO_LOAD.map((lane) => audioPlaybackService.loadSample(lane))).catch(
      (err) => console.warn('Sample pre-load error:', err),
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Scheduler wiring: start/stop when isPlaying changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isPlaying) {
      // Build ScheduledEvent list from project events
      const scheduledEvents: ScheduledEvent[] = events.map((e) => ({
        startBeat: e.startBeat,
        lane: (LANE_KEYS.includes(e.lane as LaneType) ? e.lane : 'unknown') as LaneType,
        velocity: typeof e.velocity === 'number' ? e.velocity : 0.8,
      }));

      // Register tick callback BEFORE start() so it's active for this session.
      // onTick() replaces any previous callback, preventing accumulation.
      scheduler.onTick((beat) => {
        setPlayheadBeat(beat);
      });

      scheduler.start(scheduledEvents, bpm, loop);
    } else {
      scheduler.stop();
      // Reset playhead to 0 when stopped
      setPlayheadBeat(0);
    }

    return () => {
      // Cleanup on unmount or before next effect run
      scheduler.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
      setCurrentScale(scale.value);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, [setSelectedEventId]);

  const handleLongPressEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    setSheetEventId(eventId);
  }, [setSelectedEventId]);

  const handleMoveEvent = useCallback((eventId: string, newStartBeat: number) => {
    const snapped = snapBeat(newStartBeat, quantizeStrength);
    updateEvent(eventId, { startBeat: Math.max(0, snapped) });
  }, [updateEvent, quantizeStrength]);

  const handleDeleteEvent = useCallback((eventId: string) => {
    removeEvent(eventId);
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
    }
    setSheetEventId(null);
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
    setSheetEventId(null);
  }, [events, addEvent]);

  const handleLaneChange = useCallback((eventId: string, newLane: string) => {
    updateEvent(eventId, { lane: newLane as any });
    setSheetEventId(null);
  }, [updateEvent]);

  const handleVelocityChange = useCallback((eventId: string, newVelocity: number) => {
    updateEvent(eventId, { velocity: newVelocity });
  }, [updateEvent]);

  const handleCloseSheet = useCallback(() => {
    setSheetEventId(null);
  }, []);

  const sheetEvent = sheetEventId ? events.find(e => e.id === sheetEventId) : null;

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

      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.timelineContainer, animatedStyle]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: totalWidth }}>
              <TimelineGrid
                totalBeats={totalBeats}
                beatsPerBar={BEATS_PER_BAR}
                pixelsPerBeat={PIXELS_PER_BEAT * currentScale}
              />
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
                  onRequestEdit={handleLongPressEvent}
                />
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>

      {sheetEvent && (
        <TimelineBottomSheet
          event={sheetEvent}
          onDelete={handleDeleteEvent}
          onDuplicate={handleDuplicateEvent}
          onLaneChange={handleLaneChange}
          onVelocityChange={handleVelocityChange}
          onClose={handleCloseSheet}
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
