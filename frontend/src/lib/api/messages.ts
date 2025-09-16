import { api } from '../api';

// Types pour les messages
export interface Message {
  id: number;
  interview_id: number;
  content: string;
  sender_type: 'system' | 'candidate' | 'interviewer';
  created_at: string;
}

export interface MessageCreate {
  interview_id: number;
  content: string;
  sender_type: 'system' | 'candidate' | 'interviewer';
}

export interface MessageUpdate {
  content?: string;
}

/**
 * Service API pour les messages d'entretien
 */
export const messagesApi = {
  /**
   * Récupère tous les messages d'un entretien
   */
  async getByInterview(interviewId: number): Promise<Message[]> {
    return api.get<Message[]>(`/api/messages?interview_id=${interviewId}`);
  },

  /**
   * Récupère un message par son ID
   */
  async getById(id: number): Promise<Message> {
    return api.get<Message>(`/api/messages/${id}`);
  },

  /**
   * Crée un nouveau message
   */
  async create(messageData: MessageCreate): Promise<Message> {
    return api.post<Message>('/api/messages/', messageData);
  },

  /**
   * Met à jour un message existant
   */
  async update(id: number, messageData: MessageUpdate): Promise<Message> {
    return api.put<Message>(`/api/messages/${id}`, messageData);
  },

  /**
   * Supprime un message
   */
  async delete(id: number): Promise<void> {
    return api.delete<void>(`/api/messages/${id}`);
  }
};