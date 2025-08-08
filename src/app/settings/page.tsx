"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Save, User, Bell, Lock, Globe, Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/components/ui/use-toast";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  // Création d'une session fictive pour les tests (l'authentification est désactivée)
  const { data: realSession } = useSession();
  
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
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  // États pour les formulaires
  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    company: "AI Recruitment Inc.",
    role: "Recruteur",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newCandidateAlerts: true,
    interviewReminders: true,
    reportCompletionAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  const [languageSettings, setLanguageSettings] = useState({
    language: "fr",
    dateFormat: "DD/MM/YYYY",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setSecuritySettings((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLanguageSettings((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = () => {
    setSaving(true);
    
    // Simulation d'une requête API
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Paramètres enregistrés",
        description: "Vos paramètres ont été mis à jour avec succès.",
      });
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar de navigation */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <nav className="flex flex-col">
                <button
                  className={`flex items-center px-4 py-3 text-left ${activeTab === "profile" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-5 w-5 mr-3" />
                  Profil
                </button>
                <button
                  className={`flex items-center px-4 py-3 text-left ${activeTab === "notifications" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                </button>
                <button
                  className={`flex items-center px-4 py-3 text-left ${activeTab === "security" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"}`}
                  onClick={() => setActiveTab("security")}
                >
                  <Lock className="h-5 w-5 mr-3" />
                  Sécurité
                </button>
                <button
                  className={`flex items-center px-4 py-3 text-left ${activeTab === "language" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"}`}
                  onClick={() => setActiveTab("language")}
                >
                  <Globe className="h-5 w-5 mr-3" />
                  Langue et région
                </button>
                <button
                  className={`flex items-center px-4 py-3 text-left ${activeTab === "appearance" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"}`}
                  onClick={() => setActiveTab("appearance")}
                >
                  <Moon className="h-5 w-5 mr-3" />
                  Apparence
                </button>
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="md:col-span-3">
            <div className="bg-card rounded-lg shadow-sm p-6">
              {/* Profil */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Informations du profil</h2>
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
                      />
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
                        Rôle
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
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Préférences de notifications</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notifications par email</h3>
                        <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Nouveaux candidats</h3>
                        <p className="text-sm text-muted-foreground">Être notifié lors de l'ajout d'un nouveau candidat</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="newCandidateAlerts"
                          checked={notificationSettings.newCandidateAlerts}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Rappels d'entretiens</h3>
                        <p className="text-sm text-muted-foreground">Recevoir des rappels avant les entretiens programmés</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="interviewReminders"
                          checked={notificationSettings.interviewReminders}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Rapports d'évaluation</h3>
                        <p className="text-sm text-muted-foreground">Être notifié lorsqu'un rapport d'évaluation est prêt</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="reportCompletionAlerts"
                          checked={notificationSettings.reportCompletionAlerts}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Sécurité */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Paramètres de sécurité</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Authentification à deux facteurs</h3>
                        <p className="text-sm text-muted-foreground">Ajouter une couche de sécurité supplémentaire à votre compte</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="twoFactorAuth"
                          checked={securitySettings.twoFactorAuth}
                          onChange={handleSecurityChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Expiration de session</h3>
                      <p className="text-sm text-muted-foreground mb-2">Définir la durée après laquelle vous serez automatiquement déconnecté</p>
                      <select
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecurityChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 heure</option>
                        <option value="120">2 heures</option>
                        <option value="240">4 heures</option>
                      </select>
                    </div>
                    <div>
                      <Button variant="outline" className="w-full">
                        Changer le mot de passe
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Langue et région */}
              {activeTab === "language" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Langue et préférences régionales</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium mb-1">
                        Langue
                      </label>
                      <select
                        id="language"
                        name="language"
                        value={languageSettings.language}
                        onChange={handleLanguageChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="dateFormat" className="block text-sm font-medium mb-1">
                        Format de date
                      </label>
                      <select
                        id="dateFormat"
                        name="dateFormat"
                        value={languageSettings.dateFormat}
                        onChange={handleLanguageChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Apparence */}
              {activeTab === "appearance" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Apparence</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-4">Thème</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border ${theme === "light" ? "border-primary bg-primary/10" : "border-border"}`}
                          onClick={() => setTheme("light")}
                        >
                          <Sun className="h-8 w-8 mb-2" />
                          <span>Clair</span>
                        </button>
                        <button
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border ${theme === "dark" ? "border-primary bg-primary/10" : "border-border"}`}
                          onClick={() => setTheme("dark")}
                        >
                          <Moon className="h-8 w-8 mb-2" />
                          <span>Sombre</span>
                        </button>
                        <button
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border ${theme === "system" ? "border-primary bg-primary/10" : "border-border"}`}
                          onClick={() => setTheme("system")}
                        >
                          <Laptop className="h-8 w-8 mb-2" />
                          <span>Système</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton de sauvegarde */}
              <div className="mt-8 pt-4 border-t">
                <Button onClick={saveSettings} disabled={saving}>
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