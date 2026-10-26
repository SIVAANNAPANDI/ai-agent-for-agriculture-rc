import { api } from "./api";

export interface Notification {
  id: number;
  user_id: number;
  type: "weather" | "cultivation" | "harvest" | "marketplace" | "ai" | "system" | string;
  title: string;
  message: string;
  action_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unread_count: number;
  total: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export const notificationService = {
  getNotifications: async (params?: {
    unread_only?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>("/api/notifications", {
      params,
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>("/api/notifications/unread-count");
    return response.data.unread_count;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await api.patch<Notification>(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; marked_count: number }> => {
    const response = await api.post<{ success: boolean; marked_count: number }>(
      "/api/notifications/read-all"
    );
    return response.data;
  },

  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/api/notifications/${id}`);
  },
};
