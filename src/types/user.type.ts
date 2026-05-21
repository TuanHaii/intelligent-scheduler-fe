export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  workingHourStart: string;
  workingHourEnd: string;
  timezone: string;
  isEmailVerified: boolean;
}

export interface UpdateUserPreferencesRequest {
  workingHourStart: string;
  workingHourEnd: string;
  timezone: string;
}
