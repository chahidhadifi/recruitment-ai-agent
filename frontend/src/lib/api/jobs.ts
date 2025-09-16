import { api } from '../api';
import { Job, JobApplication } from '@/types/job';

/**
 * Service API pour les offres d'emploi (backend)
 */
export const jobsApi = {
  /**
   * Récupère toutes les offres d'emploi
   */
  async getAll(accessToken?: string): Promise<Job[]> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<Job[]>('/api/jobs/', { headers });
  },

  /**
   * Récupère une offre d'emploi par son ID
   */
  async getById(id: string, accessToken?: string): Promise<Job> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.get<Job>(`/api/jobs/${id}`, { headers });
  },

  /**
   * Crée une nouvelle offre d'emploi
   */
  async create(jobData: Omit<Job, 'id'>, accessToken?: string): Promise<Job> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.post<Job>('/api/jobs/', jobData, { headers });
  },

  /**
   * Met à jour une offre d'emploi existante
   */
  async update(id: string, jobData: Partial<Job>, accessToken?: string): Promise<Job> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return api.put<Job>(`/api/jobs/${id}`, jobData, { headers });
  },

  /**
   * Supprime une offre d'emploi
   */
  async delete(id: string, accessToken?: string): Promise<void> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    await api.delete<void>(`/api/jobs/${id}`, { headers });
  },

  /**
   * Récupère toutes les candidatures pour une offre d'emploi
   */
  async getApplications(jobId: string, accessToken?: string): Promise<JobApplication[]> {
    const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    // Backend attend /api/applications/?job_id=
    return api.get<JobApplication[]>(`/api/applications/?job_id=${encodeURIComponent(jobId)}`, { headers });
  },
};