import { api } from '../api';
import { JobApplication } from '@/types/job';

export const applicationsApi = {
  async list(params: { job_id?: string; candidate_id?: string; status?: string } = {}, accessToken?: string): Promise<JobApplication[]> {
    const search = new URLSearchParams();
    if (params.job_id) search.append('job_id', params.job_id);
    if (params.candidate_id) search.append('candidate_id', params.candidate_id);
    if (params.status) search.append('status', params.status);
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<JobApplication[]>(`/api/applications/${search.toString() ? `?${search.toString()}` : ''}`, { headers });
  },

  async getById(id: string, accessToken?: string): Promise<JobApplication> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<JobApplication>(`/api/applications/${id}`, { headers });
  },

  async create(data: Omit<JobApplication, 'id' | 'status' | 'applied_at'>, accessToken?: string): Promise<JobApplication> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.post<JobApplication>(`/api/applications/`, data, { headers });
  },

  async update(id: string, data: Partial<JobApplication>, accessToken?: string): Promise<JobApplication> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.put<JobApplication>(`/api/applications/${id}`, data, { headers });
  },

  async remove(id: string, accessToken?: string): Promise<void> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    await api.delete<void>(`/api/applications/${id}`, { headers });
  },
};