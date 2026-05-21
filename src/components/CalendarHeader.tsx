import { format } from "date-fns";
import { isSameDay } from "@/lib/date-utils";
import { HEADER_HEIGHT } from "@/types/calendar";

export function CalendarHeader({ weekDays }: { weekDays: Date[] }) {
  return (
    <div
      className="flex sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 shadow-sm"
      style={{ height: HEADER_HEIGHT }}
    >
      <div className="w-14 flex-shrink-0 border-r border-slate-200/70" />
      {weekDays.map((day) => {
        const today = isSameDay(day, new Date());
        return (
          <div
            key={day.toISOString()}
            className="flex-1 min-w-[100px] border-r border-slate-200/70"
          >
            <div
              className={`flex flex-col items-center justify-center h-full transition-colors duration-150 ${
                today ? "bg-blue-50/60" : ""
              }`}
            >
              <span
                className={`text-xs font-semibold tracking-wide uppercase ${
                  today ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {format(day, "EEE")}
              </span>
              <div className="relative mt-0.5">
                <span
                  className={`text-sm font-bold ${
                    today
                      ? "text-white bg-blue-600 w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
                      : "text-gray-800"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>
            </div>
            <div className="h-px bg-white/10" />
          </div>
        );
      })}
    </div>
  );
}
