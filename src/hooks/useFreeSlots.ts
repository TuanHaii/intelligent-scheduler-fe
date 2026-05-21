import { useQuery } from "@tanstack/react-query";
import { getFreeSlotsService } from "@/services/schedule.service";
import type { FreeSlot } from "@/types/free-slot.type";

export function useFreeSlots(date: string, durationMinutes: number) {
  return useQuery<FreeSlot[]>({
    queryKey: ["free-slots", date, durationMinutes],
    queryFn: () => getFreeSlotsService(date, durationMinutes),
    enabled: !!date && durationMinutes > 0,
  });
}
