import {
  format,
  startOfWeek,
  addDays,
  parseISO,
  startOfDay,
  getHours,
  getMinutes,
  differenceInMinutes,
  setHours,
  setMinutes,
} from "date-fns";
import { SLOT_INTERVAL, SLOT_HEIGHT, HOUR_HEIGHT, NUM_SLOTS } from "@/types/calendar";

export const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
};

export const formatTime = (isoString: string) => {
  return format(parseISO(isoString), "HH:mm");
};

export const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

export const getSlotPosition = (startTime: string, endTime: string) => {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  const startMins = getHours(start) * 60 + getMinutes(start);
  const durationMins = differenceInMinutes(end, start);
  const top = startMins * PIXELS_PER_MINUTE;
  const height = durationMins * PIXELS_PER_MINUTE;
  return { top, height };
};

export const createIsoDateFromSlot = (day: Date, hour: number) => {
  return setHours(startOfDay(day), hour).toISOString();
};

export const createIsoDateFromMinutes = (day: Date, minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return setMinutes(setHours(startOfDay(day), h), m).toISOString();
};

export const snapToInterval = (minutes: number, interval: number = SLOT_INTERVAL) => {
  return Math.round(minutes / interval) * interval;
};

export const generateTimeSlots = () => {
  return Array.from({ length: NUM_SLOTS }, (_, i) => {
    const minutes = i * SLOT_INTERVAL;
    const isHourSlot = i % 4 === 3;
    const isHalfHourSlot = i % 4 === 1;
    return { minutes, isHourSlot, isHalfHourSlot };
  });
};

export const hours = Array.from({ length: 24 }).map((_, i) => i);

export const getCurrentTimeMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const getCurrentHour = () => new Date().getHours();

export const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export function toTimeInputValue(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : trimmed;
}
