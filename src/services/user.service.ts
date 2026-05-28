import { getMeApi, updatePreferencesApi } from "@/api/user.api";
import type { UserProfile, UpdateUserPreferencesRequest } from "@/types/user.type";
import { handleApiCall } from "@/api/axios";

export async function getMeService(): Promise<UserProfile> {
  return handleApiCall(() => getMeApi(), "Failed to fetch profile");
}

export async function updatePreferencesService(data: UpdateUserPreferencesRequest): Promise<UserProfile> {
  return handleApiCall(() => updatePreferencesApi(data), "Failed to update preferences");
}
