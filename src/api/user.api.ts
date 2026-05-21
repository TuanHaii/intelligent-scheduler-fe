import apiClient from "@/api/axios";
import type { UserProfile, UpdateUserPreferencesRequest } from "@/types/user.type";

function extractUser(raw: unknown): UserProfile {
  const obj = raw as Record<string, unknown>;

  // handle nested { data: { ... } } or { success: true, data: { ... } }
  const source = (obj.data && typeof obj.data === "object" ? obj.data : obj) as Record<string, unknown>;

  console.log("[getMe] raw response body:", raw);
  console.log("[getMe] extracted source:", source);

  return {
    id: String(source.id ?? ""),
    email: String(source.email ?? ""),
    fullName: String(source.fullName ?? ""),
    role: String(source.role ?? ""),
    workingHourStart: String(source.workingHourStart ?? ""),
    workingHourEnd: String(source.workingHourEnd ?? ""),
    timezone: String(source.timezone ?? ""),
    isEmailVerified: Boolean(source.isEmailVerified),
  };
}

export async function getMeApi(): Promise<UserProfile> {
  const response = await apiClient.get("/users/me");
  return extractUser(response.data);
}

export async function updatePreferencesApi(data: UpdateUserPreferencesRequest): Promise<UserProfile> {
  const response = await apiClient.put("/users/me/preferences", data);
  return extractUser(response.data);
}
