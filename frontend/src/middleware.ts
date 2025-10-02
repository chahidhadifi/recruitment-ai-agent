import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { ROLE_BASED_ROUTES, UserRole } from "./types/user-roles";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log('🔍 Middleware - Path:', path, 'Full URL:', req.url);
 
  // Exclure les fichiers statiques et assets
  const staticPaths = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/public',
    '/static',
    '/images',
    '/models',
    '/.well-known',
  ];
  
  // Exclure les fichiers avec extensions (images, modèles 3D, etc.)
  const fileExtensions = ['.glb', '.gltf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.mp4', '.webm'];
  const isStaticFile = fileExtensions.some(ext => path.toLowerCase().endsWith(ext));
  const isStaticPath = staticPaths.some(staticPath => path.startsWith(staticPath));
  
  if (isStaticFile || isStaticPath) {
    console.log('📁 Fichier statique détecté, pas de middleware');
    return NextResponse.next();
  }
 
  // Définir les chemins qui sont considérés comme publics
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
  ];
 
  // Vérifier si le chemin demandé est public
  const isPublicPath = publicPaths.some((publicPath) =>
    path.startsWith(publicPath)
  );

  // Vérifier si l'utilisateur est authentifié
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('👤 Token présent:', !!token, 'Rôle:', token?.role);

  // Définir les chemins qui sont accessibles sans authentification
  const publicAccessPaths = [
    "/",
    "/jobs",
    "/help",
    "/privacy",
    "/terms",
    "/contact",
    "/about"
  ];
 
  // Vérifier si le chemin demandé est accessible sans authentification
  const isPublicAccessPath = publicAccessPaths.some((publicPath) =>
    path === publicPath || path.startsWith(`${publicPath}/`)
  );

  console.log('🔓 Is public path:', isPublicPath, 'Is public access path:', isPublicAccessPath);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié et tente d'accéder à une route protégée
  if (!token && !isPublicPath && !isPublicAccessPath) {
    console.log('❌ Redirection vers login - pas de token');
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Rediriger vers la page d'accueil si l'utilisateur est authentifié et tente d'accéder à une route publique
  if (token && isPublicPath) {
    console.log('🏠 Redirection vers home - utilisateur connecté sur page publique');
    return NextResponse.redirect(new URL("/", req.url));
  }
 
  // Vérifier les autorisations basées sur le rôle
  if (token && token.role) {
    const userRole = token.role as UserRole;
    console.log('🎭 Vérification du rôle:', userRole, 'pour le chemin:', path);
   
    // Chemins spécifiques pour les entretiens
    const interviewPaths = ['/interviews', '/interviews/new', '/interviews/candidat'];
    const isInterviewPath = interviewPaths.some(interviewPath => 
      path === interviewPath || path.startsWith(`${interviewPath}/`)
    );

    // Vérifier les accès spécifiques pour les entretiens
    if (isInterviewPath) {
      console.log('🎤 Chemin d\'entretien détecté');
      
      let hasInterviewAccess = false;
      
      switch (userRole) {
        case 'admin':
          hasInterviewAccess = true;
          break;
        case 'recruteur':
          hasInterviewAccess = true;
          break;
        case 'candidat':
          // Les candidats peuvent seulement accéder à /interviews/new
          hasInterviewAccess = path === '/interviews/new' || path.startsWith('/interviews/new');
          break;
      }

      if (!hasInterviewAccess) {
        console.log('❌ Accès refusé aux entretiens pour le rôle:', userRole);
        return NextResponse.redirect(new URL("/", req.url));
      }

      console.log('✅ Accès autorisé aux entretiens pour le rôle:', userRole);
      return NextResponse.next();
    }

    // Pour les autres chemins non-publics, vérifier ROLE_BASED_ROUTES
    if (!isPublicAccessPath) {
      const allowedRoutes = ROLE_BASED_ROUTES[userRole] || [];
      const hasAccess = allowedRoutes.some(route => 
        path === route || path.startsWith(`${route}/`)
      );

      console.log('📋 Routes autorisées:', allowedRoutes);
      console.log('✅ Accès autorisé:', hasAccess);

      if (!hasAccess) {
        console.log('❌ Accès refusé pour le rôle:', userRole, 'sur le chemin:', path);
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  console.log('✅ Middleware - Accès autorisé');
  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};