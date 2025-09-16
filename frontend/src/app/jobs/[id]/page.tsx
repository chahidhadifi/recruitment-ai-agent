"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Building, MapPin, Calendar, Clock, Briefcase, DollarSign, Users, FileText, Upload } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { DEFAULT_CANDIDAT_USER } from "@/types/user-roles";
import { Job } from "@/types/job";

// Données fictives pour les offres d'emploi
const mockJobs: Record<string, Job> = {
  "1": {
    id: "1",
    title: "Développeur Frontend React",
    company: "TechSolutions",
    location: "Paris, France",
    type: "CDI",
    salary: "45 000€ - 60 000€",
    postedDate: "2023-11-15",
    description: "Nous recherchons un développeur Frontend React passionné pour rejoindre notre équipe et participer au développement de nos applications web innovantes. Vous travaillerez sur des projets variés et stimulants dans un environnement collaboratif.",
    responsibilities: [
      "Développer des interfaces utilisateur réactives et intuitives",
      "Collaborer avec les designers UX/UI pour implémenter les maquettes",
      "Assurer la maintenance et l'amélioration des applications existantes",
      "Participer aux revues de code et aux réunions d'équipe",
      "Rester à jour sur les dernières technologies frontend"
    ],
    requirements: [
      "Expérience de 2+ ans en développement React",
      "Maîtrise de JavaScript/TypeScript, HTML et CSS",
      "Connaissance des outils de build comme Webpack ou Vite",
      "Expérience avec les API RESTful et GraphQL",
      "Familiarité avec les méthodologies Agile",
      "Bonne communication et esprit d'équipe"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Mutuelle d'entreprise",
      "Tickets restaurant"
    ],
    recruiter: "recruteur-1",
    applications: 12
  },
  "2": {
    id: "2",
    title: "UX/UI Designer",
    company: "DesignStudio",
    location: "Lyon, France",
    type: "CDI",
    salary: "40 000€ - 55 000€",
    postedDate: "2023-11-10",
    description: "Rejoignez notre studio de design en tant que UX/UI Designer et créez des expériences utilisateur exceptionnelles pour nos clients. Vous serez responsable de la conception d'interfaces intuitives et esthétiques pour des applications web et mobiles.",
    responsibilities: [
      "Créer des wireframes, prototypes et maquettes haute-fidélité",
      "Réaliser des tests utilisateurs et analyser les retours",
      "Collaborer avec les développeurs pour l'implémentation des designs",
      "Participer à l'élaboration de la stratégie UX",
      "Maintenir et faire évoluer notre système de design"
    ],
    requirements: [
      "Expérience de 3+ ans en UX/UI Design",
      "Maîtrise de Figma, Sketch ou Adobe XD",
      "Portfolio démontrant vos compétences en design",
      "Connaissance des principes d'accessibilité web",
      "Expérience en recherche utilisateur",
      "Capacité à défendre vos choix de design"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Budget matériel",
      "Abonnement à des ressources de design",
      "Participation à des conférences"
    ],
    recruiter: "recruteur-1",
    applications: 8
  },
  "3": {
    id: "3",
    title: "Développeur Backend Node.js",
    company: "WebServices",
    location: "Bordeaux, France",
    type: "CDI",
    salary: "50 000€ - 65 000€",
    postedDate: "2023-11-05",
    description: "Nous cherchons un développeur Backend Node.js expérimenté pour renforcer notre équipe technique. Vous serez responsable du développement et de la maintenance de nos API et services backend qui alimentent nos applications.",
    responsibilities: [
      "Concevoir et développer des API RESTful",
      "Implémenter des modèles de données et des schémas de base de données",
      "Assurer la sécurité et la performance des applications",
      "Collaborer avec l'équipe frontend pour l'intégration des API",
      "Participer à l'amélioration continue de notre architecture"
    ],
    requirements: [
      "Expérience avec Node.js et Express",
      "Connaissance des bases de données SQL et NoSQL",
      "Compréhension des principes de sécurité web",
      "Expérience avec Docker est un plus",
      "Familiarité avec les principes de microservices",
      "Expérience en développement d'API RESTful"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Mutuelle d'entreprise",
      "Tickets restaurant"
    ],
    recruiter: "recruteur-2",
    applications: 5
  },
  "4": {
    id: "4",
    title: "Data Scientist",
    company: "DataInsights",
    location: "Toulouse, France",
    type: "CDI",
    salary: "50 000€ - 70 000€",
    postedDate: "2023-11-01",
    description: "Rejoignez notre équipe d'analyse de données pour transformer les données brutes en insights précieux. Vous travaillerez sur des projets variés dans différents secteurs d'activité.",
    responsibilities: [
      "Analyser de grands ensembles de données complexes",
      "Développer des modèles prédictifs et des algorithmes de machine learning",
      "Créer des visualisations de données et des tableaux de bord",
      "Collaborer avec les équipes produit pour implémenter des solutions basées sur les données",
      "Communiquer les résultats et insights aux parties prenantes"
    ],
    requirements: [
      "Master ou PhD en Data Science, Statistiques ou domaine connexe",
      "Expérience avec Python, R et outils d'analyse de données",
      "Connaissance des algorithmes de machine learning",
      "Expérience en visualisation de données",
      "Familiarité avec les bases de données SQL et NoSQL",
      "Expérience avec des frameworks de big data comme Spark"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Accès à des ressources de calcul haute performance",
      "Participation à des conférences et événements"
    ],
    recruiter: "recruteur-1",
    applications: 15
  },
  "5": {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudSystems",
    location: "Lille, France",
    type: "CDI",
    salary: "45 000€ - 65 000€",
    postedDate: "2023-10-25",
    description: "Nous recherchons un ingénieur DevOps pour améliorer notre infrastructure cloud et nos processus de déploiement. Vous serez responsable de l'automatisation et de l'optimisation de nos environnements de développement et de production.",
    responsibilities: [
      "Concevoir et maintenir notre infrastructure cloud",
      "Automatiser les processus de déploiement et d'intégration continue",
      "Optimiser la performance et la sécurité de nos systèmes",
      "Mettre en place des outils de monitoring et d'alerte",
      "Collaborer avec les équipes de développement pour résoudre les problèmes d'infrastructure"
    ],
    requirements: [
      "Expérience avec AWS, Azure ou GCP",
      "Maîtrise de Docker, Kubernetes et Terraform",
      "Connaissance des pratiques CI/CD",
      "Expérience en automatisation et scripting",
      "Familiarité avec les outils de monitoring comme Prometheus et Grafana",
      "Connaissance des principes de sécurité cloud"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Mutuelle d'entreprise",
      "Tickets restaurant"
    ],
    recruiter: "recruteur-2",
    applications: 7
  }
};

export default function JobDetailPage({ params }: { params: { id: string } }) {
  // Utiliser React.use() pour accéder aux params
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = status === "authenticated";

  // Simuler le chargement des données
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const jobData = mockJobs[resolvedParams.id];
        if (!jobData) {
          setError("Offre d&apos;emploi non trouvée");
          return;
        }
        
        setJob(jobData);
      } catch (err) {
        setError("Une erreur est survenue lors du chargement de l&apos;offre d&apos;emploi");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [resolvedParams.id]);

  const handleApply = async () => {
    if (!session) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour postuler à cette offre",
        variant: "destructive",
      });
      return;
    }

    if (!cvFile) {
      toast({
        title: "CV requis",
        description: "Veuillez télécharger votre CV",
        variant: "destructive",
      });
      return;
    }

    if (!coverLetter.trim()) {
      toast({
        title: "Lettre de motivation requise",
        description: "Veuillez rédiger une lettre de motivation",
        variant: "destructive",
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: "Téléphone requis",
        description: "Veuillez indiquer votre numéro de téléphone",
        variant: "destructive",
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: "Localisation requise",
        description: "Veuillez indiquer votre localisation",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Télécharger le CV
      const formData = new FormData();
      formData.append('file', cvFile);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Erreur lors du téléchargement du CV');
      }
      
      const { url: cvUrl } = await uploadResponse.json();
      
      // Soumettre la candidature
      const applyResponse = await fetch(`/api/jobs/${resolvedParams.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverLetter,
          cvUrl,
          phone,
          location,
          jobTitle: job.title,
          company: job.company
        }),
      });
      
      if (!applyResponse.ok) {
        const errorData = await applyResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la soumission de la candidature');
      }
      
      // Récupérer les données de la candidature créée
      const applicationData = await applyResponse.json();
      
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été envoyée avec succès. Vous allez être redirigé vers la page de vos candidatures.",
      });
      
      setIsDialogOpen(false);
      setCoverLetter("");
      setCvFile(null);
      setPhone("");
      setLocation("");
      
      // Rediriger vers la page des candidatures au lieu de l'entretien
      if (session?.user?.role === "candidat") {
        // Utiliser setTimeout pour permettre à l'utilisateur de voir le message de succès avant la redirection
        setTimeout(() => {
          router.push('/jobs/my-applications');
        }, 1500);
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue lors de l&apos;envoi de votre candidature",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !job) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-bold text-red-500 mb-4">{error || "Offre d&apos;emploi non trouvée"}</h2>
            <Button onClick={() => router.push("/jobs")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux offres
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" onClick={() => router.push("/jobs")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux offres
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <Building className="h-4 w-4 mr-1" />
                      <span className="mr-4">{job.company}</span>
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Publié le {formatDate(job.postedDate)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {job.type}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {job.salary}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" />
                      CDI
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {job.applications} candidat{job.applications > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex flex-wrap gap-3">
                  {!isAuthenticated ? (
                    <Button onClick={() => router.push("/auth/login")} className="w-full sm:w-auto">
                      Se connecter pour postuler
                    </Button>
                  ) : session?.user?.role === "candidat" ? (
                    <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                      Postuler maintenant
                    </Button>
                  ) : null}
                  
                  {isAuthenticated && (session?.user?.role === "recruteur" || session?.user?.role === "admin") && (
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/jobs/${resolvedParams.id}/applications`)} 
                      className="w-full sm:w-auto"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Voir les candidatures
                    </Button>
                  )}
                </div>

                <Tabs defaultValue="description">
                  <TabsList className="mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="requirements">Prérequis</TabsTrigger>
                    <TabsTrigger value="benefits">Avantages</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="space-y-4">
                    <div className="mb-4">
                      <p className="text-muted-foreground">{job.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Responsabilités</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {job.responsibilities.map((item, index) => (
                          <li key={index} className="text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="requirements" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Prérequis</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {job.requirements.map((item, index) => (
                          <li key={index} className="text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="benefits" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Avantages</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {job.benefits.map((item, index) => (
                          <li key={index} className="text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>À propos de l&apos;entreprise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="bg-muted h-16 w-16 rounded-md flex items-center justify-center text-2xl font-bold mr-4">
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{job.company}</h3>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {job.company} est une entreprise innovante dans le secteur de la technologie, offrant un environnement de travail stimulant et des opportunités de développement professionnel.
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Site web
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Partager cette offre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm">
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Postuler pour: {job.title}</DialogTitle>
              <DialogDescription>
                Complétez le formulaire ci-dessous pour soumettre votre candidature à {job.company}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Informations personnelles */}
              <div className="grid gap-4 mb-2">
                <h3 className="font-medium">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <input
                      id="fullName"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Votre nom complet"
                      value={session?.user?.name || ''}
                      readOnly
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <input
                      id="email"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Votre email"
                      value={session?.user?.email || ''}
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <input
                      id="phone"
                      type="tel"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Votre numéro de téléphone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Localisation</Label>
                    <input
                      id="location"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Votre ville/pays"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* CV */}
              <div className="grid gap-2 mt-4">
                <Label htmlFor="cv">CV (PDF, DOC, DOCX)</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => document.getElementById("cv")?.click()} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    {cvFile ? cvFile.name : "Télécharger votre CV"}
                  </Button>
                  <input
                    id="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              
              {/* Lettre de motivation */}
              <div className="grid gap-2 mt-4">
                <Label htmlFor="coverLetter">Lettre de motivation</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleApply} disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer ma candidature"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}