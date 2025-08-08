"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Save, User, Mail, Building, Briefcase, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  // Création d'une session fictive pour les tests (l'authentification est désactivée)
  const { data: realSession, update } = useSession();
  
  // Session fictive pour les tests
  const mockSession = {
    user: {
      id: "1",
      name: "Utilisateur Test",
      email: "test@example.com",
      image: "https://ui-avatars.com/api/?name=Utilisateur+Test",
    }
  };
  
  // Utiliser la session fictive si aucune session réelle n'est disponible
  const session = realSession || mockSession;
  const router = useRouter();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    company: "AI Recruitment Inc.",
    role: "Recruteur",
    bio: "Spécialiste en recrutement avec 5 ans d'expérience dans le secteur technologique.",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mise à jour de la session (dans un environnement réel, cela serait fait via une API)
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
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
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
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground">
                    <Camera className="h-4 w-4" />
                  </button>
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
                  <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié.</p>
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
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={profileForm.role}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
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
    </MainLayout>
  );
}