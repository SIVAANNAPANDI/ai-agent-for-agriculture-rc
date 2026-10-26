import { api } from "./api";

export interface Message {
  id?: number;
  sender: "farmer" | "ai";
  content: string;
  tool_calls?: Array<{ tool: string }> | null;
  tool_results?: Array<Record<string, any>> | null;
  created_at?: string;
}

export interface ChatPayload {
  message: string;
  conversation_id?: number | null;
  farm_id?: number | null;
  language?: string;
}

export interface ChatResponse {
  conversation_id: number;
  message: Message;
  is_guardrail_triggered: boolean;
  tools_executed: string[];
}

export interface ConversationSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationDetail {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export const aiService = {
  async sendMessage(payload: ChatPayload): Promise<ChatResponse> {
    const res = await api.post<ChatResponse>("/api/ai/chat", payload);
    return res.data;
  },

  async getConversations(): Promise<ConversationSummary[]> {
    const res = await api.get<ConversationSummary[]>("/api/ai/conversations");
    return res.data;
  },

  async getConversation(id: number): Promise<ConversationDetail> {
    const res = await api.get<ConversationDetail>(`/api/ai/conversations/${id}`);
    return res.data;
  },

  async deleteConversation(id: number): Promise<void> {
    await api.delete(`/api/ai/conversations/${id}`);
  },
};
