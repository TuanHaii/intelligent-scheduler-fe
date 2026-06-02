import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsService,
  markNotificationReadService,
  getUnreadCountService,
} from "@/services/notification.service";
import type { Notification } from "@/types/notification.type";

export const NOTIFICATIONS_KEY = ["notifications"];

export function useNotifications(limit = 50) {
  return useQuery<Notification[]>({
    queryKey: [...NOTIFICATIONS_KEY, limit],
    queryFn: () => getNotificationsService(limit),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, "unread-count"],
    queryFn: getUnreadCountService,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationReadService(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previousData = queryClient.getQueriesData<Notification[]>({ queryKey: NOTIFICATIONS_KEY });

      queryClient.setQueriesData<Notification[]>({ queryKey: NOTIFICATIONS_KEY }, (old) => {
        if (!old) return old;
        return old.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      });

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
