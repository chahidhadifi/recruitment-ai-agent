import { UserWithRole } from "@/types/user-roles";
import { CreateUserData, UpdateUserData, UserFilters, UserStats } from "@/types/user";

// Données fictives pour la démonstration
const mockUsers: UserWithRole[] = [
  {
    id: "admin-1",
    name: "Administrateur Principal",
    email: "admin@example.com",
    image: "https://ui-avatars.com/api/?name=Administrateur&background=0D8ABC&color=fff",
    role: "admin"
  },
  {
    id: "recruteur-1",
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    image: "https://ui-avatars.com/api/?name=Sophie+Martin&background=2E8B57&color=fff",
    role: "recruteur"
  },
  {
    id: "recruteur-2",
    name: "Thomas Dubois",
    email: "thomas.dubois@example.com",
    image: "https://ui-avatars.com/api/?name=Thomas+Dubois&background=2E8B57&color=fff",
    role: "recruteur"
  },
  {
    id: "candidat-1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    image: "https://ui-avatars.com/api/?name=Jean+Dupont&background=CD7F32&color=fff",
    role: "candidat"
  },
  {
    id: "candidat-2",
    name: "Marie Lefebvre",
    email: "marie.lefebvre@example.com",
    image: "https://ui-avatars.com/api/?name=Marie+Lefebvre&background=CD7F32&color=fff",
    role: "candidat"
  },
  {
    id: "candidat-3",
    name: "Pierre Bernard",
    email: "pierre.bernard@example.com",
    image: "https://ui-avatars.com/api/?name=Pierre+Bernard&background=CD7F32&color=fff",
    role: "candidat"
  },
];

/**
 * Récupère tous les utilisateurs avec filtrage et tri optionnels
 * Utilise directement l'API backend au lieu de passer par l'API route Next.js
 */
export async function getUsers(filters?: UserFilters): Promise<UserWithRole[]> {
  try {
    // Construire l'URL avec les paramètres de requête
    let url = "http://localhost:8000/api/users/";
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.searchTerm) {
        params.append("search", filters.searchTerm); // Adapter le nom du paramètre pour le backend
      }
      
      if (filters.role) {
        params.append("role", filters.role);
      }
      
      if (filters.sortBy) {
        params.append("sort_by", filters.sortBy); // Adapter le nom du paramètre pour le backend
        if (filters.sortOrder) {
          params.append("sort_order", filters.sortOrder);
        }
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    // Envoyer la requête à l'API backend
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [];
  }
}

/**
 * Récupère un utilisateur par son ID
 * Utilise directement l'API backend au lieu de passer par l'API route Next.js
 */
export async function getUserById(id: string): Promise<UserWithRole | null> {
  try {
    const response = await fetch(`http://localhost:8000/api/users/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
}

/**
 * Crée un nouvel utilisateur
 * Utilise directement l'API backend au lieu de passer par l'API route Next.js
 */
export async function createUser(userData: CreateUserData): Promise<UserWithRole | null> {
  try {
    const response = await fetch("http://localhost:8000/api/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur lors de la création de l'utilisateur: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    throw error;
  }
}

/**
 * Met à jour un utilisateur existant
 * Utilise directement l'API backend au lieu de passer par l'API route Next.js
 */
export async function updateUser(id: string, userData: UpdateUserData): Promise<UserWithRole | null> {
  try {
    const response = await fetch(`http://localhost:8000/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur lors de la mise à jour de l'utilisateur: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
}

/**
 * Supprime un utilisateur
 * Utilise directement l'API backend au lieu de passer par l'API route Next.js
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8000/api/users/${id}`, {
      method: "DELETE"
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur lors de la suppression de l'utilisateur: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
}

/**
 * Récupère les statistiques des utilisateurs
 * Utilise directement l'API backend au lieu de passer par l'API route Next.js
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await fetch("http://localhost:8000/api/users-stats");
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    // Retourner des statistiques par défaut en cas d'erreur
    return {
      totalUsers: 0,
      adminCount: 0,
      recruiterCount: 0,
      candidateCount: 0,
      activeUsers: 0,
      inactiveUsers: 0
    };
  }
}