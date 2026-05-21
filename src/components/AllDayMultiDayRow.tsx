import { useMemo } from "react";
import { parseISO, startOfDay, isSameDay as dfIsSameDay, differenceInDays } from "date-fns";
import type { Schedule } from "@/types/schedule.type";
import { getDurationLabel } from "@/utils/schedule-utils";
import { Link2, Sun, CalendarDays } from "lucide-react";

interface AllDayMultiDayRowProps {
  weekDays: Date[];
  allDaySchedules: Schedule[];
  multiDaySchedules: Schedule[];
  onScheduleSelect: (id: number) => void;
}

export function AllDayMultiDayRow({
  weekDays,
  allDaySchedules,
  multiDaySchedules,
  onScheduleSelect,
}: AllDayMultiDayRowProps) {
  return (
    <div className="flex-shrink-0 bg-white/70 backdrop-blur-2xl border-b border-white/30 shadow-sm z-20">
      {/* Multi-day bars layer */}
      {multiDaySchedules.length > 0 && (
        <div className="relative min-h-[32px]">
          <div className="flex">
            <div className="w-14 flex-shrink-0" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="flex-1 min-w-[100px] border-r border-white/10"
              />
            ))}
          </div>
          <div className="absolute inset-0 top-0 left-14 right-0">
            {multiDaySchedules.map((event) => (
              <MultiDayBar
                key={event.id}
                event={event}
                weekDays={weekDays}
                onSelect={onScheduleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* All-day pills layer */}
      <div className="flex pb-1.5 pt-1">
        <div className="w-14 flex-shrink-0 flex items-start justify-center pt-1.5 px-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none">
            All day
          </span>
        </div>
        {weekDays.map((day) => {
          const dayEvents = allDaySchedules.filter((s) =>
            dfIsSameDay(parseISO(s.startTime), day),
          );
          return (
            <div
              key={day.toISOString()}
              className="flex-1 min-w-[100px] border-r border-white/10 px-1 space-y-0.5"
            >
              {dayEvents.map((event) => (
                <AllDayPill
                  key={event.id}
                  event={event}
                  onSelect={onScheduleSelect}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getMultiDayStyle(
  event: Schedule,
  weekDays: Date[],
): { left: string; width: string } | null {
  const eventStart = startOfDay(parseISO(event.startTime));
  const eventEnd = startOfDay(parseISO(event.endTime));

  const startIdx = weekDays.findIndex(
    (d) => startOfDay(d).getTime() === eventStart.getTime(),
  );
  const endIdx = weekDays.findIndex(
    (d) => startOfDay(d).getTime() === eventEnd.getTime(),
  );

  if (startIdx === -1 && endIdx === -1) return null;

  const actualStart = startIdx >= 0 ? startIdx : 0;
  const actualEnd = endIdx >= 0 ? endIdx : weekDays.length - 1;

  const numDays = weekDays.length;
  const left = (actualStart / numDays) * 100;
  const width = ((actualEnd - actualStart + 1) / numDays) * 100;

  return { left: `${left}%`, width: `${width}%` };
}

function MultiDayBar({
  event,
  weekDays,
  onSelect,
}: {
  event: Schedule;
  weekDays: Date[];
  onSelect: (id: number) => void;
}) {
  const style = useMemo(() => getMultiDayStyle(event, weekDays), [event, weekDays]);
  if (!style) return null;

  const displayTitle = event.taskTitle ?? event.title ?? "Untitled";

  const dayCount = useMemo(
    () => Math.max(1, differenceInDays(parseISO(event.endTime), parseISO(event.startTime)) + 1),
    [event],
  );

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(event.id);
      }}
      className="absolute h-7 rounded-full cursor-pointer overflow-hidden
        bg-gradient-to-r from-blue-500/80 to-indigo-500/80
        border border-blue-400/30 shadow-sm
        hover:brightness-110 hover:shadow-md
        transition-all duration-150 group"
      style={{ left: style.left, width: style.width, top: 2 }}
    >
      <div className="flex items-center gap-1.5 h-full px-3 text-white text-[11px] font-medium truncate">
        <CalendarDays className="w-3 h-3 text-white/70 flex-shrink-0" />
        <span className="truncate">{displayTitle}</span>
        <span className="inline-flex items-center gap-0.5 text-[10px] text-white/60 font-mono flex-shrink-0 bg-white/10 border border-white/20 rounded-full px-1.5 py-0.5">
          {dayCount}d
        </span>
        {event.taskId && (
          <Link2 className="w-2.5 h-2.5 opacity-50 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

function AllDayPill({
  event,
  onSelect,
}: {
  event: Schedule;
  onSelect: (id: number) => void;
}) {
  const displayTitle = event.taskTitle ?? event.title ?? "All day";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(event.id);
      }}
      className="flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer
        bg-gradient-to-r from-blue-400/70 to-indigo-400/70
        border border-white/30 backdrop-blur-sm
        text-white text-[10px] font-medium truncate
        hover:brightness-110 hover:shadow-sm
        transition-all duration-150 group"
    >
      <Sun className="w-2.5 h-2.5 text-white/70 flex-shrink-0" />
      <span className="truncate">{displayTitle}</span>
      <span className="text-[9px] text-white/60 font-mono flex-shrink-0 bg-white/10 border border-white/20 rounded-full px-1">
        All Day
      </span>
      {event.taskId && (
        <Link2 className="w-2 h-2 opacity-50 flex-shrink-0" />
      )}
    </div>
  );
}
