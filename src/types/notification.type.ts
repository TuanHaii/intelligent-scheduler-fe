export type NotificationType = "REMINDER_15M" | "REMINDER_30M" | "REMINDER_1H" | "SCHEDULE_CREATED" | "SCHEDULE_UPDATED" | "SCHEDULE_DELETED" | "TASK_ASSIGNED" | "TASK_UPDATED" | "SYSTEM" | "GENERAL";

export interface Notification {
  id: number;
  userId: string;
  scheduleId?: number | null;
  content: string;
  type: NotificationType;
  isRead: boolean;
  scheduledAt: string;
  sentAt: string;
  createdAt: string;
}

export interface UnreadCountResponse {
  unread: number;
}
