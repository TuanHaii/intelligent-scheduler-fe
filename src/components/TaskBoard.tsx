import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { getTasksService, createTaskService, updateTaskService, updateTaskStatusService, deleteTaskService } from "@/services/task.service";
import type { Task, CreateTaskRequest, TaskPriority, TaskStatus } from "@/types/task.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Clock, Calendar, Check, Play, Circle, Trash, Edit, GripVertical, X, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useDrag } from "@/context/DragContext";

const TASKS_KEY = ["tasks"];

export function TaskBoard() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: TASKS_KEY,
    queryFn: () => getTasksService(),
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const pendingTasks = tasks?.filter(t => t.status !== "DONE") || [];

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 flex items-center justify-end pb-2 bg-white/30 backdrop-blur-sm">
        <Button
          data-testid="button-create-task"
          className="w-9 h-9 rounded-full glass-button flex items-center justify-center shadow-md p-0 hover:scale-105 hover:shadow-lg transition-all duration-200"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
        {isLoading ? (
          <div className="text-center text-sm text-gray-500 mt-8">Loading tasks...</div>
        ) : pendingTasks.length === 0 ? (
          <div className="text-center text-sm text-gray-400 mt-8 px-4">
            <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center mx-auto mb-3">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            No pending tasks. You're all caught up!
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <GripVertical className="w-3 h-3" />
              Drag a task onto the calendar to schedule it
            </p>
            {pendingTasks.map(task => (
              <TaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} />
            ))}
          </>
        )}
      </div>

      <CreateTaskModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}

function TaskItem({ task, onClick }: { task: Task; onClick: () => void }) {
  const { setDraggedTask } = useDrag();
  const [isDragging, setIsDragging] = useState(false);

  const statusIcon: Record<string, React.ReactNode> = {
    TODO: <Circle className="w-4 h-4 text-gray-400" />,
    PENDING: <Circle className="w-4 h-4 text-gray-400" />,
    IN_PROGRESS: <Play className="w-4 h-4 text-blue-500 fill-blue-500/20" />,
    DONE: <Check className="w-4 h-4 text-green-500" />,
    COMPLETED: <Check className="w-4 h-4 text-green-500" />,
  };

  const icon = statusIcon[task.status] || <Circle className="w-4 h-4 text-gray-400" />;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    setDraggedTask({ id: task.id, title: task.title, estimatedDuration: task.estimatedDurationMinutes ?? null });
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", String(task.id));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedTask(null);
  };

  return (
    <div
      data-testid={`card-task-${task.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`glass-pill p-3 cursor-grab active:cursor-grabbing hover:bg-white/60 transition-all group relative overflow-hidden select-none
        ${isDragging ? "opacity-40 scale-95 ring-2 ring-blue-400/60" : "hover:-translate-y-0.5 hover:shadow-lg"}`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400 mt-0.5 flex-shrink-0 transition-colors" />
        <div className="mt-0.5 flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate text-sm">{task.title}</h4>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 flex-wrap">
            {task.estimatedDurationMinutes && (
              <span className="flex items-center gap-1 bg-blue-100/70 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                <Clock className="w-3 h-3" />
                {task.estimatedDurationMinutes}m
              </span>
            )}
            {task.deadline && (
              <span className="flex items-center gap-1 bg-red-50/70 text-red-500 px-2 py-0.5 rounded-full font-medium">
                <Calendar className="w-3 h-3" />
                {format(parseISO(task.deadline), "MMM d")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateTaskModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [duration, setDuration] = useState("");
  const [deadline, setDeadline] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => createTaskService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDuration("");
      setDeadline("");
      onOpenChange(false);
    },
    onError: (err: Error) => toast({ title: "Failed to create task", description: err.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      title,
      description,
      priority,
      estimatedDurationMinutes: duration ? parseInt(duration) : 0,
      deadline: deadline ? new Date(deadline).toISOString() : new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg w-[560px] max-sm:w-full
          bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-3xl
          border border-white/60 shadow-2xl shadow-blue-500/10
          rounded-[1.5rem] sm:rounded-[1.5rem]
          p-0 gap-0 overflow-hidden"
      >
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 p-6 sm:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold tracking-tight">New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="space-y-2">
                <Label className="uppercase text-xs tracking-wide font-semibold text-gray-600">Title</Label>
                <Input
                  data-testid="input-task-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="glass-input text-base h-11"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs tracking-wide font-semibold text-gray-600">Description</Label>
                <Input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="glass-input text-base h-11"
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wide font-semibold text-gray-600">Priority</Label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                    className="w-full h-11 px-4 rounded-2xl glass-input text-sm focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wide font-semibold text-gray-600">Duration</Label>
                  <Input
                    data-testid="input-task-duration"
                    type="number"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="glass-input text-base h-11"
                    placeholder="min"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wide font-semibold text-gray-600">Deadline</Label>
                  <Input
                    data-testid="input-task-deadline"
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="glass-input text-base h-11"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6 gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-11 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-gray-600 hover:text-gray-900 transition-all duration-150"
              >
                Cancel
              </Button>
              <Button
                data-testid="button-submit-task"
                type="submit"
                className="glass-button rounded-xl h-11 px-8 text-sm font-semibold"
                disabled={createMutation.isPending || !title.trim()}
              >
                {createMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskDetailModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("PENDING");
  const [editPriority, setEditPriority] = useState<TaskPriority>("MEDIUM");
  const [editDuration, setEditDuration] = useState("");

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTaskRequest & { status: TaskStatus }> }) =>
      updateTaskService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      setIsEditing(false);
      onClose();
    },
    onError: (err: Error) => toast({ title: "Failed to update task", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTaskService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      onClose();
    },
    onError: (err: Error) => toast({ title: "Failed to delete task", description: err.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      updateTaskStatusService(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast({ title: "Status updated" });
    },
    onError: (err: Error) => toast({ title: "Failed to update status", description: err.message, variant: "destructive" }),
  });

  if (!task) return null;

  const handleEdit = () => {
    setEditTitle(task.title);
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditDuration(task.estimatedDurationMinutes != null ? String(task.estimatedDurationMinutes) : "");
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      id: task.id,
      data: {
        title: editTitle,
        status: editStatus,
        priority: editPriority,
        estimatedDurationMinutes: editDuration ? parseInt(editDuration) : 0,
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(task.id);
  };

  const handleStatusChange = (status: TaskStatus) => {
    statusMutation.mutate({ id: task.id, status });
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-400/20 text-amber-700 border-amber-400/20",
    IN_PROGRESS: "bg-blue-400/20 text-blue-700 border-blue-400/20",
    COMPLETED: "bg-emerald-400/20 text-emerald-700 border-emerald-400/20",
    DONE: "bg-emerald-400/20 text-emerald-700 border-emerald-400/20",
    CANCELLED: "bg-red-400/20 text-red-700 border-red-400/20",
  };

  const statusDot: Record<string, string> = {
    PENDING: "bg-amber-400",
    IN_PROGRESS: "bg-blue-400",
    COMPLETED: "bg-emerald-400",
    DONE: "bg-emerald-400",
    CANCELLED: "bg-red-400",
  };

  const priorityColor: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-amber-100 text-amber-700",
    HIGH: "bg-red-100 text-red-700",
  };

  return (
    <Dialog open={!!task} onOpenChange={o => !o && onClose()}>
      <DialogContent
        className="sm:max-w-xl w-[640px] max-sm:w-full
          bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur-3xl
          border border-white/60 shadow-2xl shadow-blue-500/10
          rounded-[1.5rem] sm:rounded-[1.5rem]
          p-0 gap-0 overflow-hidden"
      >
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8">
          {/* Custom close button */}
          <button
            type="button"
            onClick={() => onClose()}
            className="absolute right-6 top-6 sm:right-8 sm:top-8 z-50 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-150 opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {isEditing ? (
            <div className="space-y-5">
              <DialogHeader className="mb-2">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Edit Task
                </DialogTitle>
              </DialogHeader>

              <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wide font-semibold text-gray-600">
                    Title
                  </Label>
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="glass-input text-base h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wide font-semibold text-gray-600">
                    Status
                  </Label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full h-11 px-4 py-2 rounded-2xl glass-input text-sm focus:outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide font-semibold text-gray-600">Priority</Label>
                    <select
                      value={editPriority}
                      onChange={e => setEditPriority(e.target.value as TaskPriority)}
                      className="w-full h-11 px-4 rounded-2xl glass-input text-sm focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide font-semibold text-gray-600">Duration</Label>
                    <Input
                      type="number"
                      value={editDuration}
                      onChange={e => setEditDuration(e.target.value)}
                      className="glass-input text-base h-11"
                      placeholder="min"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl h-11 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-gray-600 hover:text-gray-900 transition-all duration-150"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="glass-button rounded-xl h-11 px-8 text-sm font-semibold"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {task.title}
                </DialogTitle>
              </DialogHeader>

              {/* Info cards row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Status */}
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${statusDot[task.status] ? `${statusDot[task.status].replace("bg-", "bg-")}/20` : "bg-gray-400/20"} border border-white/20 flex items-center justify-center`}>
                      <Play className={`w-3 h-3 ${statusDot[task.status] ? statusDot[task.status].replace("bg-", "text-") : "text-gray-400"}`} />
                    </div>
                    <span className="uppercase text-[10px] tracking-wider font-semibold text-gray-500">
                      Status
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800 px-3 py-1 rounded-full ${statusColor[task.status] || "bg-gray-100 text-gray-600"}`}>
                    <span className={`w-2 h-2 rounded-full ${statusDot[task.status] || "bg-gray-400"}`} />
                    {task.status === "IN_PROGRESS" ? "In Progress" : task.status.charAt(0) + task.status.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Priority */}
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-400/20 border border-indigo-400/20 flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-indigo-300" />
                    </div>
                    <span className="uppercase text-[10px] tracking-wider font-semibold text-gray-500">
                      Priority
                    </span>
                  </div>
                  <span className={`inline-flex items-center text-sm font-semibold text-gray-800 px-3 py-1 rounded-full ${priorityColor[task.priority] || "bg-gray-100 text-gray-600"}`}>
                    {task.priority}
                  </span>
                </div>

                {/* Duration */}
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-400/20 border border-blue-400/20 flex items-center justify-center">
                      <Clock className="w-3 h-3 text-blue-300" />
                    </div>
                    <span className="uppercase text-[10px] tracking-wider font-semibold text-gray-500">
                      Duration
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 pl-0.5">
                    {task.estimatedDurationMinutes != null ? `${task.estimatedDurationMinutes}m` : "—"}
                  </div>
                </div>
              </div>

              {/* Status actions */}
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-sm">
                <span className="uppercase text-[10px] tracking-wider font-semibold text-gray-500 mb-3 block">Quick Actions</span>
                <div className="flex flex-wrap gap-2">
                  {task.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange("IN_PROGRESS")}
                      disabled={statusMutation.isPending}
                      className="rounded-xl h-9 px-4 text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 border border-blue-400/20 backdrop-blur-sm"
                    >
                      <Play className="w-3 h-3 mr-1.5 fill-blue-600" />
                      Start
                    </Button>
                  )}
                  {task.status === "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange("COMPLETED")}
                      disabled={statusMutation.isPending}
                      className="rounded-xl h-9 px-4 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 border border-emerald-400/20 backdrop-blur-sm"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1.5" />
                      Complete
                    </Button>
                  )}
                  {task.status !== "CANCELLED" && task.status !== "COMPLETED" && task.status !== "DONE" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange("CANCELLED")}
                      disabled={statusMutation.isPending}
                      className="rounded-xl h-9 px-4 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-400/15 backdrop-blur-sm"
                    >
                      Cancel Task
                    </Button>
                  )}
                  {statusMutation.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400 self-center" />
                  )}
                </div>
              </div>

              {/* Extra info section */}
              {(task.description || task.deadline) && (
                <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-2xl p-5 space-y-3 shadow-sm">
                  {task.description && (
                    <div className="space-y-1">
                      <span className="uppercase text-[10px] tracking-wider font-semibold text-gray-500">Description</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                    </div>
                  )}
                  {task.deadline && (
                    <div className="space-y-1">
                      <span className="uppercase text-[10px] tracking-wider font-semibold text-gray-500">Deadline</span>
                      <p className="text-sm font-medium text-gray-800">{format(parseISO(task.deadline), "MMM d, yyyy h:mm a")}</p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="gap-3 pt-2 sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="rounded-xl h-11 px-5 bg-red-500/5 hover:bg-red-500/10 backdrop-blur-md border border-red-400/20 text-red-500 hover:text-red-600 transition-all duration-150"
                >
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="rounded-xl h-11 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-gray-600 hover:text-gray-900 transition-all duration-150"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleEdit}
                    className="glass-button rounded-xl h-11 px-8 text-sm font-semibold"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
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
