import { api } from '../api';
import { JobApplication } from '@/types/job';

/**
 * Service API pour les candidatures
 */
export const applicationsApi = {
  /**
   * Récupère toutes les candidatures
   */
  async getAll(): Promise<JobApplication[]> {
    return api.get<JobApplication[]>('/api/applications/');
  },

  /**
   * Récupère une candidature par son ID
   */
  async getById(id: string): Promise<JobApplication> {
    return api.get<JobApplication>(`/api/applications/${id}`);
  },

  /**
   * Crée une nouvelle candidature
   */
  async create(applicationData: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt'>): Promise<JobApplication> {
    return api.post<JobApplication>('/api/applications/', applicationData);
  },

  /**
   * Met à jour une candidature existante
   */
  async update(id: string, applicationData: Partial<JobApplication>): Promise<JobApplication> {
    return api.put<JobApplication>(`/api/applications/${id}`, applicationData);
  },

  /**
   * Supprime une candidature
   */
  async delete(id: string): Promise<void> {
    return api.delete<void>(`/api/applications/${id}`);
  },

  /**
   * Récupère toutes les candidatures d'un candidat
   */
  async getByCandidate(candidateId: string): Promise<JobApplication[]> {
    return api.get<JobApplication[]>(`/api/applications?candidateId=${candidateId}`);
  },

  /**
   * Change le statut d'une candidature
   */
  async updateStatus(id: string, status: JobApplication['status']): Promise<JobApplication> {
    return api.patch<JobApplication>(`/api/applications/${id}/status`, { status });
  }
};