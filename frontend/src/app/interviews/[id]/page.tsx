"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, Clock, BarChart, MessageSquare } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

// Données fictives pour la démonstration
const mockInterviews = {
  "1": {
    id: "1",
    candidateId: "2",
    candidateName: "Marie Martin",
    position: "UX Designer",
    date: "2023-10-18",
    startTime: "14:30",
    endTime: "14:55",
    duration: "25 minutes",
    status: "Terminé",
    score: 85,
    questions: [
      {
        question: "Pouvez-vous vous présenter brièvement et me parler de votre parcours professionnel ?",
        answer: "Bonjour, je m&apos;appelle Marie Martin, je suis UX Designer avec 4 ans d&apos;expérience. J&apos;ai obtenu un Master en Design d&apos;Interface à l&apos;École de Design de Nantes, puis j&apos;ai travaillé chez Creative Studio où j&apos;ai conçu des interfaces pour diverses applications mobiles et web. J&apos;ai une passion pour la création d&apos;expériences utilisateur intuitives et accessibles.",
      },
      {
        question: "Pourquoi êtes-vous intéressé par ce poste et notre entreprise ?",
        answer: "Votre entreprise est reconnue pour son approche centrée sur l&apos;utilisateur et son innovation dans le domaine digital. J&apos;admire particulièrement vos projets récents qui allient esthétique et fonctionnalité. Le poste de UX Designer chez vous représente pour moi l&apos;opportunité de travailler sur des projets ambitieux avec une équipe talentueuse, tout en continuant à développer mes compétences dans un environnement stimulant.",
      },
      {
        question: "Pouvez-vous décrire votre processus de conception UX ?",
        answer: "Mon processus commence toujours par la recherche utilisateur pour comprendre les besoins et les problèmes. Ensuite, je crée des personas et des parcours utilisateur, suivis de wireframes et de prototypes. Je conduis des tests d&apos;utilisabilité et j&apos;itère sur les designs en fonction des retours. Enfin, je travaille étroitement avec les développeurs pour assurer une implémentation fidèle.",
      },
      {
        question: "Comment abordez-vous l&apos;accessibilité dans vos designs ?",
        answer: "L&apos;accessibilité est une priorité dans mes designs. Je m&apos;assure de respecter les normes WCAG, d&apos;utiliser des contrastes suffisants, de fournir des alternatives textuelles pour les images, et de concevoir des interfaces navigables au clavier. Je teste également avec des lecteurs d&apos;écran et j&apos;implique des utilisateurs ayant différents besoins dans mes tests.",
      },
      {
        question: "Comment gérez-vous les retours critiques sur vos designs ?",
        answer: "Je considère les retours comme une opportunité d&apos;amélioration. J&apos;écoute attentivement, pose des questions pour clarifier, et évite d&apos;être défensive. Je prends le temps d&apos;analyser les commentaires et d&apos;identifier les améliorations possibles. Je crois que la collaboration et l&apos;itération sont essentielles pour créer les meilleurs designs.",
      },
    ],
  },
  "2": {
    id: "2",
    candidateId: "4",
    candidateName: "Sophie Lefebvre",
    position: "Chef de Projet",
    date: "2023-10-15",
    startTime: "10:15",
    endTime: "10:47",
    duration: "32 minutes",
    status: "Terminé",
    score: 92,
    questions: [
      {
        question: "Pouvez-vous vous présenter brièvement et me parler de votre parcours professionnel ?",
        answer: "Bonjour, je suis Sophie Lefebvre, chef de projet avec plus de 8 ans d&apos;expérience dans la gestion de projets digitaux. Après mes études en management de projet à HEC Paris, j&apos;ai travaillé pour plusieurs agences digitales avant de rejoindre une grande entreprise de e-commerce où j&apos;ai dirigé des projets de refonte de plateforme et d&apos;amélioration de l&apos;expérience client.",
      },
      {
        question: "Pourquoi êtes-vous intéressé par ce poste et notre entreprise ?",
        answer: "Votre entreprise est à la pointe de l&apos;innovation technologique et j&apos;admire votre culture d&apos;entreprise axée sur la collaboration et l&apos;excellence. Le poste de Chef de Projet chez vous me permettrait de mettre à profit mon expérience tout en relevant de nouveaux défis dans un secteur en constante évolution. Je suis particulièrement intéressée par votre approche agile et votre vision à long terme.",
      },
      {
        question: "Comment gérez-vous les projets qui prennent du retard ?",
        answer: "Lorsqu&apos;un projet prend du retard, j&apos;identifie d&apos;abord les causes profondes du retard. Ensuite, je réévalue les priorités et ajuste le plan de projet en conséquence. Je communique ouvertement avec les parties prenantes sur la situation et les solutions proposées. Si nécessaire, je mobilise des ressources supplémentaires ou je négocie une extension de délai. Je mets également en place des mesures préventives pour éviter que des retards similaires ne se reproduisent à l&apos;avenir.",
      },
      {
        question: "Comment assurez-vous la communication efficace entre les membres de l&apos;équipe ?",
        answer: "Je mets en place plusieurs canaux de communication adaptés aux besoins de l&apos;équipe : réunions quotidiennes courtes pour synchroniser le travail, réunions hebdomadaires plus détaillées pour discuter des problèmes et des progrès, et des outils de communication en ligne pour les échanges continus. J&apos;établis des règles claires sur la fréquence et le format des communications. Je m&apos;assure également que chaque membre comprend son rôle et ses responsabilités, et j&apos;encourage une culture de feedback constructif.",
      },
      {
        question: "Comment priorisez-vous les tâches dans un environnement où tout semble urgent ?",
        answer: "J&apos;utilise une matrice d&apos;Eisenhower pour classer les tâches selon leur importance et leur urgence. Je consulte les parties prenantes pour comprendre l&apos;impact business de chaque tâche. J&apos;évalue également les dépendances entre les tâches pour optimiser le flux de travail. Une fois les priorités établies, je les communique clairement à l&apos;équipe et je m&apos;assure que tout le monde comprend le raisonnement derrière ces décisions. Je réévalue régulièrement les priorités car elles peuvent changer rapidement.",
      },
    ],
  },
  "3": {
    id: "3",
    candidateId: "1",
    candidateName: "Jean Dupont",
    position: "Développeur Frontend",
    date: "2023-10-25",
    startTime: "11:00",
    endTime: "-",
    duration: "-",
    status: "Planifié",
    score: null,
    questions: [],
  },
  "4": {
    id: "4",
    candidateId: "3",
    candidateName: "Pierre Durand",
    position: "Développeur Backend",
    date: "2023-10-22",
    startTime: "15:30",
    endTime: "-",
    duration: "-",
    status: "Planifié",
    score: null,
    questions: [],
  },
};

export default function InterviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [interview, setInterview] = useState<{
    candidateName: string;
    candidateId: string;
    position: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    status: string;
    score: number | null;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement de données
    setTimeout(() => {
      const interviewData = mockInterviews[params.id as keyof typeof mockInterviews];
      if (interviewData) {
        setInterview(interviewData);
      }
      setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-10 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col space-y-4 w-full max-w-3xl">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!interview) {
    return (
      <MainLayout>
        <div className="container py-10">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Entretien non trouvé</h1>
            <p className="text-muted-foreground mb-6">L&apos;entretien que vous recherchez n&apos;existe pas ou a été supprimé.</p>
            <Button onClick={() => router.push("/interviews")}>Voir tous les entretiens</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Entretien avec {interview.candidateName}
          </h1>
          <p className="text-muted-foreground">
            Poste: {interview.position}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Candidat</h2>
            </div>
            <p className="text-xl font-bold mb-1">{interview.candidateName}</p>
            <p className="text-muted-foreground">{interview.position}</p>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push(`/candidates/${interview.candidateId}`)}
            >
              Voir le profil
            </Button>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Date et heure</h2>
            </div>
            <p className="mb-2">
              <span className="font-medium">Date: </span>
              {new Date(interview.date).toLocaleDateString('fr-FR')}
            </p>
            <p className="mb-2">
              <span className="font-medium">Heure de début: </span>
              {interview.startTime}
            </p>
            <p>
              <span className="font-medium">Heure de fin: </span>
              {interview.endTime !== "-" ? interview.endTime : "Non terminé"}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BarChart className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Statut</h2>
            </div>
            <div className="mb-3">
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
            </div>
            <p className="mb-2">
              <span className="font-medium">Durée: </span>
              {interview.duration}
            </p>
            {interview.score && (
              <p>
                <span className="font-medium">Score: </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {interview.score}/100
                </span>
              </p>
            )}
            {interview.status === "Terminé" && (
              <Button 
                className="w-full mt-4"
                onClick={() => router.push(`/candidates/${interview.candidateId}/report`)}
              >
                <BarChart className="mr-2 h-4 w-4" /> Voir le rapport
              </Button>
            )}
            {interview.status === "Planifié" && (
              <Button 
                className="w-full mt-4"
                onClick={() => router.push(`/interviews/new?candidate=${interview.candidateId}`)}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Démarrer l&apos;entretien
              </Button>
            )}
          </div>
        </div>

        {interview.questions.length > 0 && (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Questions et réponses</h2>
            </div>
            <div className="p-6">
              <div className="space-y-8">
                {interview.questions.map((qa, index: number) => (
                  <div key={index} className="border-b border-border pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold mb-3">Q{index + 1}: {qa.question}</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="italic">&quot;{qa.answer}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {interview.status === "Planifié" && (
          <div className="bg-card rounded-lg shadow-sm p-6 mt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Entretien planifié</h2>
              <p className="mb-6">Cet entretien est prévu pour le {new Date(interview.date).toLocaleDateString('fr-FR')} à {interview.startTime}.</p>
              <Button 
                size="lg"
                onClick={() => router.push(`/interviews/new?candidate=${interview.candidateId}`)}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Démarrer l&apos;entretien maintenant
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}