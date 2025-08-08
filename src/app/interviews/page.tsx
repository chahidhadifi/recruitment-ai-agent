"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Plus, Calendar, Clock, BarChart, MoreVertical, PlusCircle, Edit, Trash2, Eye, FileText } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_RECRUTEUR_USER, DEFAULT_ADMIN_USER } from "@/types/user-roles";

// Données fictives pour la démonstration
const mockInterviews = [
  {
    id: "1",
    candidateId: "2",
    candidateName: "Marie Martin",
    position: "UX Designer",
    date: "2023-10-18",
    duration: "25 minutes",
    status: "Terminé",
    score: 85,
  },
  {
    id: "2",
    candidateId: "4",
    candidateName: "Sophie Lefebvre",
    position: "Chef de Projet",
    date: "2023-10-15",
    duration: "32 minutes",
    status: "Terminé",
    score: 92,
  },
  {
    id: "3",
    candidateId: "1",
    candidateName: "Jean Dupont",
    position: "Développeur Frontend",
    date: "2023-10-25",
    duration: "-",
    status: "Planifié",
    score: null,
  },
  {
    id: "4",
    candidateId: "3",
    candidateName: "Pierre Durand",
    position: "Développeur Backend",
    date: "2023-10-22",
    duration: "-",
    status: "Planifié",
    score: null,
  },
];

// Données fictives pour les questions d'entretien
const sampleQuestions = [
  { id: "1", text: "Expliquez le concept de hooks dans React" },
  { id: "2", text: "Comment optimiseriez-vous les performances d'une application React?" },
  { id: "3", text: "Quelle est votre expérience avec TypeScript?" },
  { id: "4", text: "Expliquez les différentes techniques de NLP que vous avez utilisées" },
  { id: "5", text: "Comment aborderiez-vous un problème de classification de texte?" },
];

export default function InterviewsPage() {
  const router = useRouter();
  const { data: realSession } = useSession();
  const session = realSession || { user: { ...DEFAULT_RECRUTEUR_USER, role: "recruteur" } };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [interviews, setInterviews] = useState(mockInterviews);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [newInterview, setNewInterview] = useState({ title: "", description: "", position: "" });
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>(sampleQuestions);
  const [newQuestion, setNewQuestion] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filtrer les entretiens selon les critères
  let filteredInterviews = interviews.filter(
    (interview) => {
      // Filtre de recherche
      const matchesSearch = 
        interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par statut
      const matchesStatus = 
        filterStatus === "all" ? true :
        filterStatus === "completed" ? interview.status === "Terminé" :
        filterStatus === "scheduled" ? interview.status === "Planifié" : true;
      
      return matchesSearch && matchesStatus;
    }
  );
  
  // Trier les entretiens selon les critères
  filteredInterviews = [...filteredInterviews].sort((a, b) => {
    // Gestion des valeurs nulles pour le score
    if (sortBy === "score") {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return sortOrder === "asc" ? 1 : -1;
      if (b.score === null) return sortOrder === "asc" ? -1 : 1;
    }
    
    // Tri selon le critère sélectionné
    if (sortBy === "candidateName") {
      return sortOrder === "asc" 
        ? a.candidateName.localeCompare(b.candidateName) 
        : b.candidateName.localeCompare(a.candidateName);
    } else if (sortBy === "position") {
      return sortOrder === "asc" 
        ? a.position.localeCompare(b.position) 
        : b.position.localeCompare(a.position);
    } else if (sortBy === "status") {
      return sortOrder === "asc" 
        ? a.status.localeCompare(b.status) 
        : b.status.localeCompare(a.status);
    } else if (sortBy === "score") {
      return sortOrder === "asc" 
        ? a.score - b.score 
        : b.score - a.score;
    } else if (sortBy === "date") {
      return sortOrder === "asc" 
        ? new Date(a.date) - new Date(b.date) 
        : new Date(b.date) - new Date(a.date);
    }
    
    return 0;
  });
  
  // Vérifier si l'utilisateur est un recruteur ou un administrateur
  const isRecruiter = session?.user?.role === "recruteur" || session?.user?.role === "admin";
  
  // Gérer la sélection d'un entretien
  const handleSelectInterview = (interview: any) => {
    setSelectedInterview(interview);
    setActiveTab("details");
  };
  
  // Ajouter une nouvelle question
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const question = {
      id: `new-${Date.now()}`,
      text: newQuestion
    };
    
    setSelectedQuestions([...selectedQuestions, question]);
    setNewQuestion("");
  };
  
  // Créer un nouvel entretien
  const handleCreateInterview = () => {
    if (!newInterview.title || !newInterview.position) return;
    
    const interview = {
      id: `new-${Date.now()}`,
      candidateId: "",
      candidateName: "À assigner",
      position: newInterview.position,
      date: new Date().toISOString().split('T')[0],
      duration: "-",
      status: "En préparation",
      score: null,
      description: newInterview.description,
      questions: selectedQuestions
    };
    
    setInterviews([...interviews, interview]);
    setNewInterview({ title: "", description: "", position: "" });
    setSelectedQuestions([]);
    setActiveTab("list");
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Entretiens</h1>
          {isRecruiter && (
            <div className="flex gap-2">
              <Button onClick={() => setActiveTab("create")}>
                <Plus className="mr-2 h-4 w-4" /> Nouvel entretien
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("list")}>
                Voir tous
              </Button>
              <Button variant="outline" asChild>
                <Link href="/candidates">
                  <FileText className="mr-2 h-4 w-4" /> Gérer les candidats
                </Link>
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Liste des entretiens</TabsTrigger>
            {isRecruiter && (
              <TabsTrigger value="create">Créer un entretien</TabsTrigger>
            )}
            <TabsTrigger value="details" disabled={!selectedInterview}>
              Détails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Rechercher par candidat ou poste..."
                      className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="completed">Terminé</option>
                      <option value="scheduled">Planifié</option>
                    </select>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="candidateName">Trier par candidat</option>
                        <option value="position">Trier par poste</option>
                        <option value="status">Trier par statut</option>
                        <option value="score">Trier par score</option>
                        <option value="date">Trier par date</option>
                      </select>
                      
                      <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-1"
                      >
                        {sortOrder === "asc" ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/>
                            </svg>
                            Croissant
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/>
                            </svg>
                            Décroissant
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Candidat
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Poste
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Durée
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInterviews.length > 0 ? (
                  filteredInterviews.map((interview) => (
                    <tr
                      key={interview.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/interviews/${interview.id}`)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {interview.candidateName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {interview.position}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {new Date(interview.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {interview.duration}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            interview.status === "Terminé"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : interview.status === "En cours"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {interview.score ? `${interview.score}/100` : "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                        <div
                          className="inline-flex items-center space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {interview.status === "Planifié" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/interviews/new?candidate=${interview.candidateId}`)
                              }
                            >
                              <Calendar className="h-4 w-4" />
                              <span className="sr-only">Démarrer</span>
                            </Button>
                          )}
                          {interview.status === "Terminé" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/candidates/${interview.candidateId}/report`)
                              }
                            >
                              <BarChart className="h-4 w-4" />
                              <span className="sr-only">Rapport</span>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectInterview(interview);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Voir détails</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/candidates/${interview.candidateId}`);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Profil candidat</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Aucun entretien trouvé. Planifiez un nouvel entretien pour
                      commencer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          </TabsContent>

          {isRecruiter && (
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Créer un nouvel entretien</CardTitle>
                  <CardDescription>Définissez les détails et les questions pour cet entretien</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de l'entretien</Label>
                    <Input
                      id="title"
                      value={newInterview.title}
                      onChange={(e) => setNewInterview({ ...newInterview, title: e.target.value })}
                      placeholder="Ex: Entretien pour développeur frontend"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Poste</Label>
                    <Input
                      id="position"
                      value={newInterview.position}
                      onChange={(e) => setNewInterview({ ...newInterview, position: e.target.value })}
                      placeholder="Ex: Développeur Frontend React"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newInterview.description}
                      onChange={(e) => setNewInterview({ ...newInterview, description: e.target.value })}
                      placeholder="Description du poste et des compétences requises"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Questions sélectionnées</Label>
                    <div className="space-y-2">
                      {selectedQuestions.map((question) => (
                        <div key={question.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span>{question.text}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {selectedQuestions.length === 0 && (
                        <div className="p-3 bg-muted/50 rounded-lg text-center text-muted-foreground">
                          Aucune question sélectionnée
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-question">Ajouter une question</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="new-question"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Saisissez une nouvelle question"
                        className="flex-1"
                      />
                      <Button onClick={handleAddQuestion} className="self-end">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Questions prédéfinies</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableQuestions.map((question) => (
                        <div key={question.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span>{question.text}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (!selectedQuestions.some(q => q.id === question.id)) {
                                setSelectedQuestions([...selectedQuestions, question]);
                              }
                            }}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateInterview}>
                      Créer l'entretien
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("list")}>
                      Annuler
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="details">
            {selectedInterview && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedInterview.position}</CardTitle>
                    <CardDescription>
                      {selectedInterview.description || "Entretien pour le poste de " + selectedInterview.position}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Candidat</p>
                        <p>{selectedInterview.candidateName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p>{new Date(selectedInterview.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Statut</p>
                        <p>{selectedInterview.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Score</p>
                        <p>{selectedInterview.score ? `${selectedInterview.score}/100` : "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-2">
                      {selectedInterview.status === "Planifié" && (
                        <Button onClick={() => router.push(`/interviews/candidat?id=${selectedInterview.id}`)}>
                          Démarrer l'entretien
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setActiveTab("list")}>
                        Retour à la liste
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}