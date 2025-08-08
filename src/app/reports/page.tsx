"use client";

import { useState } from "react";
import { BarChart, LineChart, PieChart, Download, Filter, Calendar } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

// Données fictives pour la démonstration
const mockStats = {
  totalCandidates: 156,
  interviewsCompleted: 87,
  averageScore: 72,
  hiringRate: 18,
};

const mockMonthlyData = [
  { month: "Jan", candidates: 12, interviews: 8, hired: 2 },
  { month: "Fév", candidates: 15, interviews: 10, hired: 3 },
  { month: "Mar", candidates: 18, interviews: 12, hired: 2 },
  { month: "Avr", candidates: 22, interviews: 15, hired: 4 },
  { month: "Mai", candidates: 20, interviews: 14, hired: 3 },
  { month: "Juin", candidates: 25, interviews: 18, hired: 5 },
];

const mockPositionData = [
  { position: "Développeur Frontend", candidates: 45, averageScore: 76 },
  { position: "Développeur Backend", candidates: 38, averageScore: 74 },
  { position: "UX Designer", candidates: 22, averageScore: 82 },
  { position: "Chef de Projet", candidates: 18, averageScore: 68 },
  { position: "DevOps", candidates: 15, averageScore: 79 },
  { position: "Data Scientist", candidates: 12, averageScore: 85 },
];

const mockSkillsData = [
  { skill: "JavaScript", score: 78 },
  { skill: "React", score: 82 },
  { skill: "Node.js", score: 75 },
  { skill: "Python", score: 80 },
  { skill: "SQL", score: 72 },
  { skill: "AWS", score: 68 },
];

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("6m");
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Rapports et Statistiques</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <select
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background appearance-none"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
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
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Candidats</h3>
            <p className="text-3xl font-bold">{mockStats.totalCandidates}</p>
            <div className="mt-2 text-sm text-green-500 dark:text-green-400">
              +12% par rapport à la période précédente
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Entretiens</h3>
            <p className="text-3xl font-bold">{mockStats.interviewsCompleted}</p>
            <div className="mt-2 text-sm text-green-500 dark:text-green-400">
              +8% par rapport à la période précédente
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Score moyen</h3>
            <p className="text-3xl font-bold">{mockStats.averageScore}<span className="text-lg font-normal">/100</span></p>
            <div className="mt-2 text-sm text-yellow-500 dark:text-yellow-400">
              +2% par rapport à la période précédente
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Taux d'embauche</h3>
            <p className="text-3xl font-bold">{mockStats.hiringRate}<span className="text-lg font-normal">%</span></p>
            <div className="mt-2 text-sm text-green-500 dark:text-green-400">
              +5% par rapport à la période précédente
            </div>
          </div>
        </div>

        {/* Graphiques */}
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

        {/* Compétences et Qualifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <h2 className="text-xl font-bold mb-6">Statistiques d'entretien</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">24 min</h3>
                <p className="text-sm text-muted-foreground">Durée moyenne d'entretien</p>
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
                <p className="text-sm text-muted-foreground">Jours pour compléter l'évaluation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}