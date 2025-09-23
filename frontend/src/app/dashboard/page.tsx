"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BarChart, Users, Calendar, ArrowUpRight, FileText, MessageSquare, ChevronRight, LineChart, PieChart, Download, Filter } from "lucide-react";
import axios from "axios";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

// Types pour les données du dashboard
interface DashboardStats {
  totalCandidates: number;
  newCandidatesThisWeek: number;
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  pendingReviews: number;
  hiringRate: number;
}

interface MonthlyData {
  month: string;
  candidates: number;
  interviews: number;
  hired: number;
}

interface PositionData {
  position: string;
  candidates: number;
  averageScore: number;
}

interface SkillsData {
  skill: string;
  score: number;
}

interface RecentCandidate {
  id: string;
  name: string;
  position: string;
  date: string;
  status: string;
}

interface UpcomingInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  date: string;
  time: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour stocker les données du dashboard
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    newCandidatesThisWeek: 0,
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    pendingReviews: 0,
    hiringRate: 0,
  });
  
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [positionData, setPositionData] = useState<PositionData[]>([]);
  const [skillsData, setSkillsData] = useState<SkillsData[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([]);
  
  // Fonction pour charger les données du dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les statistiques des utilisateurs
        const userStatsResponse = await axios.get('http://localhost:8000/api/users/stats')
          .catch(error => {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw new Error('Impossible de récupérer les statistiques des utilisateurs');
          });
        
        // Récupérer les candidatures
        const applicationsResponse = await axios.get('http://localhost:8000/api/applications/')
          .catch(error => {
            console.error('Erreur lors de la récupération des candidatures:', error);
            throw new Error('Impossible de récupérer les candidatures');
          });
        
        // Récupérer les entretiens
        const interviewsResponse = await axios.get('http://localhost:8000/api/interviews/')
          .catch(error => {
            console.error('Erreur lors de la récupération des entretiens:', error);
            throw new Error('Impossible de récupérer les entretiens');
          });
        
        // Récupérer les offres d'emploi
        const jobsResponse = await axios.get('http://localhost:8000/api/jobs/')
          .catch(error => {
            console.error('Erreur lors de la récupération des offres d\'emploi:', error);
            throw new Error('Impossible de récupérer les offres d\'emploi');
          });
        
        // Extraire les données des réponses API
        const applications = applicationsResponse.data || [];
        const interviews = interviewsResponse.data || [];
        const jobs = jobsResponse.data || [];
        const userStats = userStatsResponse.data || { candidateCount: 0 };
        
        console.log('API Data:', { userStats, applications, interviews, jobs });
        
        // Calculer les statistiques générales
        const totalCandidates = userStats.candidateCount || 0;
        const totalInterviews = interviews.length;
        const completedInterviews = interviews.filter(i => i.status === 'completed').length;
        
        // Calculer le score moyen des entretiens
        const interviewScores = interviews
          .filter(i => i.score !== null && i.score !== undefined)
          .map(i => parseFloat(i.score));
        const averageScore = interviewScores.length > 0 
          ? parseFloat((interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length).toFixed(1)) 
          : 0;
        
        // Calculer le taux d'embauche (candidatures acceptées / total)
        const acceptedApplications = applications.filter(a => a.status === 'accepted').length;
        const hiringRate = applications.length > 0 
          ? parseFloat(((acceptedApplications / applications.length) * 100).toFixed(1)) 
          : 0;
        
        // Calculer les candidats de la semaine dernière
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newCandidatesThisWeek = applications.filter(a => {
          const appliedDate = new Date(a.applied_at || a.created_at);
          return appliedDate >= oneWeekAgo;
        }).length;
        
        // Mettre à jour les statistiques
        setStats({
          totalCandidates,
          newCandidatesThisWeek,
          totalInterviews,
          completedInterviews,
          averageScore,
          pendingReviews: applications.filter(a => a.status === 'pending').length,
          hiringRate,
        });
        
        // Préparer les données mensuelles
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const currentMonth = new Date().getMonth();
        
        // Fonction pour vérifier si une date est valide
        const isValidDate = (dateStr: string | null | undefined): boolean => {
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return !isNaN(date.getTime());
        };
        
        const monthlyDataCalculated = months.slice(0, currentMonth + 1).map(month => {
          const monthIndex = months.indexOf(month);
          
          // Filtrer les candidatures par mois
          const monthCandidates = applications.filter(a => {
            if (!isValidDate(a.applied_at) && !isValidDate(a.created_at)) return false;
            const date = new Date(a.applied_at || a.created_at);
            return date.getMonth() === monthIndex;
          }).length;
          
          // Filtrer les entretiens par mois
          const monthInterviews = interviews.filter(i => {
            if (!isValidDate(i.date)) return false;
            const date = new Date(i.date);
            return date.getMonth() === monthIndex;
          }).length;
          
          // Filtrer les embauches par mois
          const monthHired = applications.filter(a => {
            if (!isValidDate(a.updated_at) && !isValidDate(a.applied_at) && !isValidDate(a.created_at)) return false;
            const date = new Date(a.updated_at || a.applied_at || a.created_at);
            return date.getMonth() === monthIndex && a.status === 'accepted';
          }).length;
          
          return {
            month,
            candidates: monthCandidates,
            interviews: monthInterviews,
            hired: monthHired
          };
        });
        
        setMonthlyData(monthlyDataCalculated);
        
        // Préparer les données par poste
        const positionMap = new Map();
        
        // Regrouper les candidatures par poste
        applications.forEach(app => {
          // Trouver le job correspondant à la candidature
          const job = jobs.find(j => j.id === app.job_id);
          const position = job ? job.title : (app.position || 'Poste non spécifié');
          
          if (!positionMap.has(position)) {
            positionMap.set(position, { candidates: 0, scores: [] });
          }
          positionMap.get(position).candidates += 1;
          
          // Ajouter le score s'il existe
          if (app.score !== null && app.score !== undefined) {
            const score = parseFloat(app.score);
            if (!isNaN(score)) {
              positionMap.get(position).scores.push(score);
            }
          }
        });
        
        // Calculer le score moyen par poste
        const positionDataCalculated = Array.from(positionMap.entries())
          .map(([position, data]) => {
            const averageScore = data.scores.length > 0 
              ? parseFloat((data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)) 
              : 0;
            
            return {
              position,
              candidates: data.candidates,
              averageScore
            };
          })
          // Trier par nombre de candidats (décroissant)
          .sort((a, b) => b.candidates - a.candidates);
        
        setPositionData(positionDataCalculated);
        
        // Préparer les données de compétences (basées sur les exigences des offres d'emploi)
        const skillsMap = new Map();
        
        // Extraire les compétences des exigences des offres d'emploi
        jobs.forEach(job => {
          if (job && job.requirements) {
            // Gérer à la fois les tableaux et les chaînes de caractères
            const requirementsArray = Array.isArray(job.requirements) 
              ? job.requirements 
              : [job.requirements];
              
            requirementsArray.forEach(req => {
              if (req) {
                // Extraire les compétences techniques des exigences
                const skills = extractSkills(String(req));
                skills.forEach(skill => {
                  if (!skillsMap.has(skill)) {
                    skillsMap.set(skill, { count: 0, score: 0 });
                  }
                  skillsMap.get(skill).count += 1;
                  
                  // Attribuer un score basé sur la fréquence avec un plafond
                  skillsMap.get(skill).score = Math.min(100, 50 + (skillsMap.get(skill).count * 5));
                });
              }
            });
          }
        });
        
        // Convertir la map en tableau et trier par score puis par nom en cas d'égalité
        const skillsDataCalculated = Array.from(skillsMap.entries())
          .map(([skill, data]) => ({
            skill,
            score: data.score
          }))
          .sort((a, b) => b.score - a.score || a.skill.localeCompare(b.skill))
          .slice(0, 6); // Prendre les 6 compétences les plus demandées
        
        setSkillsData(skillsDataCalculated);
        
        // Préparer les données des candidats récents
        const recentCandidatesData = applications
          .filter(app => isValidDate(app.applied_at) || isValidDate(app.created_at))
          .sort((a, b) => {
            try {
              const dateA = new Date(a.applied_at || a.created_at);
              const dateB = new Date(b.applied_at || b.created_at);
              return dateB.getTime() - dateA.getTime();
            } catch (e) {
              return 0; // En cas d'erreur, ne pas modifier l'ordre
            }
          })
          .slice(0, 3)
          .map(app => {
            const job = jobs.find(j => j.id === app.job_id);
            let formattedDate = 'Date inconnue';
            try {
              const appliedDate = new Date(app.applied_at || app.created_at);
              if (!isNaN(appliedDate.getTime())) {
                formattedDate = appliedDate.toISOString().split('T')[0];
              }
            } catch (e) {
              console.error('Erreur de formatage de date:', e);
            }
            return {
              id: app.id.toString(),
              name: app.candidate_name || 'Candidat ' + app.candidate_id,
              position: job ? job.title : (app.position || 'Poste inconnu'),
              date: formattedDate,
              status: getStatusLabel(app.status)
            };
          });
        
        setRecentCandidates(recentCandidatesData);
        
        // Préparer les données des entretiens à venir
        const now = new Date();
        const upcomingInterviewsData = interviews
          .filter(interview => {
            // Vérifier si la date est valide
            if (!interview.date) return false;
            
            try {
              const interviewDate = new Date(interview.date);
              // Vérifier si la date est valide et future
              return !isNaN(interviewDate.getTime()) && 
                     interviewDate > now && 
                     interview.status !== 'cancelled';
            } catch (e) {
              console.error('Date invalide pour entretien:', interview.id);
              return false;
            }
          })
          .sort((a, b) => {
            try {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            } catch (e) {
              return 0; // En cas d'erreur, ne pas modifier l'ordre
            }
          })
          .slice(0, 2)
          .map(interview => {
            try {
              const interviewDate = new Date(interview.date);
              if (isNaN(interviewDate.getTime())) throw new Error('Date invalide');
              
              return {
                id: interview.id.toString(),
                candidateId: interview.candidate_id ? interview.candidate_id.toString() : '',
                candidateName: interview.candidate_name || (interview.candidate_id ? 'Candidat ' + interview.candidate_id : 'Candidat inconnu'),
                position: interview.position || 'Poste non spécifié',
                date: interviewDate.toISOString().split('T')[0],
                time: interviewDate.toTimeString().split(' ')[0].substring(0, 5)
              };
            } catch (e) {
              console.error('Erreur lors du traitement de l\'entretien:', e);
              return {
                id: interview.id ? interview.id.toString() : 'unknown',
                candidateId: interview.candidate_id ? interview.candidate_id.toString() : '',
                candidateName: interview.candidate_name || 'Candidat inconnu',
                position: interview.position || 'Poste non spécifié',
                date: 'Date invalide',
                time: '--:--'
              };
            }
          });
        
        setUpcomingInterviews(upcomingInterviewsData);
        
      } catch (err) {
        console.error("Erreur lors du chargement des données du dashboard:", err);
        setError("Une erreur est survenue lors du chargement des données. Veuillez réessayer.");
        
        // Initialiser avec des données vides en cas d'erreur
        setStats({
          totalCandidates: 0,
          newCandidatesThisWeek: 0,
          totalInterviews: 0,
          completedInterviews: 0,
          averageScore: 0,
          pendingReviews: 0,
          hiringRate: 0,
        });
        
        setMonthlyData([
          { month: "Jan", candidates: 0, interviews: 0, hired: 0 },
          { month: "Fév", candidates: 0, interviews: 0, hired: 0 },
          { month: "Mar", candidates: 0, interviews: 0, hired: 0 },
          { month: "Avr", candidates: 0, interviews: 0, hired: 0 },
          { month: "Mai", candidates: 0, interviews: 0, hired: 0 },
          { month: "Juin", candidates: 0, interviews: 0, hired: 0 },
        ]);
        
        setPositionData([
          { position: "Développeur Frontend", candidates: 0, averageScore: 0 },
          { position: "Développeur Backend", candidates: 0, averageScore: 0 },
          { position: "UX Designer", candidates: 0, averageScore: 0 },
        ]);
        
        setSkillsData([
          { skill: "JavaScript", score: 0 },
          { skill: "React", score: 0 },
          { skill: "Node.js", score: 0 },
        ]);
        
        setRecentCandidates([]);
        setUpcomingInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Fonction pour extraire les compétences techniques des exigences
  const extractSkills = (requirement: string): string[] => {
    const commonSkills = [
      "JavaScript", "React", "Angular", "Vue", "Node.js", "Python", "Java", "C#", 
      "PHP", "Ruby", "Go", "Rust", "SQL", "NoSQL", "MongoDB", "PostgreSQL", 
      "MySQL", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "DevOps", "CI/CD",
      "Git", "TypeScript", "HTML", "CSS", "SASS", "LESS", "Redux", "GraphQL",
      "REST", "API", "Microservices", "Agile", "Scrum", "Kanban", "TDD", "BDD"
    ];
    
    return commonSkills.filter(skill => 
      requirement.toLowerCase().includes(skill.toLowerCase())
    );
  };
  
  // Fonction pour obtenir le libellé du statut en français
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'En attente',
      'reviewed': 'CV analysé',
      'interview': 'En attente d\'entretien',
      'accepted': 'Accepté',
      'rejected': 'Refusé',
      'analyzed': 'Analysé'
    };
    
    return statusMap[status] || status;
  };

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
                <p className="text-3xl font-bold">{stats.totalCandidates}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 dark:text-green-400 font-medium">+{stats.newCandidatesThisWeek} </span>
              <span className="text-muted-foreground ml-1">cette semaine</span>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground">Entretiens</h2>
                <p className="text-3xl font-bold">{stats.totalInterviews}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-500 dark:text-green-400 font-medium">{stats.completedInterviews} </span>
              <span className="text-muted-foreground ml-1">terminés</span>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground">Score moyen</h2>
                <p className="text-3xl font-bold">{stats.averageScore}<span className="text-lg font-normal">/100</span></p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-yellow-500 dark:text-yellow-400 font-medium">{stats.pendingReviews} </span>
              <span className="text-muted-foreground ml-1">évaluations en attente</span>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground">Taux d&apos;embauche</h2>
                <p className="text-3xl font-bold">{stats.hiringRate}<span className="text-lg font-normal">%</span></p>
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
                {monthlyData.map((data, index) => (
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
                {positionData.map((data, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{data.position}</span>
                      <span className="text-sm">{data.candidates} candidats</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${(data.candidates / stats.totalCandidates) * 100}%` }}
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
                {skillsData.map((data, index) => (
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
              {recentCandidates.map((candidate) => (
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
            {upcomingInterviews.length > 0 ? (
              <div className="divide-y divide-border">
                {upcomingInterviews.map((interview) => (
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