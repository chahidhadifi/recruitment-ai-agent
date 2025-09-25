"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Clock, FileText, User, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RecruiterResultsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Vérifier si l'utilisateur est un recruteur
  const isRecruiter = session?.user?.role === "recruteur" || session?.user?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session && !isRecruiter) {
      router.push("/");
      return;
    }

    if (status === "authenticated" && isRecruiter) {
      fetchData();
    }
  }, [status, session, isRecruiter, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les candidatures avec statut "accepted"
      const applicationsResponse = await axios.get('http://localhost:8000/api/applications/', {
        params: { status: 'accepted' }
      });
      
      // Récupérer tous les entretiens
      const interviewsResponse = await axios.get('http://localhost:8000/api/interviews/');
      
      // Filtrer les entretiens qui correspondent aux candidatures acceptées
      const acceptedApplications = applicationsResponse.data || [];
      const allInterviews = interviewsResponse.data || [];
      
      // Associer les entretiens aux candidatures
      const enrichedApplications = acceptedApplications.map(app => {
        const relatedInterview = allInterviews.find(interview => 
          interview.application_id === app.id || interview.candidate_id === app.candidate_id
        );
        return {
          ...app,
          interview: relatedInterview || null
        };
      });
      
      setApplications(enrichedApplications);
      setInterviews(allInterviews);
      
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (application) => {
    const interview = application.interview;
    if (interview) {
      setSelectedInterview(interview);
      setIsDialogOpen(true);
    } else {
      toast({
        title: "Information manquante",
        description: "Aucun rapport d'entretien disponible pour ce candidat.",
        variant: "default",
      });
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/applications/${applicationId}`, {
        status: newStatus
      });
      
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la candidature a été mis à jour avec succès.",
        variant: "default",
      });
      
      // Rafraîchir les données
      fetchData();
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Accepté</Badge>;
      case 'accepted_after_interview':
        return <Badge variant="outline" className="bg-green-200 text-green-800">Accepté après entretien</Badge>;
      case 'rejected_after_interview':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Refusé après entretien</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (status === "loading" || loading) {
    return (
      <MainLayout>
        <div className="container py-10 flex justify-center items-center">
          <p>Chargement...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Résultats des entretiens</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidats en attente de décision finale</CardTitle>
            <CardDescription>
              Consultez les résultats des entretiens et prenez une décision pour chaque candidat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Aucun candidat en attente de décision finale.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.candidateName || `Candidat #${application.candidate_id}`}</TableCell>
                      <TableCell>{application.jobTitle || `Poste #${application.job_id}`}</TableCell>
                      <TableCell>
                        {application.interview?.score ? (
                          <span className="font-semibold">{application.interview.score}/100</span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewReport(application)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Rapport
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-green-50 hover:bg-green-100 text-green-700"
                            onClick={() => handleUpdateStatus(application.id, 'accepted_after_interview')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accepter
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 text-red-700"
                            onClick={() => handleUpdateStatus(application.id, 'rejected_after_interview')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialogue pour afficher le rapport détaillé */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Rapport d'entretien détaillé</DialogTitle>
              <DialogDescription>
                Résultats complets de l'entretien du candidat
              </DialogDescription>
            </DialogHeader>
            
            {selectedInterview && (
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Candidat</h3>
                    <p className="text-lg font-semibold">{selectedInterview.candidate_name || `Candidat #${selectedInterview.candidate_id}`}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Poste</h3>
                    <p className="text-lg font-semibold">{selectedInterview.position}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date de l'entretien</h3>
                    <p className="text-lg font-semibold">{new Date(selectedInterview.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Score global</h3>
                    <p className="text-lg font-semibold">{selectedInterview.score ? `${selectedInterview.score}/100` : 'N/A'}</p>
                  </div>
                </div>

                <Separator />

                <Tabs defaultValue="summary">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="summary">Résumé</TabsTrigger>
                    <TabsTrigger value="detailed">Scores détaillés</TabsTrigger>
                    <TabsTrigger value="questions">Analyse par question</TabsTrigger>
                    <TabsTrigger value="assessment">Évaluation globale</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Résumé de l'entretien</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedInterview.interview_summary ? (
                          <div className="prose max-w-none">
                            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(selectedInterview.interview_summary, null, 2)}</pre>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Aucun résumé disponible</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="detailed" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Scores détaillés</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedInterview.detailed_scores ? (
                          <div className="prose max-w-none">
                            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(selectedInterview.detailed_scores, null, 2)}</pre>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Aucun score détaillé disponible</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="questions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Analyse par question</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedInterview.question_by_question_analysis ? (
                          <div className="prose max-w-none">
                            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(selectedInterview.question_by_question_analysis, null, 2)}</pre>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Aucune analyse par question disponible</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="assessment" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Évaluation globale</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedInterview.overall_assessment ? (
                          <div className="prose max-w-none">
                            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(selectedInterview.overall_assessment, null, 2)}</pre>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Aucune évaluation globale disponible</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}