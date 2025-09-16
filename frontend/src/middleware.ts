import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { ROLE_BASED_ROUTES, UserRole } from "./types/user-roles";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Définir les chemins qui sont considérés comme publics (authentification)
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
  ];
  
  // Permettre l'accès à la page d'inscription
  // Commenté pour permettre l'inscription
  // if (path === "/auth/register") {
  //   return NextResponse.redirect(new URL("/auth/login", req.url));
  // }

  // Vérifier si le chemin demandé est public (authentification)
  const isPublicPath = publicPaths.some((publicPath) =>
    path.startsWith(publicPath)
  );

  // Vérifier si l'utilisateur est authentifié
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

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
  
  // Définir les chemins qui nécessitent des rôles spécifiques
  const recruiterOnlyPaths = [
    "/jobs/new"
  ];
  
  const adminOnlyPaths = [
    "/candidates"
  ];

  // Vérifier si le chemin demandé est accessible sans authentification
  const isPublicAccessPath = publicAccessPaths.some((publicPath) =>
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // Définir explicitement toutes les routes protégées qui nécessitent une authentification
  const protectedPaths = [
    "/dashboard",
    "/interviews",
    "/applications",
    "/profile",
    "/settings",
    "/reports",
    "/users"
  ];
  
  // Vérifier si le chemin est une route protégée
  const isProtectedPath = protectedPaths.some((protectedPath) =>
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  // Vérifier si le chemin est réservé aux recruteurs
  const isRecruiterOnlyPath = recruiterOnlyPaths.some((recruiterPath) =>
    path === recruiterPath || path.startsWith(`${recruiterPath}/`)
  );

  // Vérifier si le chemin est réservé aux administrateurs
  const isAdminOnlyPath = adminOnlyPaths.some((adminPath) =>
    path === adminPath || path.startsWith(`${adminPath}/`)
  );

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié et tente d'accéder à une route protégée
  if (!token && isProtectedPath) {
    // Redirection forcée vers la page de connexion pour les routes protégées
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  
  // Rediriger vers la page de connexion pour les autres routes non publiques
  if (!token && !isPublicPath && !isPublicAccessPath) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Rediriger vers la page d'accueil si l'utilisateur est authentifié et tente d'accéder à une route publique
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  // Vérifier les autorisations basées sur le rôle
  if (token && token.role) {
    const userRole = token.role as UserRole;
    
    // Vérifier les restrictions spécifiques aux rôles
    if (isRecruiterOnlyPath && userRole !== 'recruteur' && userRole !== 'admin') {
      // Rediriger vers la page d'accueil si l'utilisateur n'est pas recruteur ou admin
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    if (isAdminOnlyPath && userRole !== 'admin') {
      // Rediriger vers la page d'accueil si l'utilisateur n'est pas admin
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    // Vérifier les autorisations générales basées sur le rôle
    const allowedRoutes = ROLE_BASED_ROUTES[userRole] || [];
    const hasAccess = allowedRoutes.some(route => path === route || path.startsWith(`${route}/`));
    
    if (!hasAccess) {
      // Rediriger vers la page d'accueil si l'utilisateur n'a pas accès à cette route
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

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
    // Assurer que ces routes spécifiques sont toujours protégées
    "/dashboard/:path*",
    "/interviews/:path*",
    "/applications/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/reports/:path*",
    "/users/:path*"
  ],
};