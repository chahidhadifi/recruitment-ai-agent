"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BarChart, FileText, ArrowLeft, Download, Share2 } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Données fictives pour la démonstration
const mockCandidateReport = {
  id: "2",
  name: "Marie Martin",
  email: "marie.martin@example.com",
  position: "UX Designer",
  status: "Entretien terminé",
  score: 85,
  accepted: true,
  interviewDate: "2023-10-18",
  interviewId: "1",
  interviewDuration: "25 minutes",
  strengths: [
    "Excellente connaissance des principes UX",
    "Expérience significative avec les outils de design",
    "Bonne communication et présentation des idées"
  ],
  weaknesses: [
    "Connaissance limitée des frameworks front-end",
    "Peu d&apos;expérience en recherche utilisateur"
  ],
  summary: "Marie a démontré une solide compréhension des principes de conception UX et une bonne maîtrise des outils de design. Elle a présenté un portfolio impressionnant avec des projets variés. Ses compétences en communication sont excellentes, ce qui est essentiel pour collaborer efficacement avec les développeurs et les parties prenantes. Cependant, elle pourrait bénéficier d&apos;une formation supplémentaire sur les frameworks front-end modernes et les méthodologies de recherche utilisateur.",
  recommendations: "Recommandée pour le poste de UX Designer. Suggérons une période d&apos;intégration avec formation sur React et les méthodes de recherche utilisateur."
};

// Données fictives pour les questions et réponses de l'entretien
const mockInterviewQA = [
  {
    question: "Pouvez-vous expliquer votre processus de conception UX ?",
    answer: "Mon processus commence par la recherche utilisateur pour comprendre les besoins et les problèmes. Je crée ensuite des personas et des parcours utilisateurs, suivis de wireframes et de prototypes. Je teste ces prototypes avec des utilisateurs réels et j&apos;itère en fonction des retours. Enfin, je collabore étroitement avec les développeurs pour assurer une implémentation fidèle.",
    score: 90
  },
  {
    question: "Quels outils de design utilisez-vous régulièrement ?",
    answer: "J&apos;utilise principalement Figma pour la conception d&apos;interfaces et la création de prototypes. J&apos;utilise également Adobe XD et Sketch selon les besoins du projet. Pour la recherche utilisateur, j&apos;utilise des outils comme Hotjar et UserTesting.",
    score: 85
  },
  {
    question: "Comment abordez-vous l&apos;accessibilité dans vos conceptions ?",
    answer: "L&apos;accessibilité est une priorité dans mes conceptions. Je m&apos;assure que mes designs respectent les normes WCAG 2.1. Cela inclut l&apos;utilisation de contrastes de couleurs appropriés, la fourniture d&apos;alternatives textuelles pour les images, et la conception d&apos;interfaces navigables au clavier. Je teste également avec des lecteurs d&apos;écran.",
    score: 80
  },
  {
    question: "Comment gérez-vous les conflits dans une équipe de design ?",
    answer: "Pour résoudre les conflits, j&apos;essaie d&apos;abord de comprendre les différentes perspectives en écoutant activement toutes les parties. Je m&apos;efforce de trouver un terrain d&apos;entente en me concentrant sur les objectifs communs du projet. Si nécessaire, je m&apos;appuie sur des données et des tests utilisateurs pour guider la décision. L&apos;important est de maintenir une communication ouverte et respectueuse.",
    score: 85
  },
];

export default function CandidateReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("summary");
  
  // Vérifier si l'utilisateur est authentifié
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="container py-10 flex justify-center items-center">
          <p>Chargement...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }
  
  // Simuler la récupération des données du candidat
  const candidate = mockCandidateReport;
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Rapport du candidat</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{candidate.name}</CardTitle>
                <CardDescription>{candidate.position}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{candidate.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date d&apos;entretien</p>
                    <p>{new Date(candidate.interviewDate).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Durée</p>
                    <p>{candidate.interviewDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Score global</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold">{candidate.score}</span>
                      <span className="text-muted-foreground ml-1">/100</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Statut</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        candidate.accepted
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {candidate.accepted ? "Accepté" : "Refusé"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col w-full gap-2">
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> Voir le CV
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Télécharger le rapport
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" /> Partager
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Résumé</TabsTrigger>
                <TabsTrigger value="details">Détails de l&apos;entretien</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé de l&apos;évaluation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Points forts</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {candidate.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Points à améliorer</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {candidate.weaknesses.map((weakness, index) => (
                            <li key={index}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Synthèse</h3>
                        <p className="text-muted-foreground">{candidate.summary}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Recommandation</h3>
                        <p className="text-muted-foreground">{candidate.recommendations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Questions et réponses</CardTitle>
                    <CardDescription>Aperçu des questions posées et des réponses du candidat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockInterviewQA.map((qa, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">Question {index + 1}</h3>
                            <div className="flex items-center">
                              <BarChart className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm font-medium">{qa.score}/100</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-4">{qa.question}</p>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Réponse du candidat:</h4>
                            <p className="text-sm text-muted-foreground">{qa.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}