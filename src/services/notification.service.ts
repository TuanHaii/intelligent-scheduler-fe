import {
  getNotificationsApi,
  markNotificationReadApi,
  getUnreadCountApi,
} from "@/api/notification.api";
import type { Notification, UnreadCountResponse } from "@/types/notification.type";
import { handleApiCall } from "@/api/axios";

export async function getNotificationsService(limit = 50): Promise<Notification[]> {
  return handleApiCall(() => getNotificationsApi(limit), "Failed to fetch notifications");
}

export async function markNotificationReadService(id: number): Promise<void> {
  return handleApiCall(() => markNotificationReadApi(id), "Failed to mark notification as read");
}

export async function getUnreadCountService(): Promise<UnreadCountResponse> {
  return handleApiCall(() => getUnreadCountApi(), "Failed to fetch unread count");
}
