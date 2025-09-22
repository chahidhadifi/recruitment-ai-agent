"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, Calendar, Clock, Building, MapPin, ExternalLink } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobApplication } from "@/types/job";

// Données fictives pour les candidatures
const mockApplications: Record<string, JobApplication[]> = {
  "candidat-1": [
    {
      id: "1-candidat-1-1",
      jobId: "1",
      candidateId: "candidat-1",
      coverLetter: "Je suis très intéressé par ce poste...",
      cvUrl: "/uploads/cv-candidat-1.pdf",
      status: "interview",
      appliedAt: "2023-11-20T10:30:00Z",
      updatedAt: "2023-11-20T10:30:00Z",
      interviewId: "interview-1-candidat-1-1"
    },
    {
      id: "2-candidat-1-1",
      jobId: "2",
      candidateId: "candidat-1",
      coverLetter: "Je souhaite rejoindre votre équipe...",
      cvUrl: "/uploads/cv-candidat-1.pdf",
      status: "pending",
      appliedAt: "2023-11-18T14:15:00Z",
      updatedAt: "2023-11-18T14:15:00Z"
    },
    {
      id: "3-candidat-1-1",
      jobId: "3",
      candidateId: "candidat-1",
      coverLetter: "Mon expérience correspond parfaitement...",
      cvUrl: "/uploads/cv-candidat-1.pdf",
      status: "accepted",
      appliedAt: "2023-11-15T09:45:00Z",
      updatedAt: "2023-11-17T11:20:00Z"
    }
  ]
};

// Données fictives pour les offres d'emploi
const mockJobs = {
  "1": {
    id: "1",
    title: "Développeur Frontend React",
    company: "TechSolutions",
    location: "Paris, France",
    type: "CDI",
    postedDate: "2023-11-15"
  },
  "2": {
    id: "2",
    title: "UX/UI Designer",
    company: "DesignStudio",
    location: "Lyon, France",
    type: "CDI",
    postedDate: "2023-11-10"
  },
  "3": {
    id: "3",
    title: "Développeur Backend Node.js",
    company: "WebServices",
    location: "Bordeaux, France",
    type: "CDI",
    postedDate: "2023-11-05"
  }
};

// Main component with Suspense boundary
export default function ApplicationStatusPage() {
  const router = useRouter();
  
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="container py-10">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
          </div>
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement...</span>
          </div>
        </div>
      </MainLayout>
    }>
      <ApplicationStatusContent />
    </Suspense>
  );
}

// Interface pour les applications enrichies avec les informations de l'offre
type EnrichedApplication = JobApplication & {
  jobTitle: string;
  company: string;
  location: string;
  jobType: string;
};

// Component that uses searchParams
function ApplicationStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!session || !session.user) {
          throw new Error("Vous devez être connecté pour voir vos candidatures");
        }
        
        // Récupérer les candidatures de l'utilisateur connecté
        const userApplications = mockApplications[session.user.id] || [];
        
        // Enrichir les données avec les informations de l'offre d'emploi
        const enrichedApplications = userApplications.map(app => {
          const job = mockJobs[app.jobId as keyof typeof mockJobs];
          return {
            ...app,
            jobTitle: job?.title || "Poste inconnu",
            company: job?.company || "Entreprise inconnue",
            location: job?.location || "Lieu inconnu",
            jobType: job?.type || "Type inconnu"
          };
        });
        
        setApplications(enrichedApplications);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchApplications();
    }
  }, [session, status]);

  // Filtrer les candidatures en fonction de l'onglet actif et de l'ID d'application
  const filteredApplications = applications.filter(app => {
    // Si un ID d'application est spécifié, ne montrer que cette application
    if (applicationId && app.id !== applicationId) return false;
    
    // Filtrer par statut si aucun ID n'est spécifié ou si l'ID correspond
    if (activeTab === "all") return true;
    if (activeTab === "pending") return app.status === "pending" || app.status === "reviewed";
    if (activeTab === "interview") return app.status === "interview";
    if (activeTab === "accepted") return app.status === "accepted";
    if (activeTab === "rejected") return app.status === "rejected";
    return true;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "reviewed":
        return "Examinée";
      case "interview":
        return "Entretien";
      case "accepted":
        return "Acceptée";
      case "rejected":
        return "Refusée";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "interview":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
  };

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Statut de mes candidatures</h1>
          <Button onClick={() => router.push('/jobs/my-applications')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à mes candidatures
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="interview">Entretien</TabsTrigger>
            <TabsTrigger value="accepted">Acceptées</TabsTrigger>
            <TabsTrigger value="rejected">Refusées</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement de vos candidatures...</p>
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
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune candidature trouvée</h2>
            <p className="text-muted-foreground">
              {activeTab === "all" 
                ? "Vous n&apos;avez pas encore postulé à des offres d&apos;emploi." 
                : "Vous n&apos;avez pas de candidatures dans cette catégorie."}
            </p>
            {activeTab === "all" && (
              <Button 
                className="mt-4" 
                onClick={() => router.push('/jobs')}
              >
                Voir les offres d&apos;emploi
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">
                          {application.jobTitle}
                        </h2>
                        <div className="flex flex-wrap items-center text-muted-foreground mb-4 gap-2">
                          <div className="flex items-center mr-4">
                            <Building className="h-4 w-4 mr-1" />
                            <span>{application.company}</span>
                          </div>
                          <div className="flex items-center mr-4">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{application.location}</span>
                          </div>
                          <div className="flex items-center mr-4">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{application.jobType}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Postuler le {formatDate(application.appliedAt)}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <Badge className={`${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">Lettre de motivation</h3>
                          <div className="bg-muted p-3 rounded-md text-sm">
                            <p className="whitespace-pre-line">{application.coverLetter}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" asChild>
                            <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="mr-2 h-4 w-4" />
                              Voir mon CV
                            </a>
                          </Button>
                          
                          {application.status === "interview" && (
                            <Button asChild>
                              <Link href={`/interviews/new?candidate=${session.user.id}&autostart=true`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Passer l&apos;entretien
                              </Link>
                            </Button>
                          )}
                          
                          <Button variant="outline" onClick={() => router.push(`/jobs/${application.jobId}`)}>
                            Voir l&apos;offre
                          </Button>
                        </div>
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