export interface Schedule {
  id: number;
  taskId: number | null;
  taskTitle?: string | null;
  title: string;
  startTime: string;
  endTime: string;
  status: "PLANNED";
}

export interface CreateSchedulePayload {
  title: string;
  startTime: string;
  endTime: string;
  taskId: number | null;
}

export interface UpdateSchedulePayload {
  title: string;
  startTime: string;
  endTime: string;
  taskId: number | null;
  status: "PLANNED";
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
