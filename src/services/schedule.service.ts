import { isAxiosError } from "axios";
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
import { ApiError } from "@/types/schedule.type";

export async function getSchedulesService(start: string, end: string): Promise<Schedule[]> {
  try {
    return await getSchedulesApi(start, end);
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      throw new ApiError(error.response.data?.message || "Failed to fetch schedules", error.response.status);
    }
    throw new ApiError("Failed to fetch schedules", 500);
  }
}

export async function getScheduleDetailService(id: number): Promise<Schedule> {
  try {
    return await getScheduleDetailApi(id);
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      throw new ApiError(error.response.data?.message || "Failed to fetch schedule detail", error.response.status);
    }
    throw new ApiError("Failed to fetch schedule detail", 500);
  }
}

export async function createScheduleService(payload: CreateSchedulePayload): Promise<Schedule> {
  try {
    return await createScheduleApi(payload);
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      throw new ApiError(error.response.data?.message || "Failed to create schedule", error.response.status);
    }
    throw new ApiError("Failed to create schedule", 500);
  }
}

export async function updateScheduleService(id: number, payload: UpdateSchedulePayload): Promise<Schedule> {
  try {
    return await updateScheduleApi(id, payload);
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      throw new ApiError(error.response.data?.message || "Failed to update schedule", error.response.status);
    }
    throw new ApiError("Failed to update schedule", 500);
  }
}

export async function getFreeSlotsService(date: string, durationMinutes: number): Promise<FreeSlot[]> {
  try {
    return await getFreeSlotsApi(date, durationMinutes);
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      throw new ApiError(error.response.data?.message || "Failed to fetch free slots", error.response.status);
    }
    throw new ApiError("Failed to fetch free slots", 500);
  }
}

export async function deleteScheduleService(id: number): Promise<void> {
  try {
    await deleteScheduleApi(id);
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      throw new ApiError(error.response.data?.message || "Failed to delete schedule", error.response.status);
    }
    throw new ApiError("Failed to delete schedule", 500);
  }
}
