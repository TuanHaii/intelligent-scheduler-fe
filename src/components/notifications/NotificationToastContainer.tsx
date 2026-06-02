import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";
import { useNotificationStore } from "@/stores/notification.store";
import type { Notification } from "@/types/notification.type";

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

interface ToastItemProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

function ToastItem({ notification, onDismiss }: ToastItemProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification.id, onDismiss]);

  const icon = TYPE_ICONS[notification.type] || "💬";

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="w-[380px] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-blue-500/10 rounded-2xl p-4 flex items-start gap-3 cursor-pointer"
      onClick={() => onDismiss(notification.id)}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
          {notification.type.replace(/_/g, " ")}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{notification.content}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/30 flex items-center justify-center"
      >
        <X className="w-3 h-3 text-gray-400" />
      </button>
    </motion.div>
  );
}

export function NotificationToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);
  const removeToast = useNotificationStore((s) => s.removeToast);

  const handleDismiss = useCallback(
    (id: number) => {
      removeToast(id);
    },
    [removeToast]
  );

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.slice(0, 3).map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <ToastItem notification={n} onDismiss={handleDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
