import { api } from "./api";

export interface Labour {
  id: number;
  user_id: number;
  poster_name: string;
  worker_name: string;
  phone: string;
  skills: string[];
  experience_years: number;
  daily_wage: number;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  availability_status: "AVAILABLE" | "BUSY" | "INACTIVE";
  description?: string | null;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
}

export interface LabourCreate {
  worker_name: string;
  phone: string;
  skills: string[];
  experience_years: number;
  daily_wage: number;
  location_name: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface LabourUpdate {
  worker_name?: string;
  phone?: string;
  skills?: string[];
  experience_years?: number;
  daily_wage?: number;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  availability_status?: string;
  description?: string;
}

export const labourService = {
  getLabours: async (params?: {
    skill?: string;
    search?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<Labour[]> => {
    const response = await api.get<Labour[]>("/api/labours", { params });
    return response.data;
  },

  getMyLabours: async (skip: number = 0, limit: number = 50): Promise<Labour[]> => {
    const response = await api.get<Labour[]>("/api/labours/my-listings", {
      params: { skip, limit },
    });
    return response.data;
  },

  getLabour: async (id: number): Promise<Labour> => {
    const response = await api.get<Labour>(`/api/labours/${id}`);
    return response.data;
  },

  createLabour: async (labour: LabourCreate): Promise<Labour> => {
    const response = await api.post<Labour>("/api/labours", labour);
    return response.data;
  },

  updateLabour: async (id: number, labour: LabourUpdate): Promise<Labour> => {
    const response = await api.put<Labour>(`/api/labours/${id}`, labour);
    return response.data;
  },

  updateAvailability: async (
    id: number,
    status: "AVAILABLE" | "BUSY" | "INACTIVE"
  ): Promise<Labour> => {
    const response = await api.patch<Labour>(`/api/labours/${id}/availability`, {
      availability_status: status,
    });
    return response.data;
  },

  deleteLabour: async (id: number): Promise<void> => {
    await api.delete(`/api/labours/${id}`);
  },
};
