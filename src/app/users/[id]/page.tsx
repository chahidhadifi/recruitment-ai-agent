"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Edit, Trash2, Mail, User, Calendar, Shield } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { DeleteUserDialog } from "@/components/delete-user-dialog";
import { UserWithRole } from "@/types/user-roles";
import { getUserById, deleteUser } from "@/lib/api/users";



// Données fictives supplémentaires pour les détails de l'utilisateur
const mockUserDetails = {
  "admin-1": {
    dateCreated: "2023-01-15",
    lastLogin: "2023-06-10T14:30:00",
    status: "actif",
  },
  "recruteur-1": {
    dateCreated: "2023-02-20",
    lastLogin: "2023-06-09T10:15:00",
    status: "actif",
    department: "Ressources Humaines",
    specialization: "Développement informatique",
  },
  "recruteur-2": {
    dateCreated: "2023-03-05",
    lastLogin: "2023-06-08T16:45:00",
    status: "actif",
    department: "Ressources Humaines",
    specialization: "Marketing et Communication",
  },
  "candidat-1": {
    dateCreated: "2023-04-10",
    lastLogin: "2023-06-07T09:20:00",
    status: "actif",
    appliedJobs: 3,
    completedInterviews: 2,
    averageScore: 78,
  },
  "candidat-2": {
    dateCreated: "2023-05-15",
    lastLogin: "2023-06-06T11:30:00",
    status: "actif",
    appliedJobs: 2,
    completedInterviews: 1,
    averageScore: 85,
  },
  "candidat-3": {
    dateCreated: "2023-05-25",
    lastLogin: "2023-06-05T14:10:00",
    status: "actif",
    appliedJobs: 1,
    completedInterviews: 0,
    averageScore: null,
  },
};

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserWithRole | undefined>(undefined);
  const [userDetails, setUserDetails] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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
        const details = mockUserDetails[params.id as keyof typeof mockUserDetails];
        
        if (foundUser) {
          setUser(foundUser);
          setUserDetails(details);
        } else {
          // Utilisateur non trouvé
          router.push("/users");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [params.id, router]);

  const handleDeleteUser = async () => {
    try {
      if (!user) return;
      
      // Supprimer l'utilisateur via l'API
      const success = await deleteUser(user.id);
      
      if (success) {
        // Rediriger vers la liste des utilisateurs
        router.push("/users");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
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

  // Formater la date de dernière connexion
  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
        
        {user && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="h-20 w-20 mr-6">
                  <img 
                    src={user.image} 
                    alt={user.name} 
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                          : user.role === "recruteur"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {user.role === "admin" ? "Administrateur" : user.role === "recruteur" ? "Recruteur" : "Candidat"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/users/${user.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                {user.id !== session?.user?.id && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nom complet</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rôle</p>
                      <p className="font-medium">
                        {user.role === "admin" ? "Administrateur" : user.role === "recruteur" ? "Recruteur" : "Candidat"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date de création du compte</p>
                      <p className="font-medium">{userDetails?.dateCreated || "Non disponible"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Activité</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Dernière connexion</p>
                    <p className="font-medium">
                      {userDetails?.lastLogin ? formatLastLogin(userDetails.lastLogin) : "Jamais connecté"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className="font-medium capitalize">{userDetails?.status || "Non disponible"}</p>
                  </div>
                  
                  {user.role === "recruteur" && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Département</p>
                        <p className="font-medium">{userDetails?.department || "Non spécifié"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Spécialisation</p>
                        <p className="font-medium">{userDetails?.specialization || "Non spécifiée"}</p>
                      </div>
                    </>
                  )}
                  
                  {user.role === "candidat" && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Offres postulées</p>
                        <p className="font-medium">{userDetails?.appliedJobs || 0}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Entretiens complétés</p>
                        <p className="font-medium">{userDetails?.completedInterviews || 0}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Score moyen</p>
                        <p className="font-medium">
                          {userDetails?.averageScore !== null && userDetails?.averageScore !== undefined
                            ? `${userDetails.averageScore}/100`
                            : "Aucun entretien complété"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Dialogue de confirmation de suppression */}
        {user && (
          <DeleteUserDialog
            isOpen={showDeleteDialog}
            userName={user.name}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={handleDeleteUser}
          />
        )}
      </div>
    </MainLayout>
  );
}