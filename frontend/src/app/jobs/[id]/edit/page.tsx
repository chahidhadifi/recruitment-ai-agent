"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
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
    benefits: "",
    desired_candidates: "",
    company_website: "",
    company_linkedin: ""
  });
  
  // Vérifier si l'utilisateur est un recruteur
  const isRecruiter = session?.user?.role === "recruteur" || session?.user?.role === "admin";
  
  // Charger les données de l'offre
  useEffect(() => {
    const fetchJobData = async () => {
      if (status !== "authenticated" || !isRecruiter) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:8000/api/jobs/${jobId}`);
        const jobData = response.data;
        
        // Vérifier que l'utilisateur est bien le créateur de l'offre
        if (jobData.recruiter_id && jobData.recruiter_id.toString() !== session.user.id) {
          toast({
            title: "Accès refusé",
            description: "Vous n'êtes pas autorisé à modifier cette offre d'emploi.",
            variant: "destructive",
          });
          router.push("/jobs");
          return;
        }
        
        // Convertir les tableaux en chaînes de caractères pour l'affichage dans les champs
        setFormData({
          title: jobData.title || "",
          company: jobData.company || "",
          location: jobData.location || "",
          type: jobData.type || "CDI",
          salary: jobData.salary || "",
          description: jobData.description || "",
          responsibilities: Array.isArray(jobData.responsibilities) ? jobData.responsibilities.join('\n') : jobData.responsibilities || "",
          requirements: Array.isArray(jobData.requirements) ? jobData.requirements.join('\n') : jobData.requirements || "",
          benefits: Array.isArray(jobData.benefits) ? jobData.benefits.join('\n') : jobData.benefits || "",
          desired_candidates: jobData.desired_candidates ? jobData.desired_candidates.toString() : "",
          company_website: jobData.company_website || "",
          company_linkedin: jobData.company_linkedin || ""
        });
      } catch (error) {
        console.error("Erreur lors du chargement de l'offre:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de l'offre d'emploi.",
          variant: "destructive",
        });
        router.push("/jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobId, status, session, router, toast, isRecruiter]);
  
  // Rediriger si l'utilisateur n'est pas authentifié ou n'est pas un recruteur
  if (status === "loading" || isLoading) {
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
        // Convertir desired_candidates en nombre si présent
        desired_candidates: formData.desired_candidates ? parseInt(formData.desired_candidates) : null,
        // Conserver l'ID du recruteur
        recruiter_id: parseInt(session?.user?.id) || 0
      };
      
      // Envoyer les données à l'API
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || "Erreur lors de la modification de l'offre");
      }
      
      toast({
        title: "Offre mise à jour",
        description: "Votre offre d'emploi a été modifiée avec succès.",
      });
      
      // Rediriger vers la liste des offres
      router.push("/jobs");
    } catch (error) {
      console.error("Erreur lors de la modification de l'offre:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la modification de l'offre. Veuillez réessayer.",
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
            <CardTitle className="text-2xl">Modifier l&apos;offre d&apos;emploi</CardTitle>
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
                    placeholder="ex: 45 000 € - 55 000 € par an"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="desired_candidates">Nombre de candidats recherchés</Label>
                  <Input
                    id="desired_candidates"
                    name="desired_candidates"
                    type="number"
                    placeholder="ex: 1"
                    value={formData.desired_candidates}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description du poste <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez le poste en détail..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsabilités (une par ligne)</Label>
                <Textarea
                  id="responsibilities"
                  name="responsibilities"
                  placeholder="- Développer des fonctionnalités frontend&#10;- Collaborer avec l'équipe design&#10;- Optimiser les performances"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Prérequis (un par ligne)</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="- 3+ ans d'expérience en React&#10;- Connaissance de TypeScript&#10;- Expérience avec les API REST"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="benefits">Avantages (un par ligne)</Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  placeholder="- Télétravail partiel&#10;- Tickets restaurant&#10;- Mutuelle d'entreprise"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company_website">Site web de l'entreprise</Label>
                  <Input
                    id="company_website"
                    name="company_website"
                    placeholder="ex: https://www.entreprise.com"
                    value={formData.company_website}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_linkedin">LinkedIn de l'entreprise</Label>
                  <Input
                    id="company_linkedin"
                    name="company_linkedin"
                    placeholder="ex: https://www.linkedin.com/company/entreprise"
                    value={formData.company_linkedin}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}