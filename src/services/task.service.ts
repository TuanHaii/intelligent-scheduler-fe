import { getTasksApi, createTaskApi, updateTaskStatusApi, updateTaskApi, deleteTaskApi } from "@/api/task.api";
import type { Task, CreateTaskRequest, GetTasksParams } from "@/types/task.type";
import type { TaskStatus } from "@/types/task.type";

export async function getTasksService(params?: GetTasksParams): Promise<Task[]> {
  try {
    return await getTasksApi(params);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Failed to fetch tasks");
    }
    throw new Error("Failed to fetch tasks");
  }
}

export async function createTaskService(data: CreateTaskRequest): Promise<Task> {
  try {
    return await createTaskApi(data);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Failed to create task");
    }
    throw new Error("Failed to create task");
  }
}

export async function updateTaskStatusService(id: number, status: TaskStatus): Promise<Task> {
  try {
    return await updateTaskStatusApi(id, status);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Failed to update task status");
    }
    throw new Error("Failed to update task status");
  }
}

export async function updateTaskService(
  id: number,
  data: Partial<CreateTaskRequest & { status: TaskStatus }>
): Promise<Task> {
  try {
    return await updateTaskApi(id, data);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Failed to update task");
    }
    throw new Error("Failed to update task");
  }
}

export async function deleteTaskService(id: number): Promise<void> {
  try {
    await deleteTaskApi(id);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Failed to delete task");
    }
    throw new Error("Failed to delete task");
  }
}
