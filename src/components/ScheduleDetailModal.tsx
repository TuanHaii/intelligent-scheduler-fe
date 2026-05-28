import { useState, useEffect } from "react";
import { useScheduleDetail, useUpdateSchedule, useDeleteSchedule } from "@/hooks/useSchedules";
import { ApiError } from "@/api/axios";
import { parseISO, differenceInMinutes } from "date-fns";
import { Clock, Link2, Loader2, CalendarRange, AlertCircle, X, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { classifySchedule } from "@/utils/schedule-utils";
import type { ScheduleRenderType } from "@/utils/schedule-utils";
import { ScheduleTypeBadge } from "@/components/ScheduleTypeBadge";

interface ScheduleDetailModalProps {
  scheduleId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleDetailModal({ scheduleId, open, onOpenChange }: ScheduleDetailModalProps) {
  const { data: schedule, isLoading, isError, refetch } = useScheduleDetail(scheduleId);
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (schedule) {
      const displayTitle = schedule.taskTitle ?? schedule.title ?? "";
      setTitle(displayTitle);
      const startLocal = new Date(schedule.startTime);
      const endLocal = new Date(schedule.endTime);
      const pad = (n: number) => String(n).padStart(2, "0");
      setStartTime(
        `${startLocal.getFullYear()}-${pad(startLocal.getMonth() + 1)}-${pad(startLocal.getDate())}T${pad(startLocal.getHours())}:${pad(startLocal.getMinutes())}`
      );
      setEndTime(
        `${endLocal.getFullYear()}-${pad(endLocal.getMonth() + 1)}-${pad(endLocal.getDate())}T${pad(endLocal.getHours())}:${pad(endLocal.getMinutes())}`
      );
    }
  }, [schedule]);

  const handleSave = () => {
    if (!schedule) return;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (endDate <= startDate) {
      toast({
        className: "bg-red-500/10 border border-red-400/20 backdrop-blur-xl",
        title: "Invalid time",
        description: "End time must be after start time.",
      });
      return;
    }

    const offset = -startDate.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
    const tz = `${sign}${pad(Math.floor(offset / 60))}:${pad(offset % 60)}`;

    const toISOWithTZ = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${tz}`;

    updateSchedule.mutate(
      {
        id: schedule.id,
        payload: {
          title: title || schedule.title,
          startTime: toISOWithTZ(startDate),
          endTime: toISOWithTZ(endDate),
          taskId: schedule.taskId,
          status: "PLANNED",
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Updated",
            description: `"${title || schedule.title}" has been updated.`,
          });
          onOpenChange(false);
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 400) {
            toast({
              className: "bg-red-500/10 border border-red-400/20 backdrop-blur-xl shadow-lg shadow-red-500/10",
              title: "Conflict!",
              description: err.message || "Time slot conflicts with another event.",
            });
          } else {
            toast({
              className: "bg-red-500/10 border border-red-400/20 backdrop-blur-xl",
              title: "Error",
              description: err instanceof Error ? err.message : "Failed to update schedule",
            });
          }
        },
      },
    );
  };

  const handleDelete = () => {
    if (!schedule) return;
    deleteSchedule.mutate(schedule.id, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Schedule has been removed." });
        onOpenChange(false);
      },
      onError: (err) => {
        toast({
          className: "bg-red-500/10 border border-red-400/20 backdrop-blur-xl",
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete schedule",
        });
      },
    });
  };

  const duration = schedule
    ? differenceInMinutes(parseISO(schedule.endTime), parseISO(schedule.startTime))
    : 0;

  const scheduleType: ScheduleRenderType | null = schedule ? classifySchedule(schedule) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="sm:max-w-2xl w-[720px] max-sm:w-full
          bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-3xl
          border border-white/60 shadow-2xl shadow-blue-500/10
          rounded-[1.5rem] sm:rounded-[1.5rem]
          p-0 gap-0 overflow-hidden text-slate-700"
      >
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8">
          {/* Custom glass close button */}
          <DialogClose asChild>
            <button
              type="button"
              className="absolute right-6 top-6 sm:right-8 sm:top-8 z-50 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center transition-all duration-150 opacity-80 hover:opacity-100"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </DialogClose>

          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
              Schedule Details
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400/70" />
                <span className="text-sm text-slate-500">Loading...</span>
              </div>
            </div>
          ) : isError || !schedule ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-400/20 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm text-slate-600">Failed to load schedule details.</p>
              <Button
                size="sm"
                onClick={() => refetch()}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl text-slate-600"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Title section */}
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wider font-semibold text-slate-600">
                    Title
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="glass-input text-base h-11"
                    placeholder="Event title"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="uppercase text-xs tracking-wider font-semibold text-slate-600">
                    Time
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium ml-1 text-slate-400">Start</span>
                      <Input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="glass-input h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium ml-1 text-slate-400">End</span>
                      <Input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="glass-input h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info cards row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
                      <CalendarRange className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="uppercase text-[10px] tracking-wider font-semibold text-slate-600">Duration</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 pl-0.5">
                    {duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration}m`}
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-500/20 border border-slate-400/20 flex items-center justify-center">
                      <CalendarRange className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="uppercase text-[10px] tracking-wider font-semibold text-slate-600">Schedule Type</span>
                  </div>
                  <div className="pl-0.5">
                    {scheduleType && <ScheduleTypeBadge type={scheduleType} />}
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/20 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="uppercase text-[10px] tracking-wider font-semibold text-slate-600">Status</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 pl-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    Planned
                  </span>
                </div>

                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center">
                      <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <span className="uppercase text-[10px] tracking-wider font-semibold text-slate-600">Linked Task</span>
                  </div>
                  {schedule.taskId ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 bg-blue-500/20 border border-blue-400/20 rounded-full px-3 py-0.5 pl-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="truncate max-w-[100px]">{schedule.taskTitle ?? `Task #${schedule.taskId}`}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400 pl-0.5">None</span>
                  )}
                </div>
              </div>

              {/* Bonus UX text for ALL_DAY / MULTI_DAY */}
              {scheduleType === "ALL_DAY" && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] text-slate-500 italic">This event spans the entire day</span>
                </div>
              )}
              {scheduleType === "MULTI_DAY" && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] text-slate-500 italic">This event spans multiple days</span>
                </div>
              )}

              {/* Actions */}
              <DialogFooter className="gap-3 pt-2 sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleteSchedule.isPending}
                  className="rounded-xl h-11 px-5 bg-red-500/5 hover:bg-red-500/10 backdrop-blur-md border border-red-400/20 text-red-500 hover:text-red-600 transition-all duration-150"
                >
                  {deleteSchedule.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl h-11 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-slate-600 hover:text-slate-900 transition-all duration-150"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateSchedule.isPending}
                    className="glass-button rounded-xl h-11 px-8 text-sm font-semibold"
                  >
                    {updateSchedule.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
