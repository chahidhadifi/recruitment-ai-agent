"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Filter, Edit, Trash2, UserPlus } from "lucide-react";

import {MainLayout} from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Skeleton } from "@/components/ui/skeleton";
import { UserWithRole } from "@/types/user-roles";
import { getUsers, deleteUser } from "@/lib/api/users";
import { UserFilters } from "@/types/user";
import { toast } from "sonner";
import AddUserDialog from "@/components/users/AddUserDialog";
import EditUserDialog from "@/components/users/EditUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import { UserStats } from "@/components/user-stats";


export default function UsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filterRole, setFilterRole] = useState("all");
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserWithRole | null>(null);
  
  // Vérifier si l&apos;utilisateur est un administrateur
  const isAdmin = session?.user?.role === "admin";
  
  // Fonction pour charger les utilisateurs (mémorisée avec useCallback)
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: UserFilters = {};
      if (searchTerm) filters.searchTerm = searchTerm;
      if (filterRole !== "all") filters.role = filterRole as any;
      
      // Récupérer les données directement depuis l'API backend
      const data = await getUsers(filters);
      
      // Convertir les IDs numériques en chaînes de caractères si nécessaire
      const formattedUsers = data.map(user => ({
        ...user,
        id: user.id.toString()
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterRole]);
  
  // Charger les utilisateurs quand les filtres changent ou quand loadUsers change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  
  // Fonction pour ouvrir le dialogue de confirmation de suppression
  const openDeleteDialog = (user: UserWithRole) => {
    setUserToDelete(user);
  };

  // Fonction pour fermer le dialogue de confirmation de suppression
  const closeDeleteDialog = () => {
    setUserToDelete(null);
  };

  // Fonction pour ouvrir le dialogue d'édition
  const openEditDialog = (user: UserWithRole) => {
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  // Fonction pour fermer le dialogue d'édition
  const closeEditDialog = () => {
    setUserToEdit(null);
    setIsEditDialogOpen(false);
  };

  // Fonction pour ouvrir le dialogue d'ajout
  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  // Fonction pour fermer le dialogue d'ajout
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleteLoading(true);
    try {
      // Convertir l'ID en nombre si c'est une chaîne
      const userId = typeof userToDelete.id === 'string' ? parseInt(userToDelete.id) : userToDelete.id;
      
      const success = await deleteUser(userId);
      
      if (success) {
        // Mettre à jour la liste des utilisateurs
        setUsers(users.filter(user => user.id !== userToDelete.id));
        toast.success(`L'utilisateur ${userToDelete.name} a été supprimé`);
        closeDeleteDialog();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setIsDeleteLoading(false);
    }
  };
  
  // Rediriger si l&apos;utilisateur n&apos;est pas authentifié ou n&apos;est pas un administrateur
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
  
  // Utilisateurs filtrés (déjà filtrés par l&apos;API)
  const filteredUsers = users;

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <Button onClick={openAddDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>
        
        {/* Statistiques des utilisateurs */}
        <UserStats />

        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateurs</option>
                  <option value="recruteur">Recruteurs</option>
                  <option value="candidat">Candidats</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <p>Chargement des utilisateurs...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                      Rôle
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.length > 0 
                    ? filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-muted/50"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full" src={user.image} alt="" />
                            </div>
                            <div className="ml-4">
                              <div 
                                className="text-sm font-medium hover:text-primary hover:underline cursor-pointer"
                                onClick={() => router.push(`/users/${user.id}`)}
                              >
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {user.email}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                : user.role === "recruteur"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            }`}
                          >
                            {user.role === "admin" ? "Administrateur" : user.role === "recruteur" ? "Recruteur" : "Candidat"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="inline-flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Modifier</span>
                            </Button>
                            {user.id !== session?.user?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(user)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                    : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          Aucun utilisateur trouvé avec les critères sélectionnés.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Dialogue de confirmation de suppression */}
        {userToDelete && (
          <DeleteUserDialog
            isOpen={!!userToDelete}
            userName={userToDelete.name}
            onClose={closeDeleteDialog}
            onConfirm={handleDeleteUser}
            isDeleting={isDeleteLoading}
          />
        )}
        
        {/* Dialogue d'ajout d'utilisateur */}
        <AddUserDialog
          isOpen={isAddDialogOpen}
          onClose={closeAddDialog}
          onUserAdded={loadUsers}
        />
        
        {/* Dialogue d'édition d'utilisateur */}
        {userToEdit && (
          <EditUserDialog
            isOpen={isEditDialogOpen}
            user={userToEdit}
            onClose={closeEditDialog}
            onUserUpdated={loadUsers}
          />
        )}
      </div>
    </MainLayout>
  );
}