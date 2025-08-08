"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Plus, FileText, MessageSquare, MoreVertical, BarChart } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

// Données fictives pour la démonstration
const mockCandidates = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    position: "Développeur Frontend",
    status: "En attente d'entretien",
    score: null,
    accepted: false,
    interviewDate: "2023-10-25",
    interviewId: "3",
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie.martin@example.com",
    position: "UX Designer",
    status: "Entretien terminé",
    score: 85,
    accepted: true,
    interviewDate: "2023-10-18",
    interviewId: "1",
  },
  {
    id: "3",
    name: "Pierre Durand",
    email: "pierre.durand@example.com",
    position: "Développeur Backend",
    status: "CV analysé",
    score: null,
    accepted: false,
    interviewDate: "2023-10-22",
    interviewId: "4",
  },
  {
    id: "4",
    name: "Sophie Lefebvre",
    email: "sophie.lefebvre@example.com",
    position: "Chef de Projet",
    status: "Entretien terminé",
    score: 92,
    accepted: true,
    interviewDate: "2023-10-15",
    interviewId: "2",
  },
  {
    id: "5",
    name: "Thomas Bernard",
    email: "thomas.bernard@example.com",
    position: "DevOps Engineer",
    status: "CV analysé",
    score: null,
    accepted: false,
    interviewDate: null,
    interviewId: null,
  },
];

export default function CandidatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState(mockCandidates);
  const [filterAccepted, setFilterAccepted] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = session?.user?.role === "admin";
  const isRecruiter = session?.user?.role === "recruteur";
  
  // Rediriger si l'utilisateur n'est pas authentifié ou n'est pas un administrateur/recruteur
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
  
  if (session && !isAdmin && !isRecruiter) {
    router.push("/");
    return null;
  }

  // Filtrer les candidats selon les critères
  let filteredCandidates = candidates.filter(
    (candidate) => {
      // Filtre de recherche
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par statut d'acceptation
      const matchesAccepted = filterAccepted ? candidate.accepted : true;
      
      // Filtre par statut d'entretien
      const matchesStatus = 
        filterStatus === "all" ? true :
        filterStatus === "completed" ? candidate.status === "Entretien terminé" :
        filterStatus === "pending" ? candidate.status === "En attente d'entretien" :
        filterStatus === "analyzed" ? candidate.status === "CV analysé" : true;
      
      return matchesSearch && matchesAccepted && matchesStatus;
    }
  );
  
  // Trier les candidats selon les critères
  filteredCandidates = [...filteredCandidates].sort((a, b) => {
    // Gestion des valeurs nulles pour le score
    if (sortBy === "score") {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return sortOrder === "asc" ? 1 : -1;
      if (b.score === null) return sortOrder === "asc" ? -1 : 1;
    }
    
    // Tri selon le critère sélectionné
    if (sortBy === "name") {
      return sortOrder === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
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
      // Gestion des dates nulles
      if (!a.interviewDate && !b.interviewDate) return 0;
      if (!a.interviewDate) return sortOrder === "asc" ? 1 : -1;
      if (!b.interviewDate) return sortOrder === "asc" ? -1 : 1;
      
      return sortOrder === "asc" 
        ? new Date(a.interviewDate) - new Date(b.interviewDate) 
        : new Date(b.interviewDate) - new Date(a.interviewDate);
    }
    
    return 0;
  });

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Candidats</h1>
          {isRecruiter && (
            <Button asChild>
              <Link href="/candidates/new">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un candidat
              </Link>
            </Button>
          )}
        </div>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou poste..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center px-3 py-2 rounded-md border border-primary/20 hover:bg-primary/15 transition-colors">
                  <input
                    type="checkbox"
                    id="filter-accepted"
                    checked={filterAccepted}
                    onChange={(e) => setFilterAccepted(e.target.checked)}
                    className="rounded border-primary/30 text-primary focus:ring-primary h-4 w-4 mr-2"
                  />
                  <label htmlFor="filter-accepted" className="text-sm font-medium cursor-pointer">
                    Candidats acceptés
                  </label>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Entretien terminé</option>
                  <option value="pending">En attente d'entretien</option>
                  <option value="analyzed">CV analysé</option>
                </select>
                
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="name">Trier par nom</option>
                      <option value="position">Trier par poste</option>
                      <option value="status">Trier par statut</option>
                      <option value="score">Trier par score</option>
                      <option value="date">Trier par date d'entretien</option>
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
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Poste
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                    Score
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                      Date d'entretien
                    </th>
                  )}
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider">
                      Accepté
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/candidates/${candidate.id}`)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {candidate.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {candidate.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {candidate.position}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
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
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {candidate.score ? `${candidate.score}/100` : "-"}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {candidate.interviewDate ? new Date(candidate.interviewDate).toLocaleDateString('fr-FR') : "-"}
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              candidate.accepted
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {candidate.accepted ? "Oui" : "Non"}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                            <div
                              className="inline-flex items-center space-x-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  router.push(`/candidates/${candidate.id}/cv`)
                                }
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">Voir le CV</span>
                              </Button>
                              {!isAdmin && candidate.status !== "Entretien terminé" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    router.push(`/interviews/new?candidate=${candidate.id}`)
                                  }
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span className="sr-only">Démarrer l'entretien</span>
                                </Button>
                              )}
                              {isAdmin && candidate.interviewId && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    router.push(`/candidates/${candidate.id}/report`)
                                  }
                                >
                                  <BarChart className="h-4 w-4" />
                                  <span className="sr-only">Voir le rapport</span>
                                </Button>
                              )}
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Plus d'options</span>
                              </Button>
                            </div>
                          </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 8 : 6}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Aucun candidat trouvé avec les critères sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}