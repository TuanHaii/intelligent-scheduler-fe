import { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from "react";
import { format, isSameDay as dfIsSameDay, startOfDay, parseISO } from "date-fns";
import type { Schedule } from "@/types/schedule.type";
import { SLOT_HEIGHT, HOUR_HEIGHT, NUM_SLOTS, HEADER_HEIGHT, SLOT_INTERVAL } from "@/types/calendar";
import { generateTimeSlots, hours, getCurrentTimeMinutes, createIsoDateFromMinutes } from "@/lib/date-utils";
import { CalendarScheduleBlock } from "@/components/CalendarScheduleBlock";
import { CalendarHeader } from "@/components/CalendarHeader";
import { AllDayMultiDayRow } from "@/components/AllDayMultiDayRow";
import { EDGE_THRESHOLD, MAX_SCROLL_SPEED } from "@/types/dnd";
import { classifySchedule } from "@/utils/schedule-utils";
import type { ScheduleRenderType } from "@/utils/schedule-utils";

interface CalendarGridProps {
  weekDays: Date[];
  schedules: Schedule[];
  draggedTask: { id: number; title: string; estimatedDuration: number | null } | null;
  onRangeSelected: (startIso: string, endIso: string) => void;
  onTaskDrop: (
    day: Date,
    minutes: number,
    task: { id: number; title: string; estimatedDuration: number | null },
    position: { x: number; y: number },
  ) => void;
  onScheduleSelect: (id: number) => void;
}

export function CalendarGrid({
  weekDays,
  schedules,
  draggedTask,
  onRangeSelected,
  onTaskDrop,
  onScheduleSelect,
}: CalendarGridProps) {
  const slots = useMemo(() => generateTimeSlots(), []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mouseYRef = useRef(0);

  const [selectionStart, setSelectionStart] = useState<{ dayIdx: number; minutes: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ dayIdx: number; minutes: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropTarget, setDropTarget] = useState<{ dayIdx: number; minutes: number } | null>(null);

  const isDraggingRef = useRef(false);
  const selectionStartRef = useRef<{ dayIdx: number; minutes: number } | null>(null);
  const selectionEndRef = useRef<{ dayIdx: number; minutes: number } | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayMinutes = useMemo(() => getCurrentTimeMinutes(), []);

  // Classify schedules
  const { allDaySchedules, multiDaySchedules, gridSchedules, scheduleTypes, occupiedDayIndices } = useMemo(() => {
    const allDay: Schedule[] = [];
    const multiDay: Schedule[] = [];
    const grid: Schedule[] = [];
    const types = new Map<number, ScheduleRenderType>();
    for (const s of schedules) {
      const type = classifySchedule(s);
      types.set(s.id, type);
      if (type === "ALL_DAY") {
        allDay.push(s);
      } else if (type === "MULTI_DAY") {
        multiDay.push(s);
      } else {
        grid.push(s);
      }
    }
    const occupied = new Set<number>();
    for (const s of allDay) {
      const dayStart = startOfDay(parseISO(s.startTime)).getTime();
      weekDays.forEach((d, i) => {
        if (startOfDay(d).getTime() === dayStart) occupied.add(i);
      });
    }
    for (const s of multiDay) {
      const eventStart = startOfDay(parseISO(s.startTime)).getTime();
      const eventEnd = startOfDay(parseISO(s.endTime)).getTime();
      weekDays.forEach((d, i) => {
        const day = startOfDay(d).getTime();
        if (day >= eventStart && day <= eventEnd) occupied.add(i);
      });
    }
    return { allDaySchedules: allDay, multiDaySchedules: multiDay, gridSchedules: grid, scheduleTypes: types, occupiedDayIndices: occupied };
  }, [schedules, weekDays]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const scrollTarget = currentMinutes - 120;
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    if (scrollTarget > 0 && scrollTarget <= maxScroll) {
      el.scrollTop = scrollTarget;
    }
  }, []);

  useEffect(() => {
    if (!draggedTask) {
      setDropTarget(null);
    }
  }, [draggedTask]);

  useEffect(() => {
    if (!draggedTask) return;
    const handleDrag = (e: DragEvent) => {
      mouseYRef.current = e.clientY;
    };
    document.addEventListener("drag", handleDrag);
    return () => document.removeEventListener("drag", handleDrag);
  }, [draggedTask]);

  useEffect(() => {
    if (!draggedTask) return;
    let rafId: number;
    const scroll = () => {
      const container = scrollRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const mouseY = mouseYRef.current;

        if (mouseY < rect.top + EDGE_THRESHOLD) {
          const distance = rect.top + EDGE_THRESHOLD - mouseY;
          const speed = -Math.min((distance / EDGE_THRESHOLD) * MAX_SCROLL_SPEED, MAX_SCROLL_SPEED);
          container.scrollTop += speed;
        } else if (mouseY > rect.bottom - EDGE_THRESHOLD) {
          const distance = mouseY - (rect.bottom - EDGE_THRESHOLD);
          const speed = Math.min((distance / EDGE_THRESHOLD) * MAX_SCROLL_SPEED, MAX_SCROLL_SPEED);
          container.scrollTop += speed;
        }
      }
      rafId = requestAnimationFrame(scroll);
    };
    rafId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(rafId);
  }, [draggedTask]);

  const getDayForColumn = useCallback((dayIdx: number) => weekDays[dayIdx], [weekDays]);

  const getSchedulesForDay = useCallback(
    (day: Date) =>
      gridSchedules?.filter((s) => dfIsSameDay(new Date(s.startTime), day)) || [],
    [gridSchedules],
  );

  const handleMouseDown = useCallback(
    (dayIdx: number, minutes: number) => {
      if (draggedTask) return;
      isDraggingRef.current = true;
      const slot = { dayIdx, minutes };
      selectionStartRef.current = slot;
      selectionEndRef.current = slot;
      setSelectionStart(slot);
      setSelectionEnd(slot);
      setIsDragging(true);
      document.body.classList.add("dragging");
    },
    [draggedTask],
  );

  const handleMouseEnter = useCallback(
    (dayIdx: number, minutes: number) => {
      if (!isDraggingRef.current || draggedTask) return;
      const currentStart = selectionStartRef.current;
      if (!currentStart) return;
      if (dayIdx !== currentStart.dayIdx) return;
      const slot = { dayIdx, minutes };
      selectionEndRef.current = slot;
      setSelectionEnd(slot);
    },
    [draggedTask],
  );

  const finalizeSelection = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.body.classList.remove("dragging");

    const start = selectionStartRef.current;
    const end = selectionEndRef.current;
    selectionStartRef.current = null;
    selectionEndRef.current = null;

    if (!start || !end) {
      setIsDragging(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    const startTotal = start.dayIdx * 24 * 60 + start.minutes;
    const endTotal = end.dayIdx * 24 * 60 + end.minutes;

    const actualStart = startTotal <= endTotal ? start : end;
    const actualEnd = startTotal <= endTotal ? end : start;

    const startDay = getDayForColumn(actualStart.dayIdx);
    const endDay = getDayForColumn(actualEnd.dayIdx);

    const startIso = createIsoDateFromMinutes(startDay, actualStart.minutes);
    const endIso = createIsoDateFromMinutes(endDay, actualEnd.minutes + SLOT_INTERVAL);

    setIsDragging(false);
    setSelectionStart(null);
    setSelectionEnd(null);

    onRangeSelected(startIso, endIso);
  }, [getDayForColumn, onRangeSelected]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        finalizeSelection();
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [finalizeSelection]);

  const handleDragOver = useCallback(
    (e: React.DragEvent, dayIdx: number, minutes: number) => {
      if (!draggedTask) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      mouseYRef.current = e.clientY;
      setDropTarget({ dayIdx, minutes });
    },
    [draggedTask],
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dayIdx: number, minutes: number) => {
      e.preventDefault();
      setDropTarget(null);
      if (draggedTask) {
        const day = getDayForColumn(dayIdx);
        onTaskDrop(day, minutes, draggedTask, { x: e.clientX, y: e.clientY });
      }
    },
    [draggedTask, getDayForColumn, onTaskDrop],
  );

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    mouseYRef.current = e.clientY;
  }, []);

  const ghostPreview = useMemo(() => {
    if (!draggedTask || !dropTarget) return null;
    return {
      dayIdx: dropTarget.dayIdx,
      minutes: dropTarget.minutes,
      height: draggedTask.estimatedDuration ?? 60,
      title: draggedTask.title,
    };
  }, [draggedTask, dropTarget]);

  const labelOffset = 2;

  return (
    <div className="flex flex-col h-full">
      {/* Week Header - fixed */}
      <div className="flex-shrink-0">
        <CalendarHeader weekDays={weekDays} />
      </div>

      {/* All-Day / Multi-Day Row - fixed */}
      <AllDayMultiDayRow
        weekDays={weekDays}
        allDaySchedules={allDaySchedules}
        multiDaySchedules={multiDaySchedules}
        onScheduleSelect={onScheduleSelect}
      />

      {/* Hourly Grid - scrollable */}
      <div
        ref={scrollRef}
        onDragOver={handleContainerDragOver}
        className="flex-1 overflow-y-auto calendar-scrollbar"
        style={{ touchAction: isDragging ? 'none' : 'auto' }}
      >
        <div className="flex w-full min-w-[800px]" style={{ height: NUM_SLOTS * SLOT_HEIGHT }}>
          {/* Time gutter - sticky left */}
          <div className="w-14 flex-shrink-0 sticky left-0 z-10 bg-white/50 backdrop-blur-sm border-r border-white/20">
            {hours.map((h) => (
              <div key={h} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span
                  className="absolute right-2 text-[10px] font-medium text-gray-400 select-none pointer-events-none"
                  style={{ top: `-${labelOffset}px` }}
                >
                  {format(new Date().setHours(h, 0, 0, 0), "h a")}
                </span>
                <div className="border-b border-white/20 h-full" />
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const daySchedules = getSchedulesForDay(day);
            const isToday = dfIsSameDay(day, today);

            const colStartMinutes =
              selectionStart && selectionEnd && isDragging
                ? selectionStart.dayIdx === dayIdx
                  ? selectionStart.minutes
                  : selectionEnd.dayIdx === dayIdx
                  ? selectionEnd.minutes
                  : null
                : null;

            const colEndMinutes =
              selectionStart && selectionEnd && isDragging
                ? selectionStart.dayIdx === dayIdx
                  ? selectionEnd.minutes
                  : selectionEnd.dayIdx === dayIdx
                  ? selectionStart.minutes
                  : null
                : null;

            const showOverlay = colStartMinutes !== null && colEndMinutes !== null;

            return (
              <div
                key={day.toISOString()}
                className="flex-1 min-w-[100px] border-r border-white/20 relative"
              >
                {/* Occupied day overlay for ALL_DAY / MULTI_DAY */}
                {occupiedDayIndices.has(dayIdx) && (
                  <div className="absolute inset-0 bg-zinc-500/6 pointer-events-none z-[1]" />
                )}

                {/* Time slots with 15-min precision */}
                {slots.map((slot) => {
                  const isDropTarget =
                    dropTarget?.dayIdx === dayIdx &&
                    dropTarget?.minutes === slot.minutes &&
                    !!draggedTask;

                  const isDropZone = dropTarget?.dayIdx === dayIdx && !!draggedTask;

                  const isSelected =
                    isDragging &&
                    showOverlay &&
                    slot.minutes >= Math.min(colStartMinutes, colEndMinutes) &&
                    slot.minutes < Math.max(colStartMinutes, colEndMinutes);

                  let borderStyle = "border-b border-white/5";
                  if (slot.isHourSlot) {
                    borderStyle = "border-b border-white/20";
                  } else if (slot.isHalfHourSlot) {
                    borderStyle = "border-b border-white/10";
                  }

                  return (
                    <div
                      key={slot.minutes}
                      data-slot={`${dayIdx}-${slot.minutes}`}
                      className={`relative transition-colors duration-75 cursor-pointer select-none
                        ${borderStyle}
                        ${isDropTarget
                          ? "bg-blue-300/30 border-2 border-blue-400/60 border-dashed z-10 shadow-inner shadow-blue-500/10"
                          : draggedTask && isDropZone
                          ? "hover:bg-blue-50/60 hover:shadow-inner"
                          : draggedTask
                          ? "hover:bg-blue-50/40"
                          : "hover:bg-primary/6"
                        }
                        ${isSelected ? "bg-primary/15" : ""}
                      `}
                      style={{ height: SLOT_HEIGHT }}
                      onMouseDown={() => handleMouseDown(dayIdx, slot.minutes)}
                      onMouseEnter={() => handleMouseEnter(dayIdx, slot.minutes)}
                      onDragOver={(e) => handleDragOver(e, dayIdx, slot.minutes)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dayIdx, slot.minutes)}
                    >
                      {isDropTarget && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[10px] font-semibold text-blue-600 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-blue-200/50">
                            Drop here
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Ghost preview during drag */}
                {ghostPreview && ghostPreview.dayIdx === dayIdx && (
                  <div
                    className="absolute left-0.5 right-0.5 rounded-xl bg-blue-400/20 border border-blue-400/50 border-dashed pointer-events-none z-10 overflow-hidden backdrop-blur-sm shadow-lg shadow-blue-500/10"
                    style={{
                      top: `${ghostPreview.minutes}px`,
                      height: `${Math.max(ghostPreview.height, 20)}px`,
                    }}
                  >
                    <div className="px-2 py-1 text-[10px] font-semibold text-blue-700 truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      {ghostPreview.title}
                    </div>
                    <div className="px-2 text-[9px] text-blue-500 font-mono font-medium">
                      {ghostPreview.height}m
                    </div>
                  </div>
                )}

                {/* Selection overlay */}
                {showOverlay && (
                  <div
                    className="absolute left-0.5 right-0.5 rounded-md bg-primary/20 border border-primary/40 pointer-events-none z-10 transition-all duration-75"
                    style={{
                      top: `${Math.min(colStartMinutes, colEndMinutes)}px`,
                      height: `${Math.abs(colEndMinutes - colStartMinutes) + SLOT_HEIGHT}px`,
                    }}
                  >
                    <div className="absolute left-0 top-0 w-1 h-full rounded-l-md bg-primary/60" />
                  </div>
                )}

                {/* Schedule blocks (TIME_BLOCK and LONG_EVENT only) */}
                {daySchedules.map((s) => (
                  <CalendarScheduleBlock
                    key={s.id}
                    schedule={s}
                    onSelect={onScheduleSelect}
                    renderType={scheduleTypes.get(s.id)}
                  />
                ))}

                {/* Current time indicator */}
                {isToday && (
                  <div
                    className="absolute left-0 right-0 pointer-events-none z-15"
                    style={{ top: `${todayMinutes}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-lg shadow-red-500/50" />
                      <div className="flex-1 h-[2px] bg-red-500 shadow-sm shadow-red-500/30" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
