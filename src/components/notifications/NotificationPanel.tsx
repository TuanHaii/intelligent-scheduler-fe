import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, CheckCheck, Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/stores/notification.store";
import { useWebSocketStore } from "@/stores/websocket.store";
import { NotificationItem } from "./NotificationItem";
import { cn } from "@/lib/utils";
import { useScheduleNavigation } from "./useScheduleNavigation";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const connectionStatus = useWebSocketStore((s) => s.connectionStatus);
  // const connectionStatus = useNotificationStore((s) => s.connectionStatus);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const navigateToSchedule = useScheduleNavigation();

  const [dismissedBanner, setDismissedBanner] = useState(false);

  const handleScheduleClick = useCallback(
    (scheduleId: number) => {
      navigateToSchedule(scheduleId);
      onClose();
    },
    [navigateToSchedule, onClose]
  );

  const handleMarkAllRead = useCallback(async () => {
    const unreadItems = notifications.filter((n) => !n.isRead);
    await Promise.all(unreadItems.map((n) => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  const statusBanner = useMemo(() => {
    if (connectionStatus === "connected") return null;
    if (dismissedBanner) return null;
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50/80 border-b border-amber-200/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs font-medium text-amber-700">
          {connectionStatus === "reconnecting" ? "⚠️ Reconnecting..." : "🔴 Disconnected"}
        </span>
        <button
          onClick={() => setDismissedBanner(true)}
          className="ml-auto text-amber-400 hover:text-amber-600"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }, [connectionStatus, dismissedBanner]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="w-[420px] max-h-[600px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-blue-500/10 rounded-2xl overflow-hidden flex flex-col"
    >
      {statusBanner}

      <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 tracking-tight">Notifications</h2>
            <p className="text-[11px] text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="w-7 h-7 rounded-lg hover:bg-white/30 flex items-center justify-center transition-colors duration-150"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/30 flex items-center justify-center transition-colors duration-150"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto smooth-scroll">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <span className="text-4xl mb-4">🎉</span>
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Bạn chưa có thông báo nào.
            </p>
            <p className="text-xs text-gray-400 text-center max-w-[260px]">
              Mọi lời nhắc lịch trình sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className={cn("py-1", notifications.length === 0 && "hidden")}>
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onScheduleClick={handleScheduleClick}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="px-5 py-2.5 border-t border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              connectionStatus === "connected" ? "bg-emerald-400" : "bg-amber-400"
            )}
          />
          <span className="text-[10px] text-gray-400">
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "reconnecting"
              ? "Reconnecting..."
              : "Disconnected"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
