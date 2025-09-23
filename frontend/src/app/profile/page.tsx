"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Save, User, Mail, Building, Briefcase, Camera, Upload, Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { UserWithRole, UserRole } from "@/types/user-roles";
import { getUsers, updateUser, deleteUser } from "@/lib/api/users";

// Interface pour les applications
interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  // Utiliser uniquement la session réelle
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  // Rediriger vers la page de connexion uniquement si le chargement est terminé et l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push('/auth/login');
    }
  }, [status, router]);

  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    company: "AI Recruitment Inc.",
    role: session?.user?.role === "candidat" ? "Candidat" : "Recruteur",
    bio: "",
    first_name: "",
    last_name: "",
    cnie: "",
    nationality: "",
    phone: "",
    city: "",
    address: "",
    image: "",
    cv_url: "",
    cover_letter_url: "",
  });
  
  // États pour la gestion des utilisateurs
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  useEffect(() => {
    if (!session?.user?.accessToken) return;
    const fetchUserData = async () => {
      try {
        const response = await api.get('/api/users/me/', {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });
        const userData = response as any;
        const candidateProfile = userData.candidate_profile || {};
        setProfileForm(prev => ({
          ...prev,
          name: userData.name || prev.name,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          cnie: userData.cnie || "",
          nationality: userData.nationality || "Marocaine",
          phone: userData.phone || "",
          city: userData.city || "",
          address: userData.address || "",
          bio: candidateProfile.biography || prev.bio,
          cv_url: candidateProfile.cv_url || "",
          cover_letter_url: candidateProfile.cover_letter_url || "",
          role: userData.role === "candidat" ? "Candidat" : "Recruteur"
        }));
        if (userData.applications) {
          setApplications(userData.applications);
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des données utilisateur", error);
        toast({
          title: "Erreur API",
          description: error?.data?.detail || error?.message || `Erreur API (code: ${error?.status})`,
          variant: "destructive",
        });
      }
    };
    fetchUserData();
    
    // Charger les utilisateurs si l'utilisateur est admin ou recruteur
    if (session?.user?.role === "admin" || session?.user?.role === "recruteur") {
      loadUsers();
    }
  }, [session]);
  
  // Fonction pour charger les utilisateurs
  const loadUsers = async () => {
    if (session?.user?.role !== "admin" && session?.user?.role !== "recruteur") return;
    
    setIsLoadingUsers(true);
    try {
      const usersData = await getUsers({ searchTerm, role: filterRole !== "all" ? filterRole : undefined });
      setUsers(usersData);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Fonction pour mettre à jour le rôle d'un utilisateur
  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateUser(userId, { role: newRole });
      
      // Mettre à jour la liste locale
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été modifié avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle de l'utilisateur",
        variant: "destructive",
      });
    }
  };
  
  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const success = await deleteUser(userToDelete.id);
      
      if (success) {
        // Mettre à jour la liste des utilisateurs
        setUsers(users.filter(user => user.id !== userToDelete.id));
        toast({
          title: "Utilisateur supprimé",
          description: "L'utilisateur a été supprimé avec succès",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  setProfileForm((prev: typeof profileForm) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    
    try {
      // Préparer les données pour le backend
      const userData = {
        name: profileForm.name,
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        cnie: profileForm.cnie,
        nationality: profileForm.nationality,
        phone: profileForm.phone,
        city: profileForm.city,
        address: profileForm.address,
        // Les données spécifiques au profil candidat
        biography: profileForm.bio,
        cv_url: profileForm.cv_url,
        cover_letter_url: profileForm.cover_letter_url,
      };
      
      console.log('Données à envoyer:', userData);
      
      // Envoyer les données au backend
      await api.put('/api/users/me/', userData, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });
      
      // Mise à jour de la session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profileForm.name,
        },
      });
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations de profil ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour gérer l'upload de fichiers (CV, lettre de motivation, photo)  
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
  const file = event.target.files?.[0];
  if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType);
    
    try {
      setIsUploading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload du fichier');
      }
      
      const data = await response.json();
      
      // Mettre à jour le formulaire avec l'URL du fichier uploadé
      if (fileType === 'cv') {
  setProfileForm((prev: typeof profileForm) => ({ ...prev, cv_url: data.fileUrl }));
      } else if (fileType === 'cover_letter') {
  setProfileForm((prev: typeof profileForm) => ({ ...prev, cover_letter_url: data.fileUrl }));
      } else if (fileType === 'profile_image') {
  setProfileForm((prev: typeof profileForm) => ({ ...prev, image: data.fileUrl }));
      }
      
      toast({
        title: "Succès",
        description: "Fichier téléchargé avec succès",
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
  <MainLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Carte de profil */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {session?.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || "Utilisateur"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <input 
                      type="file" 
                      id="profile-image-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'profile_image')}
                    />
                  </label>
                </div>
                
                <h2 className="text-xl font-bold">{session?.user?.name || "Utilisateur"}</h2>
                <p className="text-muted-foreground">{profileForm.role}</p>
                
                <div className="w-full mt-6 pt-6 border-t">
                  <div className="flex items-center mb-3">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{session?.user?.email}</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{profileForm.company}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{profileForm.role}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-muted/30 border-t">
                <Button variant="outline" className="w-full" onClick={() => router.push("/settings")}>
                  Paramètres du compte
                </Button>
                {session?.user?.role === "admin" && (
                  <Button className="w-full" onClick={() => router.push("/users/add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un nouvel utilisateur
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire de profil */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Informations personnelles</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={profileForm.first_name}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={profileForm.last_name}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">L&apos;email ne peut pas être modifié.</p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cnie" className="block text-sm font-medium mb-1">
                      CNIE
                    </label>
                    <input
                      type="text"
                      id="cnie"
                      name="cnie"
                      value={profileForm.cnie}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium mb-1">
                      Nationalité
                    </label>
                    <input
                      type="text"
                      id="nationality"
                      name="nationality"
                      value={profileForm.nationality}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={profileForm.city}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={profileForm.address}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={profileForm.company}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium mb-1">
                    Poste / Fonction
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={profileForm.role}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  >
                    <option value="Administrateur">Administrateur</option>
                    <option value="Responsable RH">Responsable RH</option>
                    <option value="Recruteur">Recruteur</option>
                    <option value="Gestionnaire de talents">Gestionnaire de talents</option>
                    <option value="Coordinateur de recrutement">Coordinateur de recrutement</option>
                    <option value="Chargé de recrutement">Chargé de recrutement</option>
                    <option value="Spécialiste RH">Spécialiste RH</option>
                    <option value="Candidat">Candidat</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-1">
                    Biographie
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none"
                  />
                </div>
                
                <div>
                   <label htmlFor="cv_url" className="block text-sm font-medium mb-1">
                     CV
                   </label>
                   <div className="flex items-center space-x-2">
                     <input
                       type="text"
                       id="cv_url"
                       name="cv_url"
                       value={profileForm.cv_url}
                       onChange={handleProfileChange}
                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                       placeholder="URL de votre CV"
                       readOnly
                     />
                     <label htmlFor="cv-file-upload">
                       <Button type="button" size="sm" variant="outline" disabled={isUploading} asChild>
                         <span>
                           {isUploading ? 'Chargement...' : <><Upload className="h-4 w-4 mr-2" /> Importer</>}
                         </span>
                       </Button>
                       <input 
                         type="file" 
                         id="cv-file-upload" 
                         className="hidden" 
                         accept=".pdf,.doc,.docx"
                         onChange={(e) => handleFileUpload(e, 'cv')}
                       />
                     </label>
                   </div>
                   {profileForm.cv_url && (
                     <p className="text-xs text-muted-foreground mt-1">
                       <a href={profileForm.cv_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                         Voir le CV
                       </a>
                     </p>
                   )}
                 </div>
                 
                 <div>
                   <label htmlFor="cover_letter_url" className="block text-sm font-medium mb-1">
                     Lettre de motivation
                   </label>
                   <div className="flex items-center space-x-2">
                     <input
                       type="text"
                       id="cover_letter_url"
                       name="cover_letter_url"
                       value={profileForm.cover_letter_url}
                       onChange={handleProfileChange}
                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                       placeholder="URL de votre lettre de motivation"
                       readOnly
                     />
                     <label htmlFor="cover-letter-file-upload">
                       <Button type="button" size="sm" variant="outline" disabled={isUploading} asChild>
                         <span>
                           {isUploading ? 'Chargement...' : <><Upload className="h-4 w-4 mr-2" /> Importer</>}
                         </span>
                       </Button>
                       <input 
                         type="file" 
                         id="cover-letter-file-upload" 
                         className="hidden" 
                         accept=".pdf,.doc,.docx"
                         onChange={(e) => handleFileUpload(e, 'cover_letter')}
                       />
                     </label>
                   </div>
                   {profileForm.cover_letter_url && (
                     <p className="text-xs text-muted-foreground mt-1">
                       <a href={profileForm.cover_letter_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                         Voir la lettre de motivation
                       </a>
                     </p>
                   )}
                 </div>
              </div>
              
              <div className="mt-8 pt-4 border-t">
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Section Mes candidatures */}
      {applications.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Mes candidatures</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-background border rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Poste</th>
                  <th className="px-4 py-2 text-left">Entreprise</th>
                  <th className="px-4 py-2 text-left">Statut</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="border-t">
                    <td className="px-4 py-2">{app.job_title || '-'}</td>
                    <td className="px-4 py-2">{app.company || '-'}</td>
                    <td className="px-4 py-2">{app.status}</td>
                    <td className="px-4 py-2">{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Section Gestion des utilisateurs pour les admins et recruteurs */}
      {(session?.user?.role === "admin" || session?.user?.role === "recruteur") && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
            <Button onClick={() => router.push("/users/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un nouvel utilisateur
            </Button>
          </div>
          
          {/* Filtres de recherche */}
          <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium mb-1">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="role-filter" className="block text-sm font-medium mb-1">
                  Filtrer par rôle
                </label>
                <select
                  id="role-filter"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as UserRole | "all")}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateurs</option>
                  <option value="recruteur">Recruteurs</option>
                  <option value="candidat">Candidats</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={loadUsers} className="w-full">
                  Appliquer les filtres
                </Button>
              </div>
            </div>
          </div>
          
          {/* Liste des utilisateurs */}
          <div className="bg-card rounded-lg shadow-sm p-6">
            {isLoadingUsers ? (
              <div className="text-center py-8">
                <p>Chargement des utilisateurs...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Rôle</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full" src={user.image} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {user.email}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value as UserRole)}
                            className="px-2 py-1 border rounded text-xs bg-background"
                            disabled={session?.user?.role !== "admin" && user.role === "admin"}
                          >
                            <option value="admin">Administrateur</option>
                            <option value="recruteur">Recruteur</option>
                            <option value="candidat">Candidat</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/users/${user.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {session?.user?.role === "admin" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setUserToDelete(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Dialogue de confirmation de suppression */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-4">
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete.name}</strong> ?
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setUserToDelete(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}