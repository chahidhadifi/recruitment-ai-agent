"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_ADMIN_USER, ROLE_BASED_ROUTES } from "@/types/user-roles";

// Liens essentiels pour les utilisateurs non connectés
const publicLinks = [
  { name: "Accueil", href: "/" },
  { name: "Offres d'emploi", href: "/jobs" },
  { name: "Aide", href: "/help" },
  { name: "Contact", href: "/contact" },
  { name: "À propos", href: "/about" },
];

// Navigation dynamique basée sur le rôle de l'utilisateur
const navigationItems = {
  admin: [
    { name: "Accueil", href: "/" },
    { name: "Tableau de bord", href: "/dashboard" },
    { name: "Candidats", href: "/candidates" },
    { name: "Offres d'emploi", href: "/jobs" },
    { name: "Utilisateurs", href: "/users" },
    { name: "Aide", href: "/help" },
  ],
  recruteur: [
    { name: "Accueil", href: "/" },
    { name: "Tableau de bord", href: "/dashboard" },
    { name: "Entretiens", href: "/interviews" },
    { name: "Offres d'emploi", href: "/jobs" },
    { name: "Aide", href: "/help" },
  ],
  candidat: [
    { name: "Accueil", href: "/" },
    { name: "Offres d'emploi", href: "/jobs" },
    { name: "Mes candidatures", href: "/jobs/my-applications" },
    { name: "Aide", href: "/help" },
  ],
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: realSession } = useSession();
  
  // Session fictive pour les tests avec rôle par défaut
  const mockSession = {
    user: {
      ...DEFAULT_ADMIN_USER,
      role: "admin"
    }
  };
  
  // Vérifier si l'utilisateur est authentifié avec une vraie session
  const isAuthenticated = !!realSession;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Utiliser la session fictive si aucune session réelle n'est disponible (pour le développement)
  const session = isAuthenticated ? realSession : null;
  
  // Obtenir la navigation en fonction de l'état d'authentification
  const navigation = isAuthenticated && session
    ? navigationItems[session.user.role as keyof typeof navigationItems || "candidat"]
    : publicLinks;
  
  // Vérifier si l'utilisateur a accès à la page actuelle
  useEffect(() => {
    // Ne vérifier l'accès que si l'utilisateur est authentifié
    if (isAuthenticated && session) {
      const userRoutes = ROLE_BASED_ROUTES[session.user.role as keyof typeof ROLE_BASED_ROUTES || "candidat"];
      const isAuthorized = userRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
      );
      
      if (!isAuthorized && pathname !== "/auth/login") {
        // Rediriger vers la page d'accueil si l'utilisateur n'a pas accès
        router.push("/");
      }
    }
  }, [pathname, router, session, isAuthenticated]);

  // Effet pour gérer les clics en dehors du menu déroulant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-background border-b relative z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-xl font-bold">AI Recruitment</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu principal</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-semibold leading-6",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <ThemeToggle />
          {session && session.user ? (
            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="flex items-center gap-2 text-sm focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {session.user.role === "admin" ? "Admin" : 
                     session.user.role === "recruteur" ? "Recruteur" : "Candidat"}
                  </span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg overflow-hidden z-10 transition-all duration-100 origin-top-right">
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-muted">
                        Mon profil
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-muted">
                        Paramètres
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="rounded-full">
                <Link href="/auth/login" aria-label="Connexion">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden",
          mobileMenuOpen ? "fixed inset-0 z-50" : "hidden"
        )}
      >
        <div className="fixed inset-0 bg-background/80" />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-xl font-bold">AI Recruitment</span>
            </Link>
            <Button
              variant="ghost"
              className="-m-2.5 rounded-md p-2.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Fermer le menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7",
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  {session && session.user ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {session.user.role === "admin" ? "Admin" : 
                           session.user.role === "recruteur" ? "Recruteur" : "Candidat"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/profile");
                          }}
                        >
                          Mon profil
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/settings");
                          }}
                        >
                          Paramètres
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            signOut({ callbackUrl: "/auth/login" });
                          }}
                        >
                          Déconnexion
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        asChild
                        variant="default"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/auth/login">Connexion</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}