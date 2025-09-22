"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, FileText, Building, MapPin, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import axios from "axios";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { JobApplication } from "@/types/job";

export default function MyApplicationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Vérifier si l'utilisateur est un candidat
  const isCandidat = session?.user?.role === "candidat";
  
  // Rediriger si l'utilisateur n'est pas un candidat
  useEffect(() => {
    if (session && !isCandidat) {
      router.push("/");
    }
  }, [session, isCandidat, router]);
  
  // Charger les candidatures depuis l'API
  useEffect(() => {
    const fetchApplications = async () => {
      if (status !== "authenticated") return;
      
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/applications', {
          headers: {
            Authorization: `Bearer ${session.user.token || session.user.access_token}`
          }
        });
        setApplications(response.data);
        console.log(response.data);
        
        setFilteredApplications(response.data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des candidatures:", err);
        setError("Impossible de charger vos candidatures. Veuillez réessayer plus tard.");
        setApplications([]);
        setFilteredApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [status]);
  
  // Filtrer les candidatures en fonction de l'onglet actif
  useEffect(() => {
    const filtered = applications.filter(app => {
      if (activeTab === "all") return true;
      if (activeTab === "pending") return app.status === "pending" || app.status === "reviewing";
      if (activeTab === "accepted") return app.status === "accepted";
      if (activeTab === "rejected") return app.status === "rejected";
      return true;
    });
    setFilteredApplications(filtered);
  }, [activeTab, applications]);
  
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
          <h1 className="text-3xl font-bold">Mes candidatures</h1>
          <Button onClick={() => router.push('/jobs')} variant="outline">
            Voir les offres d&apos;emploi
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="pending">En cours</TabsTrigger>
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
              <Card key={application.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold">{application.job_title}</h2>
                        <Badge variant={getStatusBadgeVariant(application.status)} className="ml-2">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(application.status)}
                            {getStatusLabel(application.status)}
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center text-muted-foreground mb-4 gap-4">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          <span>{application.company}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{application.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Postuler le {formatDate(application.applied_at)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={() => router.push(`/jobs/applications/${application.id}`)}>
                            <FileText className="mr-2 h-4 w-4" /> Voir les détails
                          </Button>
                          
                          {application.status === "interview" && (
                            <Button asChild>
                              <Link href={`/interviews/new?candidate=${session.user.id}`}>
                                Passer l'entretien
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {application.status === "accepted" && (
                        <div className="mt-4 p-4 bg-green-50 rounded-md">
                          <p className="text-green-700 font-medium">Félicitations ! Votre candidature a été acceptée.</p>
                          <p className="text-green-600 mt-2">Le recruteur vous contactera prochainement pour la suite du processus.</p>
                          <div className="mt-3">
                            <Button asChild>
                              <Link href={`/interviews/new?candidate=${session.user.id}`}>
                                Passer à l'entretien
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {application.status === "rejected" && (
                        <div className="mt-4 p-4 bg-red-50 rounded-md">
                          <p className="text-red-700 font-medium">Votre candidature n&apos;a pas été retenue.</p>
                          <p className="text-red-600 mt-2">Nous vous encourageons à postuler à d&apos;autres offres qui correspondent à votre profil.</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Button 
                        onClick={() => router.push(`/jobs/${application.job_id}`)}
                        variant="outline"
                      >
                        Voir l&apos;offre
                      </Button>
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