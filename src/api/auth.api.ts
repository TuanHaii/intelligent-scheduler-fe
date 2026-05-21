import apiClient from "@/api/axios";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth.type";

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  const { accessToken } = response.data;
  localStorage.setItem("accessToken", accessToken);
  return response.data;
}

export async function registerApi(data: RegisterRequest): Promise<void> {
  await apiClient.post("/auth/register", data);
}
