import { parseISO, format } from "date-fns";

interface FreeSlotChipProps {
  startTime: string;
  endTime: string;
  onClick: (start: string, end: string) => void;
}

export function FreeSlotChip({ startTime, endTime, onClick }: FreeSlotChipProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(startTime, endTime)}
      className="group relative flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-emerald-300/60 bg-white/20 hover:bg-emerald-50/50 hover:border-emerald-400/80 hover:shadow-sm transition-all duration-200 text-left w-full"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 group-hover:scale-125 transition-transform" />
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <span>{format(parseISO(startTime), "h:mm a")}</span>
        <span className="text-gray-400">–</span>
        <span>{format(parseISO(endTime), "h:mm a")}</span>
      </div>
    </button>
  );
}
