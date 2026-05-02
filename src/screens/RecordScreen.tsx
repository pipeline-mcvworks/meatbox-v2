import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Animated,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Countdown } from '../components/recorder/Countdown';
import { RecordButton } from '../components/recorder/RecordButton';
import { RecordingTimer } from '../components/recorder/RecordingTimer';
import { InputMeter } from '../components/recorder/InputMeter';

export function RecordScreen(): React.JSX.Element {
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [bpm, setBpm] = useState('120');
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStartPress = () => {
    if (micPermission === 'denied') {
      // Placeholder: would request permission
      return;
    }
    setIsCountingDown(true);
  };

  const handleCountdownComplete = () => {
    setIsCountingDown(false);
    setIsRecording(true);
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopPress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const handleRetry = () => {
    handleStopPress();
    setIsCountingDown(false);
    setElapsedSeconds(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record</Text>

      {/* Mic Permission State Placeholder */}
      <View style={styles.permissionBanner}>
        <Text style={styles.permissionText}>
          Mic: {micPermission === 'granted' ? '✅ Granted' : micPermission === 'denied' ? '❌ Denied' : '⚠️ Undetermined'}
        </Text>
        {micPermission !== 'granted' && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => setMicPermission('granted')}
            activeOpacity={0.75}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Countdown */}
      {isCountingDown && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {/* Recording Timer */}
      {isRecording && (
        <RecordingTimer elapsedSeconds={elapsedSeconds} />
      )}

      {/* Input Meter Placeholder */}
      {isRecording && (
        <InputMeter />
      )}

      {/* Record/Stop Button */}
      <View style={styles.recordButtonContainer}>
        {!isRecording && !isCountingDown ? (
          <RecordButton onPress={handleStartPress} />
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopPress}
            activeOpacity={0.75}
          >
            <View style={styles.stopIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* BPM Input */}
      <View style={styles.row}>
        <Text style={styles.label}>BPM:</Text>
        <TextInput
          style={styles.input}
          value={bpm}
          onChangeText={setBpm}
          keyboardType="number-pad"
          placeholder="120"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Metronome Toggle */}
      <View style={styles.row}>
        <Text style={styles.label}>Metronome:</Text>
        <Switch
          value={metronomeOn}
          onValueChange={setMetronomeOn}
          trackColor={{ false: colors.surface, true: colors.neonGreen }}
          thumbColor={metronomeOn ? colors.neonGreen : colors.textSecondary}
        />
      </View>

      {/* Retry Button */}
      {(isRecording || isCountingDown) && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.75}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.neonGreen,
    marginBottom: spacing.md,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  permissionText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    marginRight: spacing.sm,
  },
  permissionButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  permissionButtonText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  recordButtonContainer: {
    marginVertical: spacing.lg,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: colors.textPrimary,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    width: '100%',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 8,
    padding: spacing.sm,
    width: 80,
    textAlign: 'center',
    fontSize: typography.sizes.md,
    borderWidth: 1,
    borderColor: colors.neonGreen,
  },
  retryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
