import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MicPermissionStatus = 'undetermined' | 'granted' | 'denied';

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export type AnalysisStatus = 'idle' | 'pending' | 'complete' | 'error';

export type AudioState = {
  /** Current microphone permission status */
  micPermission: MicPermissionStatus;
  /** Current recording lifecycle state */
  recordingStatus: RecordingStatus;
  /** URI of the most recently completed recording */
  currentRecordingUri: string | null;
  /** Duration of the most recently completed recording in seconds */
  durationSeconds: number;
  /** Normalised waveform peak samples (values 0–1) */
  waveformPeaks: number[];
  /** Status of the analysis pipeline for the current recording */
  analysisStatus: AnalysisStatus;

  // Actions
  setMicPermission: (status: MicPermissionStatus) => void;
  setRecordingStatus: (status: RecordingStatus) => void;
  setCurrentRecordingUri: (uri: string | null) => void;
  setDurationSeconds: (seconds: number) => void;
  setWaveformPeaks: (peaks: number[]) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  resetAudio: () => void;
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialAudioState = {
  micPermission: 'undetermined' as MicPermissionStatus,
  recordingStatus: 'idle' as RecordingStatus,
  currentRecordingUri: null,
  durationSeconds: 0,
  waveformPeaks: [] as number[],
  analysisStatus: 'idle' as AnalysisStatus,
};

export const useAudioStore = create<AudioState>((set) => ({
  ...initialAudioState,

  setMicPermission: (micPermission) => set({ micPermission }),

  setRecordingStatus: (recordingStatus) => set({ recordingStatus }),

  setCurrentRecordingUri: (currentRecordingUri) => set({ currentRecordingUri }),

  setDurationSeconds: (durationSeconds) => set({ durationSeconds }),

  setWaveformPeaks: (waveformPeaks) => set({ waveformPeaks }),

  setAnalysisStatus: (analysisStatus) => set({ analysisStatus }),

  resetAudio: () => set(initialAudioState),
}));
