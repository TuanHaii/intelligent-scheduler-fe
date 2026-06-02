import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNotificationStore } from "@/stores/notification.store";
import type { Notification } from "@/types/notification.type";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, string> = {
  REMINDER_15M: "🔔",
  REMINDER_30M: "🔔",
  REMINDER_1H: "🔔",
  SCHEDULE_CREATED: "📅",
  SCHEDULE_UPDATED: "✏️",
  SCHEDULE_DELETED: "🗑️",
  TASK_ASSIGNED: "📋",
  TASK_UPDATED: "🔄",
  SYSTEM: "⚙️",
  GENERAL: "💬",
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

interface NotificationItemProps {
  notification: Notification;
  onScheduleClick?: (scheduleId: number) => void;
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  onScheduleClick,
}: NotificationItemProps) {
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  const handleClick = useCallback(async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.scheduleId && onScheduleClick) {
      onScheduleClick(notification.scheduleId);
    }
  }, [notification, markAsRead, onScheduleClick]);

  const icon = TYPE_ICONS[notification.type] || "💬";

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      className={cn(
        "w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 border-b border-white/10 hover:bg-white/30 cursor-pointer",
        !notification.isRead && "bg-blue-50/40"
      )}
    >
      {!notification.isRead && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40" />
      )}
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-relaxed",
            notification.isRead ? "text-gray-500" : "text-gray-800 font-medium"
          )}
        >
          {notification.content}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-gray-400">{formatTime(notification.sentAt)}</span>
          <span className="text-[11px] text-gray-400">·</span>
          <span className="text-[11px] text-gray-400">{formatDate(notification.sentAt)}</span>
        </div>
      </div>
    </motion.button>
  );
});
