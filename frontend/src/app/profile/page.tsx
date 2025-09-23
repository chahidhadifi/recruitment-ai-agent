"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, User, Mail, Building, Briefcase, Save, Camera } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MainLayout } from "@/components/main-layout";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUser } from "@/lib/api/users";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Récupérer les données de l'utilisateur depuis l'API backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`http://localhost:8000/api/users/${session.user.id}`, {
          headers: {
            Authorization: `Bearer ${session.user.token || session.user.access_token}`
          }
        });
        
        const userData = response.data;
        
        setProfileForm({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "",
          status: userData.status || "",
        });
      } catch (err) {
        console.error("Erreur lors du chargement des données utilisateur:", err);
        setError("Impossible de charger vos informations. Veuillez réessayer plus tard.");
        
        // Fallback aux données de session si l'API échoue
        if (session?.user) {
          setProfileForm({
            name: session.user.name || "",
            email: session.user.email || "",
            role: session.user.role || "",
            status: "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [session]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (type: 'profile' | 'password' = 'profile') => {
    setSaving(true);
    
    try {
      if (!session?.user?.id) {
        throw new Error("Utilisateur non authentifié");
      }
      
      // Préparer les données à envoyer à l'API
      const userData = type === 'profile' ? {
        name: profileForm.name,
        status: profileForm.status
      } : {
        current_password: profileForm.currentPassword,
        new_password: profileForm.newPassword
      };
      
      // Envoyer les données à l'API backend
      const response = await axios.put(
        `http://localhost:8000/api/users/${session.user.id}${type === 'password' ? '/change-password' : ''}`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.user.token || session.user.access_token}`
          }
        }
      );
      
      if (type === 'password') {
        // Réinitialiser les champs de mot de passe
        setProfileForm(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        // Mise à jour de la session
        await update({
          ...session,
          user: {
            ...session.user,
            name: profileForm.name,
          },
        });
      }
      
      toast({
        title: type === 'password' ? "Mot de passe modifié" : "Profil mis à jour",
        description: type === 'password' 
          ? "Votre mot de passe a été modifié avec succès."
          : "Vos informations de profil ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <span className="animate-spin mr-2">⏳</span>
            <span>Chargement de vos informations...</span>
          </div>
        ) : error ? (
          <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
            <p>{error}</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        ) : (
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
                    {/* <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground">
                      <Camera className="h-4 w-4" />
                    </button> */}
                  </div>
                  
                  <h2 className="text-xl font-bold">{session?.user?.name || "Utilisateur"}</h2>
                  <p className="text-muted-foreground">{profileForm.role}</p>
                  
                  <div className="w-full mt-6 pt-6 border-t">
                    <div className="flex items-center mb-3">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{session?.user?.email}</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{profileForm.role}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Statut: {profileForm.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de profil */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Informations personnelles</h2>
                
                <div className="space-y-4">
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
                    <label htmlFor="role" className="block text-sm font-medium mb-1">
                      Rôle
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={profileForm.role}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      disabled
                    />
                  </div>
                
                </div>
                
                <div className="mt-8 pt-4 border-t">
                  <Button onClick={() => saveProfile('profile')} disabled={saving}>
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
            <div className="bg-card rounded-lg shadow-sm p-6 mt-4">
              <h2 className="text-xl font-bold mb-6">Modifier le mot de passe</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={profileForm.currentPassword}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={profileForm.newPassword}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={profileForm.confirmPassword}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={() => saveProfile('password')} 
                  disabled={saving || !profileForm.currentPassword || !profileForm.newPassword || profileForm.newPassword !== profileForm.confirmPassword}
                >
                  {saving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Modification en cours...
                    </>
                  ) : (
                    <>Modifier le mot de passe</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}