import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSchedulesService,
  getScheduleDetailService,
  createScheduleService,
  updateScheduleService,
  deleteScheduleService,
} from "@/services/schedule.service";
import type { Schedule, CreateSchedulePayload, UpdateSchedulePayload } from "@/types/schedule.type";

const SCHEDULES_KEY = ["schedules"];

export function useSchedules(start: string, end: string) {
  return useQuery<Schedule[]>({
    queryKey: [...SCHEDULES_KEY, start, end],
    queryFn: () => getSchedulesService(start, end),
  });
}

export function useScheduleDetail(id: number | null) {
  return useQuery<Schedule>({
    queryKey: ["schedule", id],
    queryFn: () => getScheduleDetailService(id!),
    enabled: id !== null,
    staleTime: 0,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchedulePayload) => createScheduleService(payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: SCHEDULES_KEY });

      const previousQueries = queryClient.getQueriesData<Schedule[]>({ queryKey: SCHEDULES_KEY });

      const tempId = -Date.now();
      const optimistic: Schedule = {
        id: tempId,
        taskId: payload.taskId,
        title: payload.title,
        startTime: payload.startTime,
        endTime: payload.endTime,
        status: "PLANNED",
      };

      queryClient.setQueriesData<Schedule[]>({ queryKey: SCHEDULES_KEY }, (old) => {
        if (!old) return [optimistic];
        return [...old, optimistic];
      });

      return { previousQueries };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_KEY });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSchedulePayload }) =>
      updateScheduleService(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: SCHEDULES_KEY });

      const previousQueries = queryClient.getQueriesData<Schedule[]>({ queryKey: SCHEDULES_KEY });

      queryClient.setQueriesData<Schedule[]>({ queryKey: SCHEDULES_KEY }, (old) => {
        if (!old) return old;
        return old.map((s) =>
          s.id === id
            ? { ...s, ...payload }
            : s
        );
      });

      return { previousQueries };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_KEY });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteScheduleService(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SCHEDULES_KEY });

      const previousQueries = queryClient.getQueriesData<Schedule[]>({ queryKey: SCHEDULES_KEY });

      queryClient.setQueriesData<Schedule[]>({ queryKey: SCHEDULES_KEY }, (old) => {
        if (!old) return old;
        return old.filter((s) => s.id !== id);
      });

      return { previousQueries };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_KEY });
    },
  });
}
