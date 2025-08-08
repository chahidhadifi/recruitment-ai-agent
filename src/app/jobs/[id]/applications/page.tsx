"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Calendar } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Job, JobApplication } from "@/types/job";

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est un recruteur ou un administrateur
  const isRecruiterOrAdmin = session?.user?.role === "recruteur" || session?.user?.role === "admin";

  // Rediriger si l'utilisateur n'est pas un recruteur ou un administrateur
  useEffect(() => {
    if (status === "authenticated" && !isRecruiterOrAdmin) {
      router.push(`/jobs/${jobId}`);
    }
  }, [status, isRecruiterOrAdmin, router, jobId]);

  // Charger les informations de l'offre d'emploi et ses candidatures
  useEffect(() => {
    if (status === "authenticated" && isRecruiterOrAdmin && jobId) {
      const fetchJobAndApplications = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Appel à l'API pour récupérer les candidatures pour cette offre
          const response = await fetch(`/api/applications?jobId=${jobId}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erreur lors de la récupération des candidatures");
          }
          
          const applicationsData = await response.json();
          setApplications(applicationsData);
          
          // Simuler un appel API pour récupérer les informations de l'offre
          // Dans une application réelle, vous feriez un appel à votre API pour récupérer les détails du job
          const mockJobs = {
            "1": { 
              id: "1",
              title: "Développeur Frontend React", 
              company: "TechSolutions",
              location: "Paris, France",
              type: "CDI",
              salary: "45 000€ - 60 000€",
              postedDate: "2023-05-01T10:00:00Z",
              applications: applicationsData.length
            },
            "2": { 
              id: "2",
              title: "Développeur Backend Node.js", 
              company: "WebInnovate",
              location: "Lyon, France",
              type: "CDI",
              salary: "50 000€ - 65 000€",
              postedDate: "2023-05-03T14:30:00Z",
              applications: 0
            },
            "3": { 
              id: "3",
              title: "UX/UI Designer", 
              company: "DesignStudio",
              location: "Bordeaux, France",
              type: "Freelance",
              salary: "400€ - 500€ / jour",
              postedDate: "2023-05-02T09:15:00Z",
              applications: 0
            },
            "4": { 
              id: "4",
              title: "Data Scientist", 
              company: "DataInsight",
              location: "Toulouse, France",
              type: "CDI",
              salary: "55 000€ - 70 000€",
              postedDate: "2023-05-05T11:45:00Z",
              applications: 0
            },
            "5": { 
              id: "5",
              title: "DevOps Engineer", 
              company: "CloudTech",
              location: "Lille, France",
              type: "CDD",
              salary: "45 000€ - 55 000€",
              postedDate: "2023-05-04T16:20:00Z",
              applications: 0
            }
          };
          
          const selectedJob = mockJobs[jobId as keyof typeof mockJobs];
          
          if (!selectedJob) {
            throw new Error("Offre d'emploi non trouvée");
          }
          
          setJob(selectedJob as Job);
          
        } catch (err) {
          console.error("Erreur lors du chargement des données:", err);
          setError(err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des données. Veuillez réessayer.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchJobAndApplications();
    }
  }, [status, isRecruiterOrAdmin, jobId]);

  // Fonction pour mettre à jour le statut d'une candidature
  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      // Mise à jour optimiste de l'interface
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as any, updatedAt: new Date().toISOString() } 
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
      case "interview":
        return "primary";
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
        return "En cours d'examen";
      case "interview":
        return "Entretien planifié";
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
        <Button variant="outline" onClick={() => router.push(`/jobs/${jobId}`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;offre
        </Button>
        
        {job && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">{job.company} - {job.location}</p>
            <div className="flex items-center gap-2">
              <Badge>{job.type}</Badge>
              {job.salary && <Badge variant="outline">{job.salary}</Badge>}
            </div>
          </div>
        )}
        
        <h2 className="text-2xl font-semibold mb-6">Candidatures ({applications.length})</h2>
        
        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map(application => (
              <Card key={application.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      {application.candidateName}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(application.status) as any}>
                      {translateStatus(application.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Informations du candidat</h3>
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
                          
                          {application.status !== "interview" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateApplicationStatus(application.id, "interview");
                                // Rediriger vers la page d'entretien après la mise à jour du statut
                                setTimeout(() => {
                                  router.push(`/interviews/new?candidateId=${application.candidateId}&applicationId=${application.id}&jobId=${jobId}`);
                                }, 500);
                              }}
                            >
                              <Calendar className="mr-2 h-4 w-4" /> Planifier un entretien
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              asChild
                            >
                              <Link href={`/interviews/new?candidateId=${application.candidateId}&applicationId=${application.id}&jobId=${jobId}`}>
                                Voir l&apos;entretien
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40 bg-muted rounded-md">
            <p className="text-muted-foreground">Aucune candidature pour cette offre d&apos;emploi.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}