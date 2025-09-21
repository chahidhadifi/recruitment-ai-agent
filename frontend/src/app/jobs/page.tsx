"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Plus, Briefcase, Building, Calendar, MapPin } from "lucide-react";
import axios from "axios";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_RECRUTEUR_USER } from "@/types/user-roles";
import { Job } from "@/types/job";

export default function JobsPage() {
  const router = useRouter();
  const { data: realSession, status } = useSession();
  const session = realSession;
  
  // État pour stocker les offres d'emploi
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les offres d'emploi depuis l'API
  useEffect(() => {
    const fetchJobs = async () => {
      if (status !== "authenticated") return;
      
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/jobs/');
        // Adapter les noms de champs de l'API au format attendu par le frontend
        const jobsData = response.data.map((job: any) => ({
          ...job,
          postedDate: job.posted_date
        }));
        setJobs(jobsData);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des offres d'emploi:", err);
        setError("Impossible de charger les offres d'emploi. Veuillez réessayer plus tard.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [status]);

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
    if (!dateString) return "";
    
    const posted = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(posted.getTime())) return "";
    
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";    
    return `Il y a ${diffDays} jours`;
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Offres d'emploi</h1>
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
            <p className="text-muted-foreground">Chargement des offres d'emploi...</p>
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
            <h2 className="text-xl font-semibold mb-2">Aucune offre d'emploi trouvée</h2>
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
                          {job.company && (
                            <div className="flex items-center mr-4 mb-2">
                              <Building className="h-4 w-4 mr-1" />
                              <span>{job.company}</span>
                            </div>
                          )}
                          {job.location && (
                            <div className="flex items-center mr-4 mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          {job.postedDate && (
                            <div className="flex items-center mb-2">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{getDaysSincePosted(job.postedDate)}</span>
                            </div>
                          )}
                        </div>
                        <p className="mb-4 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.type && <Badge variant="outline">{job.type}</Badge>}
                          {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                          {job.applications !== undefined && (
                            <Badge variant="outline">{job.applications} candidature(s)</Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        {isAuthenticated ? (
                          <Button asChild>
                            <Link href={`/jobs/${job.id}`}>Voir l'offre</Link>
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