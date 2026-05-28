import axios, { isAxiosError } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  },
);

export interface ApiResponseShape<T> {
  status: number;
  message: string;
  data: T;
}

export function unwrapResponse<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    const maybe = response as ApiResponseShape<T>;
    if (maybe.data !== undefined) {
      return maybe.data;
    }
  }
  return response as T;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response?.data) {
    const body = error.response.data as Record<string, unknown>;
    return typeof body.message === "string" ? body.message : fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function handleApiCall<T>(
  fn: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      throw new ApiError(
        extractErrorMessage(error, fallbackMessage),
        error.response.status,
      );
    }
    throw new ApiError(fallbackMessage, 500);
  }
}

export default apiClient;
