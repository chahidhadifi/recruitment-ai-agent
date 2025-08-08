"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { JobApplication } from "@/types/job";

export default function ApplicationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<{[key: string]: {title: string, company: string}}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est un recruteur ou un administrateur
  const isRecruiterOrAdmin = session?.user?.role === "recruteur" || session?.user?.role === "admin";

  // Rediriger si l'utilisateur n'est pas authentifié ou n'est pas un recruteur ou un administrateur
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && !isRecruiterOrAdmin) {
      router.push("/jobs");
    }
  }, [status, isRecruiterOrAdmin, router]);
  
  // Déplacé après les hooks useEffect

  // Ce bloc est supprimé car il est dupliqué plus bas dans le code

  // Ce bloc a été supprimé car il est dupliqué plus bas dans le code

  // Ces fonctions ont été déplacées plus bas dans le code pour éviter les duplications

  // Charger les candidatures
  useEffect(() => {
    if (status === "authenticated" && isRecruiterOrAdmin) {
      const fetchApplications = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Appel à l'API pour récupérer les candidatures
          const response = await fetch('/api/applications');
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erreur lors de la récupération des candidatures");
          }
          
          const applicationsData = await response.json();
          
          // Simuler un appel API pour récupérer les informations des offres d'emploi
          // Dans une application réelle, vous auriez une API pour récupérer ces informations
          const mockJobs = {
            "1": { title: "Développeur Frontend React", company: "TechSolutions" },
            "2": { title: "Développeur Backend Node.js", company: "WebInnovate" },
            "3": { title: "UX/UI Designer", company: "DesignStudio" },
            "4": { title: "Data Scientist", company: "DataInsight" },
            "5": { title: "DevOps Engineer", company: "CloudTech" }
          };
          
          setApplications(applicationsData);
          setJobs(mockJobs);
        } catch (err) {
          console.error("Erreur lors du chargement des candidatures:", err);
          setError(err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des candidatures. Veuillez réessayer.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchApplications();
    }
  }, [status, isRecruiterOrAdmin]);

  // Fonction pour mettre à jour le statut d'une candidature
  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      // Mise à jour optimiste de l'interface
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as JobApplication['status'], updatedAt: new Date().toISOString() } 
            : app
        )
      );
      
      // Appel à l'API pour mettre à jour le statut
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour du statut");
      }
      
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la candidature a été mis à jour avec succès.",
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue lors de la mise à jour du statut. Veuillez réessayer.",
        variant: "destructive",
      });
      
      // Annuler la mise à jour optimiste en cas d'erreur
      setApplications(prevApplications => [...prevApplications]);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy à HH:mm", { locale: fr });
  };

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "reviewing":
        return "warning";
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Fonction pour traduire le statut en français
  const translateStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "reviewing":
        return "En cours d&apos;examen";
      case "accepted":
        return "Acceptée";
      case "rejected":
        return "Refusée";
      default:
        return status;
    }
  };

  // Si l'utilisateur n'est pas connecté, afficher un message de chargement
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <MainLayout>
        <div className="container py-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Si une erreur s'est produite, afficher un message d'erreur
  if (error) {
    return (
      <MainLayout>
        <div className="container py-10">
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-destructive text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Gestion des candidatures</h1>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="reviewing">En cours d&apos;examen</TabsTrigger>
            <TabsTrigger value="accepted">Acceptées</TabsTrigger>
            <TabsTrigger value="rejected">Refusées</TabsTrigger>
          </TabsList>
          
          {["all", "pending", "reviewing", "accepted", "rejected"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              <div className="space-y-6">
                {applications
                  .filter(app => tabValue === "all" || app.status === tabValue)
                  .map(application => (
                    <Card key={application.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">
                              {jobs[application.jobId]?.title || "Offre inconnue"}
                            </CardTitle>
                            <p className="text-muted-foreground">
                              {jobs[application.jobId]?.company || "Entreprise inconnue"}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(application.status)}>
                            {translateStatus(application.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Informations du candidat</h3>
                            <p><span className="font-medium">Nom:</span> {application.candidateName}</p>
                            <p><span className="font-medium">Email:</span> {application.candidateEmail}</p>
                            <p><span className="font-medium">Candidature soumise le:</span> {formatDate(application.appliedAt)}</p>
                            {application.updatedAt !== application.appliedAt && (
                              <p><span className="font-medium">Dernière mise à jour:</span> {formatDate(application.updatedAt)}</p>
                            )}
                            <div className="mt-4">
                              <Button variant="outline" size="sm" asChild>
                                <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                                  Voir le CV
                                </a>
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-2">Lettre de motivation</h3>
                            <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                              <p className="whitespace-pre-wrap">{application.coverLetter}</p>
                            </div>
                            
                            <div className="mt-6">
                              <h3 className="font-semibold mb-2">Actions</h3>
                              <div className="flex flex-wrap gap-2">
                                {application.status !== "reviewing" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateApplicationStatus(application.id, "reviewing")}
                                  >
                                    Marquer en cours d&apos;examen
                                  </Button>
                                )}
                                
                                {application.status !== "accepted" && (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => updateApplicationStatus(application.id, "accepted")}
                                  >
                                    Accepter
                                  </Button>
                                )}
                                
                                {application.status !== "rejected" && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => updateApplicationStatus(application.id, "rejected")}
                                  >
                                    Refuser
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                {applications.filter(app => tabValue === "all" || app.status === tabValue).length === 0 && (
                  <div className="flex justify-center items-center h-40 bg-muted rounded-md">
                    <p className="text-muted-foreground">Aucune candidature {tabValue !== "all" ? `${translateStatus(tabValue).toLowerCase()}` : ""} trouvée.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}