import { api } from "./api";

export interface CandidateClass {
  class_name: string;
  crop: string;
  disease_name: string;
  display_name: string;
  confidence: number;
  confidence_pct: number;
}

export interface DiseaseDiagnosis {
  id?: number;
  predicted_class: string;
  crop_name: string;
  disease_name: string;
  display_name: string;
  pathogen: string;
  confidence: number;
  confidence_pct: number;
  is_healthy: boolean;
  severity: "none" | "low" | "medium" | "high" | "critical";
  is_low_confidence: boolean;
  warning?: string | null;
  symptoms: string[];
  organic_treatment: string[];
  chemical_treatment: string[];
  preventive_measures: string[];
  top_candidates: CandidateClass[];
  image_url?: string | null;
  created_at?: string | null;
}

export interface DiseaseHistoryItem {
  id: number;
  crop_name: string;
  disease_name: string;
  predicted_class: string;
  confidence: number;
  confidence_pct: number;
  severity: string;
  is_healthy: boolean;
  image_url: string;
  created_at: string;
}

export const diseaseService = {
  predictLeafDisease: async (
    file: File,
    language: "en" | "ta" = "en"
  ): Promise<DiseaseDiagnosis> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<DiseaseDiagnosis>(
      `/api/disease/predict?language=${language}`,
      formData,
      {
        timeout: 60000,
      }
    );
    return response.data;
  },

  getScanHistory: async (limit: number = 30): Promise<DiseaseHistoryItem[]> => {
    const response = await api.get<DiseaseHistoryItem[]>(
      `/api/disease/history?limit=${limit}`
    );
    return response.data;
  },

  getScanDetail: async (
    id: number,
    language: "en" | "ta" = "en"
  ): Promise<DiseaseDiagnosis> => {
    const response = await api.get<DiseaseDiagnosis>(
      `/api/disease/${id}?language=${language}`
    );
    return response.data;
  },
};
