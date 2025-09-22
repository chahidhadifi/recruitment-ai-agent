import { getSession } from 'next-auth/react';

// Configuration de base de l'API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Service API centralisé pour gérer les appels HTTP
 */
export class ApiService {
  /**
   * Effectue une requête HTTP avec authentification
   */
  static async request(endpoint: string, options: RequestInit = {}) {
    const session = await getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Ajouter le token d'authentification si disponible
    if (session?.user?.accessToken) {
      headers['Authorization'] = `Bearer ${session.user.accessToken}`;
    }

    const url = `${BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          errorData.error || 
          `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Méthode GET
   */
  static async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * Méthode POST
   */
  static async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Méthode PUT
   */
  static async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Méthode PATCH
   */
  static async patch(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Méthode DELETE
   */
  static async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default ApiService;