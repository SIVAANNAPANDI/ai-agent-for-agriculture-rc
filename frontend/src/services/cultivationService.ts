import { api } from "./api";

export interface CropOption {
  id: number;
  name: string;
  tamil_name: string;
  category: string;
  typical_duration_days: number;
  water_requirement_level: string;
}

export interface CultivationTask {
  id: number;
  cycle_id: number;
  stage_name: string;
  title: string;
  description?: string | null;
  due_date: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  weather_note?: string | null;
  completed_at?: string | null;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface CultivationCycle {
  id: number;
  farm_id: number;
  farm_name: string;
  crop_id: number;
  crop_name: string;
  crop_tamil_name: string;
  start_date: string;
  expected_harvest_date: string;
  actual_harvest_date?: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "HARVESTED" | "CANCELLED";
  days_total: number;
  days_elapsed: number;
  days_remaining: number;
  progress_pct: number;
  current_stage: string;
  estimated_yield?: string | null;
  notes?: string | null;
  tasks_count: number;
  tasks_completed_count: number;
  tasks: CultivationTask[];
  created_at: string;
  updated_at: string;
}

export interface CreateCyclePayload {
  farm_id: number;
  crop_id: number;
  start_date: string;
  expected_harvest_date?: string | null;
  estimated_yield?: string | null;
  notes?: string | null;
}

export interface UpdateCyclePayload {
  status?: string;
  actual_harvest_date?: string | null;
  estimated_yield?: string | null;
  notes?: string | null;
}

export interface CreateTaskPayload {
  stage_name: string;
  title: string;
  due_date: string;
  description?: string;
  weather_note?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  due_date?: string;
  status?: string;
  weather_note?: string;
}

export const cultivationService = {
  async getCrops(): Promise<CropOption[]> {
    const res = await api.get<CropOption[]>("/api/cultivation/crops");
    return res.data;
  },

  async getCycles(): Promise<CultivationCycle[]> {
    const res = await api.get<CultivationCycle[]>("/api/cultivation/cycles");
    return res.data;
  },

  async getCycle(id: number): Promise<CultivationCycle> {
    const res = await api.get<CultivationCycle>(`/api/cultivation/cycles/${id}`);
    return res.data;
  },

  async createCycle(payload: CreateCyclePayload): Promise<CultivationCycle> {
    const res = await api.post<CultivationCycle>("/api/cultivation/cycles", payload);
    return res.data;
  },

  async updateCycle(id: number, payload: UpdateCyclePayload): Promise<CultivationCycle> {
    const res = await api.put<CultivationCycle>(`/api/cultivation/cycles/${id}`, payload);
    return res.data;
  },

  async deleteCycle(id: number): Promise<void> {
    await api.delete(`/api/cultivation/cycles/${id}`);
  },

  async addTask(cycleId: number, payload: CreateTaskPayload): Promise<CultivationTask> {
    const res = await api.post<CultivationTask>(`/api/cultivation/cycles/${cycleId}/tasks`, payload);
    return res.data;
  },

  async updateTask(taskId: number, payload: UpdateTaskPayload): Promise<CultivationTask> {
    const res = await api.put<CultivationTask>(`/api/cultivation/tasks/${taskId}`, payload);
    return res.data;
  },
};
