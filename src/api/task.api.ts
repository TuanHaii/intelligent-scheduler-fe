import apiClient from "@/api/axios";
import type { Task, CreateTaskRequest, GetTasksParams } from "@/types/task.type";
import type { TaskStatus } from "@/types/task.type";

export async function getTasksApi(params?: GetTasksParams): Promise<Task[]> {
  const response = await apiClient.get<Task[]>("/tasks", { params });
  return response.data;
}

export async function createTaskApi(data: CreateTaskRequest): Promise<Task> {
  const response = await apiClient.post<Task>("/tasks", data);
  return response.data;
}

export async function updateTaskStatusApi(id: number, status: TaskStatus): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}/status`, null, {
    params: { status },
  });
  return response.data;
}

export async function updateTaskApi(id: number, data: Partial<CreateTaskRequest & { status: TaskStatus }>): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
  return response.data;
}

export async function deleteTaskApi(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}
