import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/main-layout";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="container flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-6">
          <FileQuestion className="h-16 w-16 text-primary" />
        </div>
        
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">Page non trouvée</h1>
        
        <p className="mb-8 max-w-md text-muted-foreground">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button asChild size="lg">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
          
          <Button variant="outline" asChild size="lg">
            <Link href="/help">Centre d'aide</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}