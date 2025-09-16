import { api } from '../api';

// Types pour les entretiens
export interface Interview {
  id: number;
  candidate_id: number;
  job_id: number;
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewCreate {
  candidate_id: number;
  job_id: number;
  scheduled_at: string;
  notes?: string;
}

export interface InterviewUpdate {
  scheduled_at?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

/**
 * Service API pour les entretiens
 */
export const interviewsApi = {
  /**
   * Récupère tous les entretiens
   */
  async getAll(): Promise<Interview[]> {
    return api.get<Interview[]>('/api/interviews/');
  },

  /**
   * Récupère un entretien par son ID
   */
  async getById(id: number): Promise<Interview> {
    return api.get<Interview>(`/api/interviews/${id}`);
  },

  /**
   * Crée un nouvel entretien
   */
  async create(interviewData: InterviewCreate): Promise<Interview> {
    return api.post<Interview>('/api/interviews/', interviewData);
  },

  /**
   * Met à jour un entretien existant
   */
  async update(id: number, interviewData: InterviewUpdate): Promise<Interview> {
    return api.put<Interview>(`/api/interviews/${id}`, interviewData);
  },

  /**
   * Récupère tous les entretiens d'un candidat
   */
  async getByCandidate(candidateId: number): Promise<Interview[]> {
    return api.get<Interview[]>(`/api/interviews?candidate_id=${candidateId}`);
  },

  /**
   * Récupère tous les entretiens pour une offre d'emploi
   */
  async getByJob(jobId: number): Promise<Interview[]> {
    return api.get<Interview[]>(`/api/interviews?job_id=${jobId}`);
  },

  /**
   * Annule un entretien
   */
  async cancel(id: number): Promise<Interview> {
    return api.patch<Interview>(`/api/interviews/${id}`, { status: 'cancelled' });
  },

  /**
   * Marque un entretien comme terminé
   */
  async complete(id: number, notes?: string): Promise<Interview> {
    return api.patch<Interview>(`/api/interviews/${id}`, { 
      status: 'completed',
      notes: notes
    });
  }
};