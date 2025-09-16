import { api } from '../api';

export interface Message {
  id: number;
  interview_id: number;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'audio';
  audio_url?: string | null;
  timestamp?: string;
}

export const messagesApi = {
  async list(interview_id: string, accessToken?: string): Promise<Message[]> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<Message[]>(`/api/messages/?interview_id=${encodeURIComponent(interview_id)}`, { headers });
  },

  async getById(id: string, accessToken?: string): Promise<Message> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<Message>(`/api/messages/${id}`, { headers });
  },

  async create(data: Omit<Message, 'id' | 'timestamp'>, accessToken?: string): Promise<Message> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.post<Message>(`/api/messages/`, data, { headers });
  },

  async update(id: string, data: Partial<Message>, accessToken?: string): Promise<Message> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.put<Message>(`/api/messages/${id}`, data, { headers });
  },

  async remove(id: string, accessToken?: string): Promise<void> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    await api.delete<void>(`/api/messages/${id}`, { headers });
  },
};