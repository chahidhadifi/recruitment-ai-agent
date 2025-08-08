"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function NewJobPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  // Vérifier si l'utilisateur est un recruteur
  const isRecruiter = session?.user?.role === "recruteur" || session?.user?.role === "admin";
  
  // Rediriger si l'utilisateur n'est pas authentifié ou n'est pas un recruteur
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
  
  if (session && !isRecruiter) {
    router.push("/");
    return null;
  }
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "CDI",
    salary: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.title.trim() || !formData.company.trim() || !formData.location.trim() || !formData.description.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Préparer les données pour l'API
      const jobData = {
        ...formData,
        // Convertir les champs texte en tableaux si nécessaire
        responsibilities: formData.responsibilities.split('\n').filter(item => item.trim() !== ''),
        requirements: formData.requirements.split('\n').filter(item => item.trim() !== ''),
        benefits: formData.benefits.split('\n').filter(item => item.trim() !== ''),
        // Ajouter les champs manquants
        postedDate: new Date().toISOString(),
        applications: 0,
        recruiter: session?.user?.id || 'unknown'
      };
      
      // Envoyer les données à l'API
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'offre');
      }
      
      toast({
        title: "Offre publiée",
        description: "Votre offre d'emploi a été publiée avec succès.",
      });
      
      // Rediriger vers la liste des offres
      router.push("/jobs");
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la publication de l'offre. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Publier une nouvelle offre d'emploi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du poste <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="ex: Développeur Frontend React"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise <span className="text-destructive">*</span></Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="ex: TechSolutions"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu <span className="text-destructive">*</span></Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="ex: Paris, France"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Type de contrat <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionner un type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Alternance">Alternance</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">Salaire</Label>
                  <Input
                    id="salary"
                    name="salary"
                    placeholder="ex: 45 000€ - 60 000€"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description du poste <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez le poste, les missions principales et le contexte..."
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsabilités</Label>
                <Textarea
                  id="responsibilities"
                  name="responsibilities"
                  placeholder="Listez les responsabilités principales (une par ligne)"
                  rows={4}
                  value={formData.responsibilities}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Prérequis et compétences</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Listez les compétences et qualifications requises (une par ligne)"
                  rows={4}
                  value={formData.requirements}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="benefits">Avantages et bénéfices</Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  placeholder="Listez les avantages proposés (une par ligne)"
                  rows={4}
                  value={formData.benefits}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={() => router.push("/jobs")}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Publication en cours..." : "Publier l'offre"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}