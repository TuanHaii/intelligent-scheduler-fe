import { getMeApi, updatePreferencesApi } from "@/api/user.api";
import type { UserProfile, UpdateUserPreferencesRequest } from "@/types/user.type";

export async function getMeService(): Promise<UserProfile> {
  try {
    return await getMeApi();
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Failed to fetch profile");
    }
    throw new Error("Failed to fetch profile");
  }
}

export async function updatePreferencesService(data: UpdateUserPreferencesRequest): Promise<UserProfile> {
  try {
    return await updatePreferencesApi(data);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Failed to update preferences");
    }
    throw new Error("Failed to update preferences");
  }
}
