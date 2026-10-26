import { api } from "./api";

export interface MarketProduct {
  id: number;
  seller_id: number;
  seller_name: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_value: number;
  description?: string | null;
  seller_phone: string;
  status: "AVAILABLE" | "SOLD" | "DELISTED";
  created_at: string;
  updated_at: string;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  is_owner: boolean;
}

export interface MarketProductCreate {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  description?: string;
  seller_phone: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

export interface MarketProductUpdate {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  price_per_unit?: number;
  description?: string;
  seller_phone?: string;
  status?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

export const marketService = {
  getProducts: async (params?: {
    category?: string;
    search?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<MarketProduct[]> => {
    const response = await api.get<MarketProduct[]>("/api/market/products", {
      params,
    });
    return response.data;
  },

  getMyProducts: async (skip: number = 0, limit: number = 50): Promise<MarketProduct[]> => {
    const response = await api.get<MarketProduct[]>("/api/market/my-products", {
      params: { skip, limit },
    });
    return response.data;
  },

  getProduct: async (id: number): Promise<MarketProduct> => {
    const response = await api.get<MarketProduct>(`/api/market/products/${id}`);
    return response.data;
  },

  createProduct: async (product: MarketProductCreate): Promise<MarketProduct> => {
    const response = await api.post<MarketProduct>("/api/market/products", product);
    return response.data;
  },

  updateProduct: async (
    id: number,
    product: MarketProductUpdate
  ): Promise<MarketProduct> => {
    const response = await api.put<MarketProduct>(`/api/market/products/${id}`, product);
    return response.data;
  },

  updateProductStatus: async (
    id: number,
    status: "AVAILABLE" | "SOLD"
  ): Promise<MarketProduct> => {
    const response = await api.patch<MarketProduct>(`/api/market/products/${id}/status`, {
      status,
    });
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/api/market/products/${id}`);
  },
};
