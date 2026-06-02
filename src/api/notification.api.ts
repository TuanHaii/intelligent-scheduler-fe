import apiClient from "@/api/axios";
import type { Notification, UnreadCountResponse } from "@/types/notification.type";

export async function getNotificationsApi(limit = 50): Promise<Notification[]> {
  const res = await apiClient.get<Notification[]>("/notifications", {
    params: { limit },
  });
  return res.data;
}

export async function markNotificationReadApi(id: number): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function getUnreadCountApi(): Promise<UnreadCountResponse> {
  const res = await apiClient.get<UnreadCountResponse>("/notifications/unread-count");
  return res.data;
}
