import apiClient from "@/api/axios";
import type { Schedule, CreateSchedulePayload, UpdateSchedulePayload } from "@/types/schedule.type";
import type { FreeSlot } from "@/types/free-slot.type";

export async function getSchedulesApi(start: string, end: string): Promise<Schedule[]> {
  const response = await apiClient.get<Schedule[]>("/schedules", {
    params: { start, end },
  });
  return response.data;
}

export async function getScheduleDetailApi(id: number): Promise<Schedule> {
  const response = await apiClient.get<Schedule>(`/schedules/${id}`);
  return response.data;
}

export async function createScheduleApi(payload: CreateSchedulePayload): Promise<Schedule> {
  const response = await apiClient.post<Schedule>("/schedules", {
    ...payload,
    status: "PLANNED",
  });
  return response.data;
}

export async function updateScheduleApi(id: number, payload: UpdateSchedulePayload): Promise<Schedule> {
  const response = await apiClient.patch<Schedule>(`/schedules/${id}`, payload);
  return response.data;
}

export async function getFreeSlotsApi(date: string, durationMinutes: number): Promise<FreeSlot[]> {
  const response = await apiClient.get<FreeSlot[]>("/schedules/free-slots", {
    params: { date, durationMinutes },
  });
  return response.data;
}

export async function deleteScheduleApi(id: number): Promise<void> {
  await apiClient.delete(`/schedules/${id}`);
}
