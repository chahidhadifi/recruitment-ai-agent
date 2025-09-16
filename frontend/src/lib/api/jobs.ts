import { api } from '../api';
import { Job, JobApplication } from '@/types/job';

/**
 * Service API pour les offres d'emploi
 */
export const jobsApi = {
  /**
   * Récupère toutes les offres d'emploi
   */
  async getAll(): Promise<Job[]> {
    return api.get<Job[]>('/api/jobs/');
  },

  /**
   * Récupère une offre d'emploi par son ID
   */
  async getById(id: string): Promise<Job> {
    return api.get<Job>(`/api/jobs/${id}`);
  },

  /**
   * Crée une nouvelle offre d'emploi
   */
  async create(jobData: Omit<Job, 'id'>): Promise<Job> {
    return api.post<Job>('/api/jobs/', jobData);
  },

  /**
   * Met à jour une offre d'emploi existante
   */
  async update(id: string, jobData: Partial<Job>): Promise<Job> {
    return api.put<Job>(`/api/jobs/${id}`, jobData);
  },

  /**
   * Supprime une offre d'emploi
   */
  async delete(id: string): Promise<void> {
    return api.delete<void>(`/api/jobs/${id}`);
  },

  /**
   * Récupère toutes les candidatures pour une offre d'emploi
   */
  async getApplications(jobId: string): Promise<JobApplication[]> {
    return api.get<JobApplication[]>(`/api/applications?jobId=${jobId}`);
  },

  /**
   * Recherche des offres d'emploi selon des critères
   */
  async search(query: string, location?: string, type?: string): Promise<Job[]> {
    let endpoint = `/api/jobs/search?query=${encodeURIComponent(query)}`;
    
    if (location) {
      endpoint += `&location=${encodeURIComponent(location)}`;
    }
    
    if (type) {
      endpoint += `&type=${encodeURIComponent(type)}`;
    }
    
    return api.get<Job[]>(endpoint);
  }
};