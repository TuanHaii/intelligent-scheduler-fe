import { getTasksApi, createTaskApi, updateTaskStatusApi, updateTaskApi, deleteTaskApi } from "@/api/task.api";
import type { Task, CreateTaskRequest, GetTasksParams } from "@/types/task.type";
import type { TaskStatus } from "@/types/task.type";
import { handleApiCall } from "@/api/axios";

export async function getTasksService(params?: GetTasksParams): Promise<Task[]> {
  return handleApiCall(() => getTasksApi(params), "Failed to fetch tasks");
}

export async function createTaskService(data: CreateTaskRequest): Promise<Task> {
  return handleApiCall(() => createTaskApi(data), "Failed to create task");
}

export async function updateTaskStatusService(id: number, status: TaskStatus): Promise<Task> {
  return handleApiCall(() => updateTaskStatusApi(id, status), "Failed to update task status");
}

export async function updateTaskService(
  id: number,
  data: Partial<CreateTaskRequest & { status: TaskStatus }>
): Promise<Task> {
  return handleApiCall(() => updateTaskApi(id, data), "Failed to update task");
}

export async function deleteTaskService(id: number): Promise<void> {
  return handleApiCall(() => deleteTaskApi(id), "Failed to delete task");
}
