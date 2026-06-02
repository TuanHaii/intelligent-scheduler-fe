import { create } from "zustand";
import type { Notification } from "@/types/notification.type";
import { getNotificationsService, markNotificationReadService } from "@/services/notification.service";
import { notificationWebSocketService } from "@/lib/notification-websocket";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  connected: boolean;
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  toasts: Notification[];

  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => Promise<void>;
  syncNotifications: () => Promise<void>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  setConnected: (connected: boolean, status?: "connected" | "disconnected" | "reconnecting") => void;
  removeToast: (id: number) => void;
  refreshToken: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  connected: false,
  connectionStatus: "disconnected",
  toasts: [],

  addNotification: (notification: Notification) => {
    const { notifications } = get();
    if (notifications.some((n) => n.id === notification.id)) return;
    set({
      notifications: [notification, ...notifications],
      unreadCount: get().unreadCount + 1,
      toasts: [...get().toasts, notification],
    });
  },

  markAsRead: async (id: number) => {
    const { notifications } = get();
    const prev = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    const prevUnread = get().unreadCount;
    set({
      notifications: prev,
      unreadCount: Math.max(0, prevUnread - 1),
    });
    try {
      await markNotificationReadService(id);
    } catch {
      const rollback = notifications.map((n) =>
        n.id === id ? { ...n, isRead: false } : n
      );
      set({
        notifications: rollback,
        unreadCount: prevUnread,
      });
    }
  },

  syncNotifications: async () => {
    try {
      const data = await getNotificationsService(50);
      const unread = data.filter((n) => !n.isRead).length;
      set({ notifications: data, unreadCount: unread });
    } catch {
      console.error("[NotificationStore] Failed to sync notifications");
    }
  },

  connectWebSocket: () => {
    notificationWebSocketService.refreshToken();
    notificationWebSocketService.connect({
      onNotification: (notification: Notification) => {
        get().addNotification(notification);
      },
      onConnect: () => {
        get().setConnected(true, "connected");
        get().syncNotifications();
      },
      onDisconnect: () => {
        get().setConnected(false, "disconnected");
      },
      onReconnect: () => {
        get().setConnected(false, "reconnecting");
      },
    });
  },

  disconnectWebSocket: () => {
    notificationWebSocketService.disconnect();
    set({ connected: false, connectionStatus: "disconnected" });
  },

  setConnected: (connected, status) => {
    set({ connected, connectionStatus: status ?? (connected ? "connected" : "disconnected") });
  },

  removeToast: (id: number) => {
    set({ toasts: get().toasts.filter((n) => n.id !== id) });
  },

  refreshToken: () => {
    notificationWebSocketService.refreshToken();
  },
}));
