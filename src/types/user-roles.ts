export type UserRole = 'admin' | 'recruteur' | 'candidat';

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
}

export const DEFAULT_ADMIN_USER: UserWithRole = {
  id: "admin-1",
  name: "Administrateur",
  email: "admin@example.com",
  image: "https://ui-avatars.com/api/?name=Administrateur&background=0D8ABC&color=fff",
  role: "admin"
};

export const DEFAULT_RECRUTEUR_USER: UserWithRole = {
  id: "recruteur-1",
  name: "Recruteur",
  email: "recruteur@example.com",
  image: "https://ui-avatars.com/api/?name=Recruteur&background=2E8B57&color=fff",
  role: "recruteur"
};

export const DEFAULT_CANDIDAT_USER: UserWithRole = {
  id: "candidat-1",
  name: "Candidat",
  email: "candidat@example.com",
  image: "https://ui-avatars.com/api/?name=Candidat&background=CD7F32&color=fff",
  role: "candidat"
};

// Définir les pages accessibles par rôle
export const ROLE_BASED_ROUTES: Record<UserRole, string[]> = {
  admin: ["/", "/dashboard", "/candidates", "/jobs", "/applications", "/settings", "/profile", "/help", "/about", "/users"],
  recruteur: ["/", "/dashboard", "/candidates", "/interviews", "/jobs", "/applications", "/reports", "/profile", "/settings", "/help", "/about"],
  candidat: ["/", "/profile", "/interviews/candidat", "/jobs", "/help", "/about"]
};