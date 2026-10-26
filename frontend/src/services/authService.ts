import { api } from "./api";

export interface UserBasic {
  id: number;
  name: string;
  email: string;
  phone: string;
  preferred_language: string;
  location?: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserBasic;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  location?: string;
  preferred_language?: string;
}

export interface LoginData {
  email_or_username: string;
  password: string;
  remember_me?: boolean;
}

export interface UserProfile extends UserBasic {
  is_active: boolean;
  profile?: {
    id: number;
    preferred_language: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    experience_years: number;
    primary_crop_type?: string;
  };
  settings?: {
    language: string;
    weather_alerts_enabled: boolean;
    task_reminders_enabled: boolean;
    market_alerts_enabled: boolean;
    theme_mode: string;
  };
  farms_count: number;
}

export const authService = {
  async signup(data: SignupData): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/api/auth/signup", data);
    return res.data;
  },

  async login(data: LoginData): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/api/auth/login", data);
    return res.data;
  },

  async getCurrentUser(): Promise<UserProfile> {
    const res = await api.get<UserProfile>("/api/users/me");
    return res.data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await api.put<UserProfile>("/api/users/profile", data);
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await api.put("/api/users/password", {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    });
    return res.data;
  },
};
