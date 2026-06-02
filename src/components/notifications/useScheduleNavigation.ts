import { useCallback } from "react";
import { useScheduleNavigationStore } from "@/stores/schedule-navigation.store";

export function useScheduleNavigation() {
  const setSelectedScheduleId = useScheduleNavigationStore((s) => s.setSelectedScheduleId);

  const navigateToSchedule = useCallback(
    (scheduleId: number) => {
      setSelectedScheduleId(scheduleId);
    },
    [setSelectedScheduleId]
  );

  return navigateToSchedule;
}
