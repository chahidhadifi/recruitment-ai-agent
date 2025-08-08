import { UserWithRole } from "./user-roles";

// Interface pour les détails supplémentaires d'un utilisateur
export interface UserDetails {
  dateCreated: string;
  lastLogin: string | null;
  status: "actif" | "inactif" | "suspendu";
}

// Interface pour les détails spécifiques d'un recruteur
export interface RecruiterDetails extends UserDetails {
  department?: string;
  specialization?: string;
  assignedCandidates?: number;
  completedInterviews?: number;
}

// Interface pour les détails spécifiques d'un candidat
export interface CandidateDetails extends UserDetails {
  appliedJobs?: number;
  completedInterviews?: number;
  averageScore?: number | null;
  skills?: string[];
  preferredPositions?: string[];
}

// Interface pour les données de création d'un utilisateur
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "recruteur" | "candidat";
}

// Interface pour les données de mise à jour d'un utilisateur
export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: "admin" | "recruteur" | "candidat";
  status?: "actif" | "inactif" | "suspendu";
  department?: string; // Pour les recruteurs
  specialization?: string; // Pour les recruteurs
}

// Type pour les statistiques des utilisateurs
export interface UserStats {
  totalUsers: number;
  adminCount: number;
  recruiterCount: number;
  candidateCount: number;
  activeUsers: number;
  inactiveUsers: number;
}

// Type pour les filtres de recherche d'utilisateurs
export interface UserFilters {
  searchTerm?: string;
  role?: "admin" | "recruteur" | "candidat" | "all";
  status?: "actif" | "inactif" | "suspendu" | "all";
  sortBy?: "name" | "email" | "role" | "dateCreated" | "lastLogin";
  sortOrder?: "asc" | "desc";
}