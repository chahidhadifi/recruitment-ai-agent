"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // Liste des chemins protégés
  const protectedPaths = [
    "/dashboard",
    "/interviews",
    "/candidature",
    "/applications",
    "/profile",
    "/settings",
    "/reports",
    "/users"
  ];
  
  // Vérifier si le chemin actuel est protégé
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname?.startsWith(`${path}/`)
  );
  
  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié et tente d'accéder à une route protégée
    if (status === "unauthenticated" && isProtectedPath) {
      router.replace("/auth/login");
    }
  }, [status, isProtectedPath, router]);
  
  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (status === "loading" || (status === "unauthenticated" && isProtectedPath)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}