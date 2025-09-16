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
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { detail: 'Une erreur inconnue est survenue' };
    }
    throw new ApiError(
      response.status,
      errorData.detail || `Erreur ${response.status}`,
      errorData
    );
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
      ...defaultOptions,
      ...options,
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
      ...defaultOptions,
      ...options,
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
      ...defaultOptions,
      ...options,
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
      ...defaultOptions,
      ...options,
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
      ...defaultOptions,
      ...options,
      method: 'DELETE',
    });
    await checkResponse(response);
    return response.json();
  },
};