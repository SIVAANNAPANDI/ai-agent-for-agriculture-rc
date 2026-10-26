import { api } from "./api";

export interface FarmerProfile {
  id: number;
  preferred_language: string;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  experience_years: number;
  primary_crop_type?: string | null;
}

export interface UserSettings {
  language: string;
  weather_alerts_enabled: boolean;
  task_reminders_enabled: boolean;
  market_alerts_enabled: boolean;
  theme_mode: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  profile?: FarmerProfile | null;
  settings?: UserSettings | null;
  farms_count: number;
}

export interface FarmerProfileUpdate {
  name?: string;
  phone?: string;
  location_name?: string;
  preferred_language?: string;
  experience_years?: number;
  primary_crop_type?: string;
}

export interface UserSettingsUpdate {
  language?: string;
  weather_alerts_enabled?: boolean;
  task_reminders_enabled?: boolean;
  market_alerts_enabled?: boolean;
  theme_mode?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export const userService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get<UserProfileResponse>("/api/users/me");
    return response.data;
  },

  updateProfile: async (data: FarmerProfileUpdate): Promise<UserProfileResponse> => {
    const response = await api.put<UserProfileResponse>("/api/users/profile", data);
    return response.data;
  },

  getSettings: async (): Promise<UserSettings> => {
    const response = await api.get<UserSettings>("/api/users/settings");
    return response.data;
  },

  updateSettings: async (data: UserSettingsUpdate): Promise<UserSettings> => {
    const response = await api.put<UserSettings>("/api/users/settings", data);
    return response.data;
  },

  changePassword: async (data: PasswordChangeRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.put<{ success: boolean; message: string }>("/api/users/password", data);
    return response.data;
  },
};
