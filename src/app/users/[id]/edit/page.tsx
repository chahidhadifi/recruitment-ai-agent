"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/user-form";
import { UserWithRole } from "@/types/user-roles";
import { getUserById, updateUser } from "@/lib/api/users";
import { UpdateUserData } from "@/types/user";



export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserWithRole | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
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

  // Charger les données de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const foundUser = await getUserById(params.id);
        
        if (foundUser) {
          setUser(foundUser);
        } else {
          // Utilisateur non trouvé
          router.push("/users");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l&apos;utilisateur:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [params.id, router]);

  const handleSubmit = async (userData: Partial<UserWithRole>) => {
    setIsSubmitting(true);
    
    try {
      if (!user) return;
      
      // Mettre à jour l'utilisateur via l'API
      const updateUserData: UpdateUserData = {
        name: userData.name,
        email: userData.email,
        role: userData.role as "admin" | "recruteur" | "candidat"
      };
      
      await updateUser(user.id, updateUserData);
      
      // Rediriger vers la liste des utilisateurs
      router.push("/users");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l&apos;utilisateur:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user && !isLoading) {
    return (
      <MainLayout>
        <div className="container py-10">
          <p>Utilisateur non trouvé.</p>
          <Button
            className="mt-4"
            onClick={() => router.push("/users")}
          >
            Retour à la liste
          </Button>
        </div>
      </MainLayout>
    );
  }

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
          <h1 className="text-3xl font-bold mb-6">Modifier l&apos;utilisateur</h1>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            {user && (
              <UserForm 
                user={user}
                onSubmit={handleSubmit} 
                onCancel={() => router.push("/users")} 
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}