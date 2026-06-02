import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { wsScheduleService } from "@/lib/websocket.service";
import { useWebSocketStore, type ScheduleUpdatePayload } from "@/stores/websocket.store";
import { useNotificationStore } from "@/stores/notification.store";
import type { Schedule } from "@/types/schedule.type";
import type { Notification } from "@/types/notification.type";

const SCHEDULES_KEY = ["schedules"];

function handleScheduleUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  payload: ScheduleUpdatePayload,
) {
  const { type, schedule } = payload;

  queryClient.setQueriesData<Schedule[]>({ queryKey: SCHEDULES_KEY }, (old) => {
    if (!old) return old;

    if (type === "CREATE") {
      if (old.some((s) => s.id === schedule.id)) return old;
      return [...old, schedule];
    }

    if (type === "UPDATE") {
      return old.map((s) => (s.id === schedule.id ? { ...s, ...schedule } : s));
    }

    if (type === "DELETE") {
      return old.filter((s) => s.id !== schedule.id);
    }

    return old;
  });
}

export function useWebSocket() {
  const queryClient = useQueryClient();
  const connect = useWebSocketStore((s) => s.connect);
  const disconnect = useWebSocketStore((s) => s.disconnect);
  const init = useWebSocketStore((s) => s._init);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    init();

    wsScheduleService.subscribe("/user/queue/schedules/update", (body) => {
      console.log("[WS-Schedule] Update received");
      handleScheduleUpdate(queryClient, body as ScheduleUpdatePayload);
    });

    wsScheduleService.subscribe("/user/queue/notifications", (body) => {
      const notification = body as Notification;
      console.log("[WS-Notif] Received:", notification.id, notification.type);
      useNotificationStore.getState().addNotification(notification);
    });

    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, queryClient, init]);
}
