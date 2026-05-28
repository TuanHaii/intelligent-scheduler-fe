import { loginApi, registerApi } from "@/api/auth.api";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth.type";
import { handleApiCall } from "@/api/axios";

export async function loginService(data: LoginRequest): Promise<AuthResponse> {
  return handleApiCall(() => loginApi(data), "Login failed");
}

export async function registerService(data: RegisterRequest): Promise<void> {
  return handleApiCall(() => registerApi(data), "Registration failed");
}
