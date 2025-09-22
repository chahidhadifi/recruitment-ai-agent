"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Building, MapPin, Calendar, FileText, Phone, MapPin as LocationIcon, User } from "lucide-react";
import axios from "axios";
import React from "react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { JobApplication } from "@/types/job";

export default function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier si l&apos;utilisateur est authentifié
  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, router]);
  
  // Charger les détails de la candidature depuis l'API
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        
        // Récupérer les détails de la candidature depuis l'API backend
        const response = await axios.get(`http://localhost:8000/api/applications/${params.id}`, {
          headers: {
            Authorization: `Bearer ${session.user.token || session.user.access_token}`
          }
        });
        
        setApplication(response.data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des détails de la candidature:", err);
        setError("Impossible de charger les détails de la candidature. Veuillez réessayer plus tard.");
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [session, params.id]);
  
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
      case "interview":
        return "primary";
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
        return "En cours d&apos;examen";
      case "accepted":
        return "Acceptée";
      case "rejected":
        return "Refusée";
      case "interview":
        return "Entretien planifié";
      default:
        return status;
    }
  };

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Chargement des détails de la candidature...</p>
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
        ) : application ? (
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold">{application.job_title}</CardTitle>
                    <div className="flex items-center mt-2">
                      <Badge variant={getStatusBadgeVariant(application.status)} className="mr-2">
                        {getStatusLabel(application.status)}
                      </Badge>
                      <span className="text-muted-foreground">Candidature #{application.id}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => router.push(`/jobs/${application.job_id}`)}
                    variant="outline"
                  >
                    Voir l&apos;offre
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informations sur la candidature</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Building className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Entreprise</p>
                          <p className="text-muted-foreground">{application.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Date de candidature</p>
                          <p className="text-muted-foreground">{formatDate(application.applied_at)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <LocationIcon className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Localisation</p>
                          <p className="text-muted-foreground">{application.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Téléphone</p>
                          <p className="text-muted-foreground">{application.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Documents</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="font-medium mb-2">CV</p>
                        <Button variant="outline" asChild className="w-full justify-start">
                          <a 
                            href={`http://localhost:8000${application.cv_url}`} 
                            download
                          >
                            <FileText className="mr-2 h-4 w-4" /> Télécharger le CV
                          </a>
                        </Button>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2">Lettre de motivation</p>
                        {application.cover_letter && application.cover_letter.startsWith('/api/files/') ? (
                          <Button variant="outline" asChild className="w-full justify-start mb-2">
                            <a 
                              href={`http://localhost:8000${application.cover_letter}`} 
                              download
                            >
                              <FileText className="mr-2 h-4 w-4" /> Télécharger la lettre de motivation
                            </a>
                          </Button>
                        ) : (
                          <div className="bg-muted p-4 rounded-md">
                            <p className="whitespace-pre-line text-sm">{application.cover_letter}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {application.status === "accepted" && (
                  <div className="mt-8 p-4 bg-green-50 rounded-md">
                    <p className="text-green-700 font-medium">Cette candidature a été acceptée.</p>
                    <p className="text-green-600 mt-2">Le candidat a été informé de la décision.</p>
                  </div>
                )}
                
                {application.status === "rejected" && (
                  <div className="mt-8 p-4 bg-red-50 rounded-md">
                    <p className="text-red-700 font-medium">Cette candidature a été refusée.</p>
                    <p className="text-red-600 mt-2">Le candidat a été informé de la décision.</p>
                  </div>
                )}
                
                {application.status === "interview" && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-md">
                    <p className="text-blue-700 font-medium">Un entretien a été planifié pour cette candidature.</p>
                    <p className="text-blue-600 mt-2">Le candidat a été invité à passer l&apos;entretien.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Candidature non trouvée</h2>
            <p className="text-muted-foreground">La candidature que vous recherchez n&apos;existe pas ou a été supprimée.</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/jobs/my-applications')}
            >
              Voir mes candidatures
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}