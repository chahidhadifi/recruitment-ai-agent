import { api } from '../api';

// Types pour les questions
export interface Question {
  id: number;
  interview_id: number;
  content: string;
  answer?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionCreate {
  interview_id: number;
  content: string;
}

export interface QuestionUpdate {
  content?: string;
  answer?: string;
}

/**
 * Service API pour les questions d'entretien
 */
export const questionsApi = {
  /**
   * Récupère toutes les questions d'un entretien
   */
  async getByInterview(interviewId: number): Promise<Question[]> {
    return api.get<Question[]>(`/api/questions?interview_id=${interviewId}`);
  },

  /**
   * Récupère une question par son ID
   */
  async getById(id: number): Promise<Question> {
    return api.get<Question>(`/api/questions/${id}`);
  },

  /**
   * Crée une nouvelle question
   */
  async create(questionData: QuestionCreate): Promise<Question> {
    return api.post<Question>('/api/questions/', questionData);
  },

  /**
   * Met à jour une question existante
   */
  async update(id: number, questionData: QuestionUpdate): Promise<Question> {
    return api.put<Question>(`/api/questions/${id}`, questionData);
  },

  /**
   * Supprime une question
   */
  async delete(id: number): Promise<void> {
    return api.delete<void>(`/api/questions/${id}`);
  },

  /**
   * Ajoute une réponse à une question
   */
  async addAnswer(id: number, answer: string): Promise<Question> {
    return api.patch<Question>(`/api/questions/${id}/answer`, { answer });
  }
};