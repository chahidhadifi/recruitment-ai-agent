"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, FileText, Building, MapPin, Calendar, BarChart, User, Briefcase, CheckCircle, XCircle, Filter } from "lucide-react";
import axios from "axios";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_RECRUTEUR_USER } from "@/types/user-roles";

export default function AnalyzedCandidatesPage() {
  const router = useRouter();
  const { data: realSession } = useSession();
  const session = realSession || { user: { ...DEFAULT_RECRUTEUR_USER, role: "recruteur" } };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null, success: null });

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Récupérer les candidatures analysées
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/applications?status=analyzed');
        setApplications(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des candidatures:', err);
        setError('Impossible de charger les candidatures. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/jobs/');
        setJobs(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des offres d\'emploi:', err);
      }
    };

    fetchApplications();
    fetchJobs();
  }, []);

  // Fonction pour mettre à jour le statut d'une candidature
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      setUpdateStatus({ loading: true, error: null });
      
      // Appel direct à l'API backend pour mettre à jour le statut
      await axios.put(`http://localhost:8000/api/applications/${applicationId}`, {
        status: newStatus
      });
      
      // Mettre à jour l'état local des candidatures
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      // Afficher un message de succès temporaire
      setUpdateStatus({ 
        loading: false, 
        error: null,
        success: `Candidature ${newStatus === 'accepted' ? 'acceptée' : 'rejetée'} avec succès`
      });
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setUpdateStatus(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setUpdateStatus({ 
        loading: false, 
        error: 'Impossible de mettre à jour le statut. Veuillez réessayer plus tard.',
        success: null
      });
    }
  };

  // Filtrer les candidatures en fonction de la recherche et du job sélectionné
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJob = selectedJobId === "all" || app.job_id.toString() === selectedJobId;
    
    return matchesSearch && matchesJob;
  });

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Candidats analysés</h1>
        </div>
        
        {updateStatus.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {updateStatus.error}
          </div>
        )}
        
        {updateStatus.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {updateStatus.success}
          </div>
        )}
        
        {updateStatus.loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Mise à jour du statut en cours...
          </div>
        )}

        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par poste ou entreprise..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={selectedJobId}
            onValueChange={setSelectedJobId}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrer par offre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les offres</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id.toString()}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Chargement des candidats analysés...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p>Aucun candidat analysé trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{application.job_title}</CardTitle>
                      <div className="flex items-center text-muted-foreground mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        <span>{application.company}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      Score: {application.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Candidat ID:</span>
                      <span className="ml-2">{application.candidate_id}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Analysé le:</span>
                      <span className="ml-2">{application.analyzed_at ? formatDate(application.analyzed_at) : 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-medium">Localisation:</span>
                      <span className="ml-2">{application.location || 'Non spécifiée'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      {application.qualified ? 
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : 
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                      <span className="font-medium">AI recommandation:</span>
                      <span className="ml-2">{application.qualified ? 'Qualifié' : 'Non qualifié'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2" />
                      <span className="font-medium">Statut:</span>
                      <span className="ml-2">
                        {application.status === 'accepted' ? (
                          <Badge className="bg-green-500">Accepté</Badge>
                        ) : application.status === 'rejected' ? (
                          <Badge className="bg-red-500">Rejeté</Badge>
                        ) : (
                          <Badge className="bg-blue-500">En attente de décision</Badge>
                        )}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Points forts:</h4>
                      <div className="text-sm">
                        {application.strengths ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {JSON.parse(application.strengths).map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>Aucun point fort spécifié</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Points faibles:</h4>
                      <div className="text-sm">
                        {application.weaknesses ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {JSON.parse(application.weaknesses).map((weakness, index) => (
                              <li key={index}>{weakness}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>Aucun point faible spécifié</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/jobs/applications/${application.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/jobs/${application.job_id}`)}
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Voir l'offre
                      </Button>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateApplicationStatus(application.id, 'accepted')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accepter
                      </Button>
                      
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
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