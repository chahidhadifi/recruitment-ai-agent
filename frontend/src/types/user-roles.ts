export type UserRole = 'candidat' | 'recruteur' | 'admin';

// Utilisateurs par défaut pour les tests
export const DEFAULT_ADMIN_USER = {
  id: '1',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin' as UserRole,
  name: 'Administrateur',
  image: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff'
};

export const DEFAULT_RECRUTEUR_USER = {
  id: '2',
  email: 'recruteur@example.com',
  password: 'recruteur123',
  role: 'recruteur' as UserRole,
  name: 'Recruteur Test',
  image: 'https://ui-avatars.com/api/?name=Recruteur&background=3b82f6&color=fff'
};

export const DEFAULT_CANDIDAT_USER = {
  id: '3',
  email: 'candidat@example.com',
  password: 'candidat123',
  role: 'candidat' as UserRole,
  name: 'Candidat Test',
  image: 'https://ui-avatars.com/api/?name=Candidat&background=10b981&color=fff'
};

export const ROLE_BASED_ROUTES: Record<UserRole, string[]> = {
  candidat: [
    '/jobs',
    '/jobs/my-applications',
    '/jobs/applications', // Pour voir les détails des candidatures
    '/interviews/new', // Candidats peuvent passer des entretiens
    '/profile',
    '/dashboard'
  ],
  recruteur: [
    '/jobs',
    '/jobs/new',
    '/jobs/applications', // Pour voir les candidatures
    '/candidates', // Recruteurs peuvent voir les candidats
    '/interviews', // Recruteurs peuvent gérer les entretiens
    '/interviews/new', // Recruteurs peuvent créer des entretiens
    '/interviews/candidat', // Recruteurs peuvent créer des entretiens
    '/dashboard',
    '/profile'
  ],
  admin: [
    '/jobs',
    '/jobs/new',
    '/jobs/applications',
    '/candidates',
    '/interviews',
    '/interviews/new',
    '/interviews/candidat',
    '/admin',
    '/dashboard',
    '/profile',
    '/users' // Gestion des utilisateurs pour les admins
  ]
};

// Fonction utilitaire pour vérifier si un utilisateur peut accéder à une route
export function canAccessRoute(userRole: UserRole, path: string): boolean {
  const allowedRoutes = ROLE_BASED_ROUTES[userRole] || [];
  return allowedRoutes.some(route => path === route || path.startsWith(`${route}/`));
}

// Fonction pour obtenir les routes par défaut selon le rôle
export function getDefaultRouteForRole(userRole: UserRole): string {
  switch (userRole) {
    case 'candidat':
      return '/jobs';
    case 'recruteur':
      return '/candidates';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}