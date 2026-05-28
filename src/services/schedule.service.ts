import {
  getSchedulesApi,
  getScheduleDetailApi,
  createScheduleApi,
  updateScheduleApi,
  deleteScheduleApi,
  getFreeSlotsApi,
} from "@/api/schedule.api";
import type { Schedule, CreateSchedulePayload, UpdateSchedulePayload } from "@/types/schedule.type";
import type { FreeSlot } from "@/types/free-slot.type";
import { handleApiCall } from "@/api/axios";

export async function getSchedulesService(start: string, end: string): Promise<Schedule[]> {
  return handleApiCall(() => getSchedulesApi(start, end), "Failed to fetch schedules");
}

export async function getScheduleDetailService(id: number): Promise<Schedule> {
  return handleApiCall(() => getScheduleDetailApi(id), "Failed to fetch schedule detail");
}

export async function createScheduleService(payload: CreateSchedulePayload): Promise<Schedule> {
  return handleApiCall(() => createScheduleApi(payload), "Failed to create schedule");
}

export async function updateScheduleService(id: number, payload: UpdateSchedulePayload): Promise<Schedule> {
  return handleApiCall(() => updateScheduleApi(id, payload), "Failed to update schedule");
}

export async function getFreeSlotsService(date: string, durationMinutes: number): Promise<FreeSlot[]> {
  return handleApiCall(() => getFreeSlotsApi(date, durationMinutes), "Failed to fetch free slots");
}

export async function deleteScheduleService(id: number): Promise<void> {
  return handleApiCall(() => deleteScheduleApi(id), "Failed to delete schedule");
}
