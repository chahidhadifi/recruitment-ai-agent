/**
 * Service API central pour gérer toutes les requêtes vers le backend
 */

// URL de base de l'API, configurée dans les variables d'environnement
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Options par défaut pour les requêtes fetch
 */
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Classe d'erreur personnalisée pour les erreurs d'API
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Fonction utilitaire pour vérifier la réponse HTTP
 */
async function checkResponse(response: Response) {
  if (!response.ok) {
    let body: any = undefined;
    let message = `Erreur ${response.status}`;
    try {
      body = await response.json();
      if (body && (body.detail || body.error)) {
        message = body.detail || body.error;
      }
    } catch {
      try {
        const text = await response.text();
        body = { detail: text };
        if (text) message = text.slice(0, 300);
      } catch {
        body = { detail: 'Réponse illisible du serveur' };
      }
    }
    throw new ApiError(response.status, message, body);
  }
  return response;
}

/**
 * Service API principal
 */
export const api = {
  /**
   * Effectue une requête GET
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...(defaultOptions.headers || {}), ...(options.headers || {}) },
      method: 'GET',
    });
    await checkResponse(response);
    return response.json();
  },

  /**
   * Effectue une requête POST
   */
  async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...(defaultOptions.headers || {}), ...(options.headers || {}) },
      method: 'POST',
      body: JSON.stringify(data),
    });
    await checkResponse(response);
    return response.json();
  },

  /**
   * Effectue une requête PUT
   */
  async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...(defaultOptions.headers || {}), ...(options.headers || {}) },
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await checkResponse(response);
    return response.json();
  },

  /**
   * Effectue une requête PATCH
   */
  async patch<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...(defaultOptions.headers || {}), ...(options.headers || {}) },
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    await checkResponse(response);
    return response.json();
  },

  /**
   * Effectue une requête DELETE
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...(defaultOptions.headers || {}), ...(options.headers || {}) },
      method: 'DELETE',
    });
    await checkResponse(response);
    return response.json();
  },
};