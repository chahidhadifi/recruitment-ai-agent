"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/main-layout";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Vous pourriez envoyer l'erreur à un service de suivi des erreurs ici
    console.error(error);
  }, [error]);

  return (
    <MainLayout>
      <div className="container flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 rounded-full bg-destructive/10 p-6">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">Une erreur est survenue</h1>
        
        <p className="mb-2 max-w-md text-muted-foreground">
          Désolé, quelque chose s'est mal passé lors du traitement de votre demande.
        </p>
        
        {error.message && process.env.NODE_ENV === "development" && (
          <p className="mb-8 max-w-md rounded-md bg-muted p-4 font-mono text-sm">
            {error.message}
          </p>
        )}
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button onClick={reset} size="lg">
            Réessayer
          </Button>
          
          <Button variant="outline" asChild size="lg">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}