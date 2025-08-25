"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, FileText, User, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { JobApplication } from "@/types/job";

export default function ApplicationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Vérifier si l'utilisateur est un recruteur ou un administrateur
  const isRecruiter = session?.user?.role === "recruteur" || session?.user?.role === "admin";
  
  // Rediriger si l'utilisateur n'est pas un recruteur ou un administrateur
  useEffect(() => {
    if (session && !isRecruiter) {
      router.push("/");
    }
  }, [session, isRecruiter, router]);
  
  // Charger les candidatures depuis l'API
  useEffect(() => {
    const fetchApplications = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/jobs/applications');
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des candidatures: ${response.status}`);
        }
        
        const data = await response.json();
        setApplications(data);
        setFilteredApplications(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des candidatures:", err);
        setError("Impossible de charger les candidatures. Veuillez réessayer plus tard.");
        setApplications([]);
        setFilteredApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [session]);
  
  // Filtrer les candidatures par statut
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [statusFilter, applications]);
  
  // Mettre à jour le statut d'une candidature
  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/applications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: applicationId, status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du statut');
      }
      
      // Mettre à jour l'état local
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      toast({
        title: "Statut mis à jour",
        description: `Le statut de la candidature a été mis à jour avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la mise à jour du statut. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "reviewing":
        return "secondary";
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };
  
  // Obtenir le libellé du statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "reviewing":
        return "En cours d'examen";
      case "accepted":
        return "Acceptée";
      case "rejected":
        return "Refusée";
      default:
        return status;
    }
  };
  
  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "reviewing":
        return <FileText className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Candidatures</h1>
        </div>
        
        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="reviewing">En cours d&apos;examen</SelectItem>
              <SelectItem value="accepted">Acceptées</SelectItem>
              <SelectItem value="rejected">Refusées</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement des candidatures...</p>
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
              {statusFilter === "all" 
                ? "Vous n'avez pas encore reçu de candidatures." 
                : "Aucune candidature ne correspond à ce filtre."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold">{application.jobTitle}</h2>
                        <Badge variant={getStatusBadgeVariant(application.status)} className="ml-2">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(application.status)}
                            {getStatusLabel(application.status)}
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center text-muted-foreground mb-4 gap-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{application.candidateName}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Postuler le {formatDate(application.appliedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">Lettre de motivation</h3>
                        <div className="bg-muted p-3 rounded-md text-sm">
                          <p className="whitespace-pre-line">{application.coverLetter}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">CV</h3>
                        <Button variant="outline" asChild>
                          <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" /> Voir le CV
                          </a>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {application.status === "pending" && (
                        <>
                          <Button 
                            onClick={() => updateApplicationStatus(application.id, "reviewing")}
                            variant="outline"
                            className="w-full"
                          >
                            <FileText className="mr-2 h-4 w-4" /> Examiner
                          </Button>
                          <Button 
                            onClick={() => updateApplicationStatus(application.id, "rejected")}
                            variant="destructive"
                            className="w-full"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Refuser
                          </Button>
                        </>
                      )}
                      
                      {application.status === "reviewing" && (
                        <>
                          <Button 
                            onClick={() => updateApplicationStatus(application.id, "accepted")}
                            variant="default"
                            className="w-full"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Accepter
                          </Button>
                          <Button 
                            onClick={() => updateApplicationStatus(application.id, "rejected")}
                            variant="destructive"
                            className="w-full"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Refuser
                          </Button>
                        </>
                      )}
                      
                      {application.status === "accepted" && (
                        <Button 
                          onClick={() => updateApplicationStatus(application.id, "reviewing")}
                          variant="outline"
                          className="w-full"
                        >
                          <FileText className="mr-2 h-4 w-4" /> Réexaminer
                        </Button>
                      )}
                      
                      {application.status === "rejected" && (
                        <Button 
                          onClick={() => updateApplicationStatus(application.id, "reviewing")}
                          variant="outline"
                          className="w-full"
                        >
                          <FileText className="mr-2 h-4 w-4" /> Réexaminer
                        </Button>
                      )}
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