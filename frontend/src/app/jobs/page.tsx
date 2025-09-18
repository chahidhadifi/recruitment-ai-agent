"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Plus, Briefcase, Building, Calendar, MapPin } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_RECRUTEUR_USER } from "@/types/user-roles";
import { Job } from "@/types/job";

// Données fictives pour les offres d'emploi
const mockJobs: Job[] = [
  {
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
      "Assurer la maintenance et l&apos;amélioration des applications existantes",
      "Participer aux revues de code et aux réunions d&apos;équipe",
      "Rester à jour sur les dernières technologies frontend"
    ],
    requirements: [
      "Expérience de 2+ ans en développement React",
      "Maîtrise de JavaScript/TypeScript, HTML et CSS",
      "Connaissance des outils de build comme Webpack ou Vite",
      "Expérience avec les API RESTful et GraphQL",
      "Familiarité avec les méthodologies Agile",
      "Bonne communication et esprit d&apos;équipe"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Mutuelle d&apos;entreprise",
      "Tickets restaurant"
    ],
    recruiter: "recruteur-1",
    applications: 12
  },
  {
    id: "2",
    title: "UX/UI Designer",
    company: "DesignStudio",
    location: "Lyon, France",
    type: "CDI",
    salary: "40 000€ - 55 000€",
    postedDate: "2023-11-10",
    description: "Rejoignez notre studio de design en tant que UX/UI Designer et créez des expériences utilisateur exceptionnelles pour nos clients. Vous serez responsable de la conception d&apos;interfaces intuitives et esthétiques pour des applications web et mobiles.",
    responsibilities: [
      "Créer des wireframes, prototypes et maquettes haute-fidélité",
      "Réaliser des tests utilisateurs et analyser les retours",
      "Collaborer avec les développeurs pour l&apos;implémentation des designs",
        "Participer à l&apos;élaboration de la stratégie UX",
      "Maintenir et faire évoluer notre système de design"
    ],
    requirements: [
      "Expérience de 3+ ans en UX/UI Design",
      "Maîtrise de Figma, Sketch ou Adobe XD",
      "Portfolio démontrant vos compétences en design",
      "Connaissance des principes d&apos;accessibilité web",
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
  {
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
      "Collaborer avec l&apos;équipe frontend pour l&apos;intégration des API",
        "Participer à l&apos;amélioration continue de notre architecture"
    ],
    requirements: [
      "Expérience avec Node.js et Express",
      "Connaissance des bases de données SQL et NoSQL",
      "Compréhension des principes de sécurité web",
      "Expérience avec Docker est un plus",
      "Familiarité avec les principes de microservices",
      "Expérience en développement d&apos;API RESTful"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Mutuelle d&apos;entreprise",
      "Tickets restaurant"
    ],
    recruiter: "recruteur-2",
    applications: 5
  }
];

export default function JobsPage() {
  const router = useRouter();
  const { data: realSession, status } = useSession();
  const session = realSession;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les offres d'emploi depuis l'API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/jobs/');
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des offres: ${response.status}`);
        }
        
        const data = await response.json();
        setJobs(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des offres:", err);
        setError("Impossible de charger les offres d'emploi. Veuillez réessayer plus tard.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filtrer les offres d'emploi en fonction du terme de recherche
  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchTermLower) ||
      job.company.toLowerCase().includes(searchTermLower) ||
      job.location.toLowerCase().includes(searchTermLower) ||
      job.description.toLowerCase().includes(searchTermLower)
    );
  });

  // Gérer la recherche avec un délai
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Vérifier si l'utilisateur est authentifié et est un recruteur ou un administrateur
  const isAuthenticated = status === "authenticated";
  const isRecruiter = isAuthenticated && (session?.user?.role === "recruteur" || session?.user?.role === "admin");


  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Calculer le nombre de jours depuis la publication
  const getDaysSincePosted = (dateString: string) => {
    const posted = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd&apos;hui";
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Offres d&apos;emploi</h1>
          {isRecruiter && (
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/applications">
                  <Briefcase className="mr-2 h-4 w-4" /> Gérer les candidatures
                </Link>
              </Button>
              <Button asChild>
                <Link href="/jobs/new">
                  <Plus className="mr-2 h-4 w-4" /> Publier une offre
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par titre, entreprise ou lieu..."
              className="w-full pl-10 pr-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement des offres d&apos;emploi...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <div className="text-red-500 mb-2">⚠️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Erreur</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune offre d&apos;emploi trouvée</h2>
            <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">
                          <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                            {job.title}
                          </Link>
                        </h2>
                        <div className="flex flex-wrap items-center text-muted-foreground mb-4">
                          <div className="flex items-center mr-4 mb-2">
                            <Building className="h-4 w-4 mr-1" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center mr-4 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{getDaysSincePosted(job.postedDate)}</span>
                          </div>
                        </div>
                        <p className="mb-4 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge variant="outline">{job.salary}</Badge>
                          <Badge variant="outline">{job.applications} candidature(s)</Badge>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        {isAuthenticated ? (
                          <Button asChild>
                            <Link href={`/jobs/${job.id}`}>Voir l&apos;offre</Link>
                          </Button>
                        ) : (
                          <Button onClick={() => router.push("/auth/login")}>
                            Se connecter pour voir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}