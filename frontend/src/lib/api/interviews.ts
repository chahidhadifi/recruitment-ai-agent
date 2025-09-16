import { api } from '../api';

export interface Interview {
  id: number;
  candidate_id: number;
  position: string;
  date: string;
  status?: string;
  duration?: string;
  score?: number;
}

export const interviewsApi = {
  async list(params: { candidate_id?: string; status?: string } = {}, accessToken?: string): Promise<Interview[]> {
    const search = new URLSearchParams();
    if (params.candidate_id) search.append('candidate_id', params.candidate_id);
    if (params.status) search.append('status', params.status);
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<Interview[]>(`/api/interviews/${search.toString() ? `?${search.toString()}` : ''}`, { headers });
  },

  async getById(id: string, accessToken?: string): Promise<Interview> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<Interview>(`/api/interviews/${id}`, { headers });
  },

  async create(data: Omit<Interview, 'id'>, accessToken?: string): Promise<Interview> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.post<Interview>(`/api/interviews/`, data, { headers });
  },

  async update(id: string, data: Partial<Interview>, accessToken?: string): Promise<Interview> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.put<Interview>(`/api/interviews/${id}`, data, { headers });
  },

  async remove(id: string, accessToken?: string): Promise<void> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    await api.delete<void>(`/api/interviews/${id}`, { headers });
  },
};