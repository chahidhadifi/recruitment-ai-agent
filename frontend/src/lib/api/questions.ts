import { api } from '../api';

export interface Question {
  id: number;
  interview_id: number;
  question_text: string;
  answer_text?: string | null;
  score?: number | null;
  created_at?: string;
}

export const questionsApi = {
  async list(interview_id?: string, accessToken?: string): Promise<Question[]> {
    const params = interview_id ? `?interview_id=${encodeURIComponent(interview_id)}` : '';
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<Question[]>(`/api/questions/${params}`, { headers });
  },

  async getById(id: string, accessToken?: string): Promise<Question> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<Question>(`/api/questions/${id}`, { headers });
  },

  async create(data: Omit<Question, 'id' | 'created_at'>, accessToken?: string): Promise<Question> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.post<Question>(`/api/questions/`, data, { headers });
  },

  async update(id: string, data: Partial<Question>, accessToken?: string): Promise<Question> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.put<Question>(`/api/questions/${id}`, data, { headers });
  },

  async remove(id: string, accessToken?: string): Promise<void> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    await api.delete<void>(`/api/questions/${id}`, { headers });
  },
};