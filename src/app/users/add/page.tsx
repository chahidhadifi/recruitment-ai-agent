"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/user-form";
import { UserWithRole } from "@/types/user-roles";
import { createUser } from "@/lib/api/users";
import { CreateUserData } from "@/types/user";

export default function AddUserPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = session?.user?.role === "admin";
  
  // Rediriger si l'utilisateur n'est pas authentifié ou n'est pas un administrateur
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="container py-10 flex justify-center items-center">
          <p>Chargement...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }
  
  if (session && !isAdmin) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (userData: Partial<UserWithRole>) => {
    setIsSubmitting(true);
    
    try {
      // Créer l'utilisateur via l'API
      const createUserData: CreateUserData = {
        name: userData.name || "",
        email: userData.email || "",
        password: userData.password || "", // Dans une application réelle, cela serait géré de manière sécurisée
        role: userData.role as "admin" | "recruteur" | "candidat" || "candidat"
      };
      
      await createUser(createUserData);
      
      // Rediriger vers la liste des utilisateurs
      router.push("/users");
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/users")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Ajouter un utilisateur</h1>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            <UserForm 
              onSubmit={handleSubmit} 
              onCancel={() => router.push("/users")} 
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}