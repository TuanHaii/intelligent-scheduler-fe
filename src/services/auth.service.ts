import { loginApi, registerApi } from "@/api/auth.api";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth.type";

export async function loginService(data: LoginRequest): Promise<AuthResponse> {
  try {
    return await loginApi(data);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Login failed");
    }
    throw new Error("Login failed");
  }
}

export async function registerService(data: RegisterRequest): Promise<void> {
  try {
    await registerApi(data);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Registration failed");
    }
    throw new Error("Registration failed");
  }
}
