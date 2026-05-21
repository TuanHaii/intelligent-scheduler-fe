import { parseISO, differenceInMinutes, getHours, getMinutes, isSameDay as dfIsSameDay } from "date-fns";
import type { Schedule } from "@/types/schedule.type";

export type ScheduleRenderType = "TIME_BLOCK" | "LONG_EVENT" | "ALL_DAY" | "MULTI_DAY";

export function classifySchedule(schedule: Schedule): ScheduleRenderType {
  const start = parseISO(schedule.startTime);
  const end = parseISO(schedule.endTime);
  const durationMins = differenceInMinutes(end, start);

  if (!dfIsSameDay(start, end)) {
    return "MULTI_DAY";
  }

  const startHour = getHours(start);
  const startMin = getMinutes(start);
  const endHour = getHours(end);
  const endMin = getMinutes(end);

  if (
    (startHour === 0 && startMin === 0 && endHour >= 22 && endMin >= 0) ||
    durationMins >= 24 * 60
  ) {
    return "ALL_DAY";
  }

  if (durationMins >= 8 * 60) {
    return "LONG_EVENT";
  }

  return "TIME_BLOCK";
}

export function getDurationLabel(mins: number): string {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  const s = parseISO(startTime);
  const e = parseISO(endTime);
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${fmt(s)} → ${fmt(e)}`;
}
