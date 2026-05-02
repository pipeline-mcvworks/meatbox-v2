import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActiveTool = 'select' | 'draw' | 'erase' | 'slice';

export type UIState = {
  /** ID of the currently selected audio event, or null */
  selectedEventId: string | null;
  /** Pixels per beat on the timeline */
  timelineZoom: number;
  /** Horizontal scroll offset of the timeline in pixels */
  timelineScroll: number;
  /** Currently active editing tool */
  activeTool: ActiveTool;
  /** ID of the active visualizer preset */
  visualizerPresetId: string;

  // Actions
  setSelectedEventId: (id: string | null) => void;
  setTimelineZoom: (zoom: number) => void;
  setTimelineScroll: (scroll: number) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setVisualizerPresetId: (id: string) => void;
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUIStore = create<UIState>((set) => ({
  selectedEventId: null,
  timelineZoom: 80,       // 80 px per beat default
  timelineScroll: 0,
  activeTool: 'select',
  visualizerPresetId: 'default',

  setSelectedEventId: (selectedEventId) => set({ selectedEventId }),

  setTimelineZoom: (timelineZoom) => set({ timelineZoom }),

  setTimelineScroll: (timelineScroll) => set({ timelineScroll }),

  setActiveTool: (activeTool) => set({ activeTool }),

  setVisualizerPresetId: (visualizerPresetId) => set({ visualizerPresetId }),
}));
