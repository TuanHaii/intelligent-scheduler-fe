import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSchedules, useCreateSchedule } from "@/hooks/useSchedules";
import { getTasksService } from "@/services/task.service";
import type { Schedule } from "@/types/schedule.type";
import { ApiError } from "@/api/axios";
import type { Task } from "@/types/task.type";
import type { QuickScheduleData } from "@/types/dnd";
import { getWeekDays } from "@/lib/date-utils";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDrag } from "@/context/DragContext";
import { CalendarGrid } from "@/components/CalendarGrid";
import { QuickSchedulePopover } from "@/components/QuickSchedulePopover";
import { ScheduleDetailModal } from "@/components/ScheduleDetailModal";
import { FindFreeTimeDrawer } from "@/components/FindFreeTimeDrawer";

export function CalendarBoard({
  findFreeTrigger,
  onFindFreeClose,
}: {
  findFreeTrigger?: number;
  onFindFreeClose?: () => void;
} = {}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
    [currentDate],
  );
  const weekEnd = useMemo(
    () => endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
    [currentDate],
  );

  const { data: schedules } = useSchedules(weekStart, weekEnd);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [prefilledTask, setPrefilledTask] = useState<{ id: number; title: string } | null>(null);
  const [quickSchedule, setQuickSchedule] = useState<QuickScheduleData | null>(null);

  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [isFindFreeOpen, setIsFindFreeOpen] = useState(false);
  const [findFreeDefaultDate, setFindFreeDefaultDate] = useState<string | undefined>(undefined);

  const { draggedTask } = useDrag();

  useEffect(() => {
    if (findFreeTrigger) {
      setIsFindFreeOpen(true);
    }
  }, [findFreeTrigger]);

  const handlePrevWeek = useCallback(() => setCurrentDate((d) => subWeeks(d, 1)), []);
  const handleNextWeek = useCallback(() => setCurrentDate((d) => addWeeks(d, 1)), []);
  const handleToday = useCallback(() => setCurrentDate(new Date()), []);

  const handleRangeSelected = useCallback((startIso: string, endIso: string) => {
    setSelectedSlot({ start: startIso, end: endIso });
    setPrefilledTask(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleTaskDrop = useCallback(
    (
      day: Date,
      minutes: number,
      task: { id: number; title: string; estimatedDuration: number | null },
      position: { x: number; y: number },
    ) => {
      setQuickSchedule({ task, day, minutes, position });
    },
    [],
  );

  const handleQuickScheduleClose = useCallback(() => {
    setQuickSchedule(null);
  }, []);

  const handleScheduleSelect = useCallback((id: number) => {
    setSelectedScheduleId(id);
  }, []);

  const handleDetailModalClose = useCallback((open: boolean) => {
    if (!open) {
      setSelectedScheduleId(null);
    }
  }, []);

  const handleFindFreeSelectSlot = useCallback((start: string, end: string) => {
    setSelectedSlot({ start, end });
    setPrefilledTask(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleConflict = useCallback((slot: { start: string; end: string }) => {
    setFindFreeDefaultDate(format(parseISO(slot.start), "yyyy-MM-dd"));
    setIsFindFreeOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white/30 backdrop-blur-md rounded-[1.5rem] border border-white/50 shadow-inner relative overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/30 bg-white/40 rounded-t-[1.5rem] flex-shrink-0">
        <h3 className="font-medium text-gray-800">
          {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-8 w-8 rounded-full hover:bg-white/60">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 rounded-full border border-white/50 bg-white/40 hover:bg-white/70 hover:shadow-sm transition-all duration-150 gap-1.5"
          >
            <CalendarDays className="h-4 w-4" />
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-8 w-8 rounded-full hover:bg-white/60">
            <ChevronRight className="w-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <CalendarGrid
          weekDays={weekDays}
          schedules={schedules ?? []}
          draggedTask={draggedTask}
          onRangeSelected={handleRangeSelected}
          onTaskDrop={handleTaskDrop}
          onScheduleSelect={handleScheduleSelect}
        />
      </div>

      {quickSchedule && (
        <QuickSchedulePopover
          task={quickSchedule.task}
          day={quickSchedule.day}
          minutes={quickSchedule.minutes}
          position={quickSchedule.position}
          onClose={handleQuickScheduleClose}
        />
      )}

      <CreateScheduleModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setPrefilledTask(null);
        }}
        initialSlot={selectedSlot}
        prefilledTask={prefilledTask}
        onConflict={handleConflict}
      />

      <ScheduleDetailModal
        scheduleId={selectedScheduleId}
        open={selectedScheduleId !== null}
        onOpenChange={handleDetailModalClose}
      />

      <FindFreeTimeDrawer
        open={isFindFreeOpen}
        onOpenChange={(open) => {
          setIsFindFreeOpen(open);
          if (!open) {
            setFindFreeDefaultDate(undefined);
            onFindFreeClose?.();
          }
        }}
        onSelectSlot={handleFindFreeSelectSlot}
        defaultDate={findFreeDefaultDate}
      />
    </div>
  );
}

function CreateScheduleModal({
  open,
  onOpenChange,
  initialSlot,
  prefilledTask,
  onConflict,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialSlot: { start: string; end: string } | null;
  prefilledTask: { id: number; title: string } | null;
  onConflict?: (slot: { start: string; end: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [taskId, setTaskId] = useState<string>("none");
  const { toast } = useToast();

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasksService(),
  });

  const createSchedule = useCreateSchedule();

  const resolvedTaskId = prefilledTask ? String(prefilledTask.id) : taskId;
  const resolvedTitle = prefilledTask
    ? title || prefilledTask.title
    : title || (taskId !== "none" ? tasks?.find((t: Task) => t.id === parseInt(taskId))?.title || "Event" : "Event");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialSlot) return;

    createSchedule.mutate(
      {
        title: resolvedTitle,
        startTime: initialSlot.start,
        endTime: initialSlot.end,
        taskId: resolvedTaskId !== "none" ? parseInt(resolvedTaskId) : null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setTaskId("none");
          onOpenChange(false);
          toast({
            title: "Scheduled!",
            description: `"${resolvedTitle}" added to your calendar.`,
          });
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 400) {
            toast({
              className: "bg-red-500/10 border border-red-400/20 backdrop-blur-xl shadow-lg shadow-red-500/10",
              title: "Time conflict!",
              description: err.message || "Khung giờ này đã có sự kiện khác. Vui lòng chọn thời gian khác!",
            });
            if (onConflict && initialSlot) {
              onConflict(initialSlot);
            }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{prefilledTask ? "Schedule Task" : "Schedule Time Block"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-3 bg-white/30 rounded-2xl p-4">
            {prefilledTask && (
              <div className="flex items-center gap-3 p-3 bg-blue-50/70 rounded-2xl border border-blue-200/50">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-blue-500 font-medium">Linked task</div>
                  <div className="text-sm font-semibold text-gray-800 truncate">{prefilledTask.title}</div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Time</Label>
              <div className="text-sm font-medium text-gray-700 bg-white/60 p-2.5 rounded-xl border border-white/40">
                {initialSlot &&
                  `${format(parseISO(initialSlot.start), "MMM d, h:mm a")} – ${format(parseISO(initialSlot.end), "h:mm a")}`}
              </div>
            </div>

            {!prefilledTask && (
              <div className="space-y-1.5">
                <Label>Link Task (Optional)</Label>
                <select
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl glass-input text-sm focus:outline-none"
                >
                  <option value="none">No task (Free event)</option>
                  {tasks
                    ?.filter((t: Task) => t.status !== "DONE" && t.status !== "COMPLETED")
                    .map((t: Task) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>{prefilledTask ? "Custom Title (optional)" : "Title"}</Label>
              <Input
                data-testid="input-schedule-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
                placeholder={prefilledTask ? prefilledTask.title : "e.g. Deep Work"}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button data-testid="button-submit-schedule" type="submit" className="glass-button" disabled={createSchedule.isPending}>
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
