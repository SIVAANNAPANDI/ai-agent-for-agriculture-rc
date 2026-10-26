import { api } from "./api";

export interface CropRecommendationItem {
  crop_id: number;
  crop_name: string;
  crop_tamil_name: string;
  category: string;
  suitability_score: number;
  duration_days: number;
  water_need: string;
  input_cost_per_acre?: number | null;
  yield_potential?: string | null;
  risk_level: string;
  icon_url?: string | null;
  what_summary: string;
  why_reason: string;
  when_window: string;
  next_steps: string;
  soil_compatible: boolean;
  ph_compatible: boolean;
  water_compatible: boolean;
}

export interface CropRecommendationResponse {
  farm_id: number;
  farm_name: string;
  soil_type: string;
  ph?: number | null;
  water_source?: string | null;
  irrigation_method?: string | null;
  generated_at: string;
  recommendations: CropRecommendationItem[];
}

export const recommendationService = {
  async getFarmRecommendations(farmId: number): Promise<CropRecommendationResponse> {
    const res = await api.get<CropRecommendationResponse>(`/api/recommendations/farm/${farmId}`);
    return res.data;
  },
};
