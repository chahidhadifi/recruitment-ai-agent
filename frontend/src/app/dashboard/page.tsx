"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BarChart, Users, Calendar, ArrowUpRight, FileText, MessageSquare, ChevronRight, LineChart, PieChart, Download, Filter } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

// Données fictives pour la démonstration
const mockStats = {
  totalCandidates: 156,
  newCandidatesThisWeek: 5,
  totalInterviews: 87,
  completedInterviews: 42,
  averageScore: 72,
  pendingReviews: 3,
  hiringRate: 18,
};

// Données mensuelles pour les graphiques
const mockMonthlyData = [
  { month: "Jan", candidates: 12, interviews: 8, hired: 2 },
  { month: "Fév", candidates: 15, interviews: 10, hired: 3 },
  { month: "Mar", candidates: 18, interviews: 12, hired: 2 },
  { month: "Avr", candidates: 22, interviews: 15, hired: 4 },
  { month: "Mai", candidates: 20, interviews: 14, hired: 3 },
  { month: "Juin", candidates: 25, interviews: 18, hired: 5 },
];

// Données par poste
const mockPositionData = [
  { position: "Développeur Frontend", candidates: 45, averageScore: 76 },
  { position: "Développeur Backend", candidates: 38, averageScore: 74 },
  { position: "UX Designer", candidates: 22, averageScore: 82 },
  { position: "Chef de Projet", candidates: 18, averageScore: 68 },
  { position: "DevOps", candidates: 15, averageScore: 79 },
  { position: "Data Scientist", candidates: 12, averageScore: 85 },
];

// Données de compétences
const mockSkillsData = [
  { skill: "JavaScript", score: 78 },
  { skill: "React", score: 82 },
  { skill: "Node.js", score: 75 },
  { skill: "Python", score: 80 },
  { skill: "SQL", score: 72 },
  { skill: "AWS", score: 68 },
];

const mockRecentCandidates = [
  {
    id: "1",
    name: "Jean Dupont",
    position: "Développeur Frontend",
    date: "2023-10-20",
    status: "En attente d'entretien",
  },
  {
    id: "2",
    name: "Marie Martin",
    position: "UX Designer",
    date: "2023-10-18",
    status: "Entretien terminé",
  },
  {
    id: "3",
    name: "Pierre Durand",
    position: "Développeur Backend",
    date: "2023-10-15",
    status: "CV analysé",
  },
];

const mockUpcomingInterviews = [
  {
    id: "3",
    candidateId: "1",
    candidateName: "Jean Dupont",
    position: "Développeur Frontend",
    date: "2023-10-25",
    time: "11:00",
  },
  {
    id: "4",
    candidateId: "3",
    candidateName: "Pierre Durand",
    position: "Développeur Backend",
    date: "2023-10-22",
    time: "15:30",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  return (
    <MainLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

        {/* Contrôles de filtrage et d'exportation */}
        {(session?.user?.role === "admin" || session?.user?.role === "recruteur") && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end mb-6 gap-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <select
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background appearance-none"
                  defaultValue="6m"
                >
                  <option value="1m">Dernier mois</option>
                  <option value="3m">3 derniers mois</option>
                  <option value="6m">6 derniers mois</option>
                  <option value="1y">Dernière année</option>
                  <option value="all">Tout</option>
                </select>
              </div>
            </div>
            
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filtres
            </Button>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground">Candidats</h2>
                <p className="text-3xl font-bold">{mockStats.totalCandidates}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 dark:text-green-400 font-medium">+{mockStats.newCandidatesThisWeek} </span>
              <span className="text-muted-foreground ml-1">cette semaine</span>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground">Entretiens</h2>
                <p className="text-3xl font-bold">{mockStats.totalInterviews}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 dark:text-green-400 font-medium">{mockStats.completedInterviews} </span>
              <span className="text-muted-foreground ml-1">terminés</span>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground">Score moyen</h2>
                <p className="text-3xl font-bold">{mockStats.averageScore}<span className="text-lg font-normal">/100</span></p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-yellow-500 dark:text-yellow-400 font-medium">{mockStats.pendingReviews} </span>
              <span className="text-muted-foreground ml-1">évaluations en attente</span>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground">Taux d&apos;embauche</h2>
                <p className="text-3xl font-bold">{mockStats.hiringRate}<span className="text-lg font-normal">%</span></p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 dark:text-green-400 font-medium">+5% </span>
              <span className="text-muted-foreground ml-1">par rapport à la période précédente</span>
            </div>
          </div>
        </div>

        {/* Graphiques pour les rôles admin et recruteur */}
        {(session?.user?.role === "admin" || session?.user?.role === "recruteur") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Tendances mensuelles */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Tendances mensuelles</h2>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-xs">Candidats</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs">Entretiens</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-xs">Embauches</span>
                  </div>
                </div>
              </div>
              
              <div className="h-64 flex items-end justify-between">
                {mockMonthlyData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex items-end h-48 mb-2">
                      <div 
                        className="w-4 bg-blue-500 rounded-t-sm mx-1" 
                        style={{ height: `${(data.candidates / 25) * 100}%` }}
                      ></div>
                      <div 
                        className="w-4 bg-green-500 rounded-t-sm mx-1" 
                        style={{ height: `${(data.interviews / 25) * 100}%` }}
                      ></div>
                      <div 
                        className="w-4 bg-purple-500 rounded-t-sm mx-1" 
                        style={{ height: `${(data.hired / 25) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Répartition par poste */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Répartition par poste</h2>
              
              <div className="space-y-4">
                {mockPositionData.map((data, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{data.position}</span>
                      <span className="text-sm">{data.candidates} candidats</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${(data.candidates / mockStats.totalCandidates) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-muted-foreground">Score moyen: {data.averageScore}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compétences et statistiques d'entretien pour les rôles admin et recruteur */}
        {(session?.user?.role === "admin" || session?.user?.role === "recruteur") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Compétences les plus demandées */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Compétences les plus demandées</h2>
              
              <div className="space-y-4">
                {mockSkillsData.map((data, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{data.skill}</span>
                      <span className="text-sm">{data.score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${index % 3 === 0 ? 'bg-blue-500' : index % 3 === 1 ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${data.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Statistiques d'entretien */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Statistiques d&apos;entretien</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                    <BarChart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">24 min</h3>
                  <p className="text-sm text-muted-foreground">Durée moyenne d&apos;entretien</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                    <LineChart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">12</h3>
                  <p className="text-sm text-muted-foreground">Questions moyennes par entretien</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                    <PieChart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">68%</h3>
                  <p className="text-sm text-muted-foreground">Taux de réponse correct</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">2.4</h3>
                  <p className="text-sm text-muted-foreground">Jours pour compléter l&apos;évaluation</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidats récents */}
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Candidats récents</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/candidates" className="flex items-center">
                  Voir tous <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {mockRecentCandidates.map((candidate) => (
                <div 
                  key={candidate.id} 
                  className="p-4 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
                  onClick={() => router.push(`/candidates/${candidate.id}`)}
                >
                  <div>
                    <h3 className="font-medium">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(candidate.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        candidate.status === "Entretien terminé"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : candidate.status === "En attente d'entretien"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {candidate.status}
                    </span>
                    <ArrowUpRight className="h-4 w-4 ml-2 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
            {session?.user?.role !== "admin" && (
              <div className="p-4 border-t">
                <Button className="w-full" asChild>
                  <Link href="/candidates/new">
                    <FileText className="mr-2 h-4 w-4" /> Ajouter un candidat
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Entretiens à venir */}
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Entretiens à venir</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/interviews" className="flex items-center">
                  Voir tous <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {mockUpcomingInterviews.length > 0 ? (
              <div className="divide-y divide-border">
                {mockUpcomingInterviews.map((interview) => (
                  <div 
                    key={interview.id} 
                    className="p-4 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
                    onClick={() => router.push(`/interviews/${interview.id}`)}
                  >
                    <div>
                      <h3 className="font-medium">{interview.candidateName}</h3>
                      <p className="text-sm text-muted-foreground">{interview.position}</p>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(interview.date).toLocaleDateString('fr-FR')} à {interview.time}
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/interviews/new?candidate=${interview.candidateId}`);
                      }}
                    >
                      <MessageSquare className="mr-2 h-3 w-3" /> Démarrer
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">Aucun entretien planifié</p>
              </div>
            )}
            {session?.user?.role !== "admin" && (
              <div className="p-4 border-t">
                <Button className="w-full" asChild>
                  <Link href="/interviews/new">
                    <MessageSquare className="mr-2 h-4 w-4" /> Planifier un entretien
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}