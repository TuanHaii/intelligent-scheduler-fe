import { create } from "zustand";

interface ScheduleNavigationState {
  selectedScheduleId: number | null;
  setSelectedScheduleId: (id: number | null) => void;
}

export const useScheduleNavigationStore = create<ScheduleNavigationState>((set) => ({
  selectedScheduleId: null,
  setSelectedScheduleId: (id) => set({ selectedScheduleId: id }),
}));
