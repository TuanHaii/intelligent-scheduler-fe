import type { Task } from "@/types/task.type";

export interface DragTask {
  id: number;
  title: string;
  estimatedDuration: number | null;
}

export interface DropPosition {
  x: number;
  y: number;
}

export interface QuickScheduleData {
  task: DragTask;
  day: Date;
  minutes: number;
  position: DropPosition;
}

export interface ResizeState {
  scheduleId: number;
  startClientY: number;
  originalHeight: number;
  originalEndTime: Date;
}

export interface GhostPreview {
  dayIdx: number;
  minutes: number;
  height: number;
  title: string;
}

export const SLOT_INTERVAL = 30;
export const HOUR_HEIGHT = 60;
export const EDGE_THRESHOLD = 120;
export const MAX_SCROLL_SPEED = 15;
export const SNAP_INTERVAL = 15;
export const MIN_EVENT_HEIGHT = 15;
