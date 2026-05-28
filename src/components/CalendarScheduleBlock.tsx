import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useUpdateSchedule } from "@/hooks/useSchedules";
import type { Schedule } from "@/types/schedule.type";
import { ApiError } from "@/api/axios";
import { formatTime, getSlotPosition, snapToInterval, PIXELS_PER_MINUTE } from "@/lib/date-utils";
import { parseISO, addMinutes, differenceInMinutes } from "date-fns";
import { Link2, GripVertical, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SNAP_INTERVAL, MIN_EVENT_HEIGHT } from "@/types/dnd";
import type { ScheduleRenderType } from "@/utils/schedule-utils";
import { getDurationLabel } from "@/utils/schedule-utils";

interface CalendarScheduleBlockProps {
  schedule: Schedule;
  onSelect: (id: number) => void;
  renderType?: ScheduleRenderType;
}

const MIN_BLOCK_HEIGHT = 72;

export const CalendarScheduleBlock = memo(function CalendarScheduleBlock({
  schedule,
  onSelect,
  renderType = "TIME_BLOCK",
}: CalendarScheduleBlockProps) {
  const { top, height } = getSlotPosition(schedule.startTime, schedule.endTime);
  const { toast } = useToast();
  const isLongEvent = renderType === "LONG_EVENT";

  const [resizingHeight, setResizingHeight] = useState<number | null>(null);
  const resizeRef = useRef<{
    startClientY: number;
    originalHeight: number;
  } | null>(null);
  const resizingHeightRef = useRef<number | null>(null);

  const updateSchedule = useUpdateSchedule();

  const displayTitle = schedule.taskTitle ?? schedule.title ?? "Untitled";
  const durationMins = differenceInMinutes(
    parseISO(schedule.endTime),
    parseISO(schedule.startTime),
  );

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = {
      startClientY: e.clientY,
      originalHeight: height,
    };
    resizingHeightRef.current = height;
    setResizingHeight(height);
  }, [height]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const state = resizeRef.current;
      if (!state) return;
      const deltaY = e.clientY - state.startClientY;
      const newHeight = Math.max(state.originalHeight + deltaY, MIN_EVENT_HEIGHT);
      const snappedMinutes = snapToInterval(newHeight / PIXELS_PER_MINUTE, SNAP_INTERVAL);
      const snappedHeight = snappedMinutes * PIXELS_PER_MINUTE;
      resizingHeightRef.current = snappedHeight;
      setResizingHeight(snappedHeight);
    };

    const handleMouseUp = () => {
      const state = resizeRef.current;
      const finalHeight = resizingHeightRef.current;
      if (state && finalHeight !== null && finalHeight !== state.originalHeight) {
        const snappedDuration = finalHeight / PIXELS_PER_MINUTE;
        const newEndTime = addMinutes(parseISO(schedule.startTime), snappedDuration);

        updateSchedule.mutate(
          {
            id: schedule.id,
            payload: {
              title: schedule.title,
              startTime: schedule.startTime,
              endTime: newEndTime.toISOString(),
              taskId: schedule.taskId,
              status: "PLANNED",
            },
          },
          {
            onError: (err) => {
              if (err instanceof ApiError && err.status === 400) {
                toast({
                  className: "bg-red-500/10 border border-red-400/20 backdrop-blur-xl shadow-lg shadow-red-500/10",
                  title: "Conflict!",
                  description: err.message || "Time conflicts with another event. Rolled back.",
                });
              } else {
                toast({
                  className: "bg-red-500/10 border border-red-400/20 backdrop-blur-xl",
                  title: "Error",
                  description: err instanceof Error ? err.message : "Failed to resize",
                });
              }
            },
          },
        );
      }
      resizeRef.current = null;
      resizingHeightRef.current = null;
      setResizingHeight(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [schedule.startTime, schedule.id, schedule.title, schedule.taskId, updateSchedule, toast]);

  const displayHeight = resizingHeight ?? height;
  const isResizing = resizingHeight !== null;
  const blockHeight = Math.max(displayHeight, MIN_BLOCK_HEIGHT);

  const handleClick = (e: React.MouseEvent) => {
    if (isResizing) return;
    e.stopPropagation();
    onSelect(schedule.id);
  };

  return (
    <div
      data-testid={`schedule-block-${schedule.id}`}
      onClick={handleClick}
      className={`absolute left-0.5 right-0.5 rounded-2xl shadow-lg backdrop-blur-md border cursor-pointer transition-all overflow-hidden z-10 group
        ${
          isLongEvent
            ? "bg-gradient-to-br from-blue-500/70 via-indigo-500/60 to-indigo-600/50 border-blue-400/25 text-white hover:brightness-110 hover:shadow-xl"
            : "bg-gradient-to-br from-blue-500/90 to-indigo-500/90 border-blue-400/40 text-white hover:brightness-110 hover:shadow-xl hover:-translate-y-px"
        }
        ${isResizing ? "shadow-2xl shadow-blue-500/30 ring-2 ring-blue-400/50 brightness-110" : ""}
        ${isLongEvent ? "shadow-blue-500/5" : ""}`}
      style={{
        top: `${top}px`,
        height: `${blockHeight}px`,
        minHeight: `${MIN_BLOCK_HEIGHT}px`,
      }}
    >
      <div className="h-full flex flex-col px-3 py-2 gap-1 overflow-hidden">
        {/* Time range + duration badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-medium opacity-80 truncate font-mono leading-tight">
            {formatTime(schedule.startTime)} –{" "}
            {isResizing
              ? formatTime(addMinutes(parseISO(schedule.startTime), displayHeight).toISOString())
              : formatTime(schedule.endTime)}
          </span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-mono flex-shrink-0
            ${isLongEvent ? "bg-white/15 text-white/80 text-[10px]" : "bg-white/10 text-white/70 text-[10px]"}
          `}>
            <Clock className="w-2.5 h-2.5" />
            {getDurationLabel(isResizing ? displayHeight : durationMins)}
          </span>
        </div>

        {/* Title */}
        <div className={`font-semibold leading-tight truncate text-white/95 min-w-0 flex-shrink-0
          ${isLongEvent ? "text-sm" : "text-sm"}`}
        >
          {displayTitle}
        </div>

        {/* Linked task badge */}
        <div className="flex items-center gap-1.5 mt-auto pt-1 flex-shrink-0">
          {schedule.taskId && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/70 bg-white/10 rounded-full px-2 py-0.5">
              <Link2 className="w-2.5 h-2.5" />
              Linked Task
            </span>
          )}
          {isResizing && displayHeight >= 60 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/70 bg-white/10 rounded-full px-2 py-0.5 font-mono">
              <GripVertical className="w-2.5 h-2.5" />
              {displayHeight}m
            </span>
          )}
        </div>
      </div>

      {/* Resize handle at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[6px] cursor-s-resize opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-150 z-20 flex items-center justify-center"
        onMouseDown={handleResizeStart}
      >
        <div className="w-10 h-1 rounded-full bg-white/60 backdrop-blur-sm border border-white/40" />
      </div>
    </div>
  );
});
