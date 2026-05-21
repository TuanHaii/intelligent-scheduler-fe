export interface TimeSlot {
  day: Date;
  minutes: number;
}

export interface SelectedRange {
  start: TimeSlot;
  end: TimeSlot;
}

export interface DragSelectionState {
  isDragging: boolean;
  startSlot: TimeSlot | null;
  currentSlot: TimeSlot | null;
  startDayIndex: number;
  currentDayIndex: number;
}

export const SLOT_INTERVAL = 15;
export const SLOT_HEIGHT = 25;
export const HOUR_HEIGHT = 100;
export const NUM_SLOTS = 96;
export const HEADER_HEIGHT = 56;
export const START_HOUR = 1;
export const END_HOUR = 23;
