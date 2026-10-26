import { api } from "./api";

export interface RentalProperty {
  id: number;
  user_id: number;
  poster_name: string;
  owner_name: string;
  phone: string;
  title: string;
  land_area: number;
  area_unit: string;
  monthly_rent: number;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  available_from: string;
  available_until?: string | null;
  water_source?: string | null;
  soil_type?: string | null;
  description?: string | null;
  images: string[];
  status: "AVAILABLE" | "RENTED" | "INACTIVE";
  created_at: string;
  updated_at: string;
  is_owner: boolean;
}

export interface RentalPropertyCreate {
  title: string;
  owner_name: string;
  phone: string;
  land_area: number;
  area_unit?: string;
  monthly_rent: number;
  location_name: string;
  latitude?: number;
  longitude?: number;
  available_from: string;
  available_until?: string;
  water_source?: string;
  soil_type?: string;
  description?: string;
  images?: string[];
}

export interface RentalPropertyUpdate {
  title?: string;
  owner_name?: string;
  phone?: string;
  land_area?: number;
  area_unit?: string;
  monthly_rent?: number;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  available_from?: string;
  available_until?: string;
  water_source?: string;
  soil_type?: string;
  description?: string;
  images?: string[];
  status?: string;
}

export const rentalService = {
  getRentals: async (params?: {
    search?: string;
    water_source?: string;
    soil_type?: string;
    status?: string;
    min_area?: number;
    max_rent?: number;
    skip?: number;
    limit?: number;
  }): Promise<RentalProperty[]> => {
    const response = await api.get<RentalProperty[]>("/api/rentals", { params });
    return response.data;
  },

  getMyRentals: async (skip: number = 0, limit: number = 50): Promise<RentalProperty[]> => {
    const response = await api.get<RentalProperty[]>("/api/rentals/my-rentals", {
      params: { skip, limit },
    });
    return response.data;
  },

  getRental: async (id: number): Promise<RentalProperty> => {
    const response = await api.get<RentalProperty>(`/api/rentals/${id}`);
    return response.data;
  },

  createRental: async (rental: RentalPropertyCreate): Promise<RentalProperty> => {
    const response = await api.post<RentalProperty>("/api/rentals", rental);
    return response.data;
  },

  updateRental: async (id: number, rental: RentalPropertyUpdate): Promise<RentalProperty> => {
    const response = await api.put<RentalProperty>(`/api/rentals/${id}`, rental);
    return response.data;
  },

  updateStatus: async (
    id: number,
    status: "AVAILABLE" | "RENTED" | "INACTIVE"
  ): Promise<RentalProperty> => {
    const response = await api.patch<RentalProperty>(`/api/rentals/${id}/status`, {
      status,
    });
    return response.data;
  },

  deleteRental: async (id: number): Promise<void> => {
    await api.delete(`/api/rentals/${id}`);
  },
};
