import { api } from "./api";

export interface SoilData {
  id?: number;
  soil_type: string;
  ph?: number | null;
  organic_matter_pct?: number | null;
  nitrogen_n?: number | null;
  phosphorus_p?: number | null;
  potassium_k?: number | null;
  ec?: number | null;
  tested_at?: string | null;
}

export interface Farm {
  id: number;
  user_id: number;
  name: string;
  land_area: number;
  area_unit: string;
  location_name: string;
  latitude: number;
  longitude: number;
  water_source?: string;
  irrigation_method?: string;
  soil?: SoilData | null;
  current_crop?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFarmPayload {
  name: string;
  land_area: number;
  area_unit: string;
  location_name: string;
  latitude: number;
  longitude: number;
  water_source?: string;
  irrigation_method?: string;
  soil?: {
    soil_type?: string;
    ph?: number | null;
    organic_matter_pct?: number | null;
    nitrogen_n?: number | null;
    phosphorus_p?: number | null;
    potassium_k?: number | null;
    ec?: number | null;
    tested_at?: string | null;
  };
}

export interface UpdateFarmPayload {
  name?: string;
  land_area?: number;
  area_unit?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  water_source?: string;
  irrigation_method?: string;
}

export interface UpdateSoilPayload {
  soil_type?: string;
  ph?: number | null;
  organic_matter_pct?: number | null;
  nitrogen_n?: number | null;
  phosphorus_p?: number | null;
  potassium_k?: number | null;
  ec?: number | null;
  tested_at?: string | null;
}

export const farmService = {
  async getFarms(): Promise<Farm[]> {
    const res = await api.get<Farm[]>("/api/farms");
    return res.data;
  },

  async getFarm(id: number): Promise<Farm> {
    const res = await api.get<Farm>(`/api/farms/${id}`);
    return res.data;
  },

  async createFarm(data: CreateFarmPayload): Promise<Farm> {
    const res = await api.post<Farm>("/api/farms", data);
    return res.data;
  },

  async updateFarm(id: number, data: UpdateFarmPayload): Promise<Farm> {
    const res = await api.put<Farm>(`/api/farms/${id}`, data);
    return res.data;
  },

  async deleteFarm(id: number): Promise<void> {
    await api.delete(`/api/farms/${id}`);
  },

  async updateSoil(farmId: number, data: UpdateSoilPayload): Promise<SoilData> {
    const res = await api.put<SoilData>(`/api/farms/${farmId}/soil`, data);
    return res.data;
  },
};
