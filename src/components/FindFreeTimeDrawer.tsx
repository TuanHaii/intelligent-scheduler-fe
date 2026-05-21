import { useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useFreeSlots } from "@/hooks/useFreeSlots";
import { FreeSlotChip } from "@/components/FreeSlotChip";
import { Clock, Loader2, Search, Sparkles } from "lucide-react";

interface FindFreeTimeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSlot: (start: string, end: string) => void;
  defaultDate?: string;
}

const DURATION_PRESETS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hr", value: 60 },
  { label: "2 hr", value: 120 },
  { label: "4 hr", value: 240 },
];

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function FindFreeTimeDrawer({ open, onOpenChange, onSelectSlot, defaultDate }: FindFreeTimeDrawerProps) {
  const today = toLocalDateString(new Date());
  const [date, setDate] = useState(defaultDate || today);
  const [duration, setDuration] = useState(60);

  const { data: slots, isLoading, isError, error } = useFreeSlots(date, duration);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  }, []);

  const handleSelect = useCallback(
    (start: string, end: string) => {
      onSelectSlot(start, end);
      onOpenChange(false);
    },
    [onSelectSlot, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-200/50">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <DialogTitle>Find Free Time</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Discover available slots in your calendar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white/30 rounded-2xl p-3 border border-white/40">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="w-full h-10 px-3 rounded-xl glass-input text-sm focus:outline-none cursor-pointer"
              />
            </div>
            <div className="h-10 w-px bg-white/30 shrink-0" />
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Duration</label>
              <div className="flex gap-1.5 flex-wrap">
                {DURATION_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setDuration(p.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      duration === p.value
                        ? "bg-emerald-500/15 text-emerald-700 border border-emerald-300/40 shadow-sm"
                        : "bg-white/50 text-slate-600 border border-white/40 hover:bg-white/70"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Available Slots
              </span>
              <span className="text-[11px] text-slate-400">
                {date && format(parseISO(date), "MMM d, yyyy")}
              </span>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                <span className="text-xs text-slate-400">Finding free slots...</span>
              </div>
            )}

            {isError && !isLoading && (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200/50 flex items-center justify-center">
                  <Search className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-xs text-red-400 max-w-[200px]">
                  {error instanceof Error ? error.message : "Could not find free slots"}
                </span>
              </div>
            )}

            {!isLoading && !isError && slots && slots.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs text-slate-400 max-w-[220px]">
                  No {duration}-minute free slots on this day.
                </span>
              </div>
            )}

            {!isLoading && !isError && slots && slots.length > 0 && (
              <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                {slots.map((slot, idx) => (
                  <FreeSlotChip key={idx} startTime={slot.startTime} endTime={slot.endTime} onClick={handleSelect} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
