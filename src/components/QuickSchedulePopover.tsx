import { useState, useEffect, useRef } from "react";
import { setMinutes, setHours, startOfDay } from "date-fns";
import { useCreateSchedule } from "@/hooks/useSchedules";
import type { DragTask, DropPosition } from "@/types/dnd";
import { ApiError } from "@/api/axios";
import { snapToInterval } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, X } from "lucide-react";

interface QuickSchedulePopoverProps {
  task: DragTask;
  day: Date;
  minutes: number;
  position: DropPosition;
  onClose: () => void;
}

function formatMin(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function QuickSchedulePopover({
  task,
  day,
  minutes,
  position,
  onClose,
}: QuickSchedulePopoverProps) {
  const SNAP = 15;
  const defaultDuration = task.estimatedDuration ?? 60;
  const snappedDrop = snapToInterval(minutes, SNAP);

  const [startMinutes, setStartMinutes] = useState(snappedDrop);
  const [endMinutes, setEndMinutes] = useState(
    snapToInterval(snappedDrop + defaultDuration, SNAP)
  );

  const { toast } = useToast();
  const createSchedule = useCreateSchedule();

  const handleConfirm = () => {
    const startDate = setMinutes(
      setHours(startOfDay(day), Math.floor(startMinutes / 60)),
      startMinutes % 60
    );
    const endDate = setMinutes(
      setHours(startOfDay(day), Math.floor(endMinutes / 60)),
      endMinutes % 60
    );
    createSchedule.mutate(
      {
        title: task.title,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        taskId: task.id,
      },
      {
        onSuccess: () => {
          toast({ title: "Scheduled!", description: `"${task.title}" added to your calendar.` });
          onClose();
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 400) {
            toast({
              className: "bg-red-500/10 border border-red-400/20 backdrop-blur-xl shadow-lg shadow-red-500/10",
              title: "Time conflict!",
              description: err.message || "Khung giờ này đã có sự kiện khác. Vui lòng chọn thời gian khác!",
            });
          } else {
            toast({
              className: "bg-red-500/10 border border-red-400/20 backdrop-blur-xl",
              title: "Error",
              description: err instanceof Error ? err.message : "Failed to create schedule",
            });
          }
        },
      },
    );
  };

  const adjustStart = (delta: number) => {
    setStartMinutes((prev) => {
      const next = prev + delta;
      if (next < 0 || next >= endMinutes) return prev;
      return snapToInterval(next, SNAP);
    });
  };

  const adjustEnd = (delta: number) => {
    setEndMinutes((prev) => {
      const next = prev + delta;
      if (next <= startMinutes || next > 1440) return prev;
      return snapToInterval(next, SNAP);
    });
  };

  const popoverRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = position.x;
    let y = position.y;
    if (x + rect.width > vw - 16) x = vw - rect.width - 16;
    if (y + rect.height > vh - 16) y = vh - rect.height - 16;
    if (x < 16) x = 16;
    if (y < 16) y = 16;
    setAdjustedPos({ x, y });
  }, [position]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={popoverRef}
        className="fixed z-50 w-72 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl shadow-black/10 overflow-hidden"
        style={{ left: adjustedPos.x, top: adjustedPos.y }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800 truncate">{task.title}</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-white/60 flex items-center justify-center flex-shrink-0"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 w-12">Start</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustStart(-15)}
                className="w-7 h-7 rounded-lg bg-white/60 hover:bg-white/80 border border-white/40 flex items-center justify-center text-gray-500 text-sm font-medium"
              >
                −
              </button>
              <span className="w-20 text-center text-sm font-bold text-gray-800 font-mono">
                {formatMin(startMinutes)}
              </span>
              <button
                onClick={() => adjustStart(15)}
                className="w-7 h-7 rounded-lg bg-white/60 hover:bg-white/80 border border-white/40 flex items-center justify-center text-gray-500 text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 w-12">End</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustEnd(-15)}
                className="w-7 h-7 rounded-lg bg-white/60 hover:bg-white/80 border border-white/40 flex items-center justify-center text-gray-500 text-sm font-medium"
              >
                −
              </button>
              <span className="w-20 text-center text-sm font-bold text-gray-800 font-mono">
                {formatMin(endMinutes)}
              </span>
              <button
                onClick={() => adjustEnd(15)}
                className="w-7 h-7 rounded-lg bg-white/60 hover:bg-white/80 border border-white/40 flex items-center justify-center text-gray-500 text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-400 font-mono">
            Duration: {endMinutes - startMinutes}m
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-1 h-8 text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={createSchedule.isPending}
            className="flex-1 h-8 text-xs rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md"
          >
            {createSchedule.isPending ? "Scheduling..." : "Schedule"}
          </Button>
        </div>
      </div>
    </>
  );
}
