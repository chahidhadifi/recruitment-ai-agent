"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, BarChart, ThumbsUp, ThumbsDown, CheckCircle, XCircle, AlertCircle } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

// Données fictives pour la démonstration
const mockReports = {
  "2": {
    candidateId: "2",
    candidateName: "Marie Martin",
    position: "UX Designer",
    interviewDate: "2023-10-18",
    overallScore: 85,
    recommendation: "Recommandé",
    summary: "Marie a démontré une excellente compréhension des principes de conception UX et une solide expérience dans la recherche utilisateur. Elle a présenté des exemples concrets de son travail et a montré sa capacité à résoudre des problèmes complexes. Ses compétences en communication sont excellentes et elle s'intégrerait bien dans notre équipe de design.",
    categories: [
      {
        name: "Compétences techniques",
        score: 88,
        feedback: "Marie possède une excellente maîtrise des outils de conception (Figma, Adobe XD) et une bonne compréhension des principes de design. Elle a démontré sa capacité à créer des wireframes, des prototypes et à conduire des tests d'utilisabilité.",
        strengths: ["Maîtrise avancée de Figma", "Expérience en tests d'utilisabilité", "Connaissance des principes d'accessibilité"],
        weaknesses: ["Connaissances limitées en HTML/CSS"],
      },
      {
        name: "Expérience professionnelle",
        score: 85,
        feedback: "Son expérience chez Creative Studio lui a permis de travailler sur divers projets, notamment des applications mobiles et des sites web. Elle a participé à toutes les étapes du processus de conception UX.",
        strengths: ["4 ans d'expérience en UX Design", "Travail sur des projets variés", "Expérience en design system"],
        weaknesses: ["Pas d'expérience dans notre secteur d'activité"],
      },
      {
        name: "Soft skills",
        score: 90,
        feedback: "Marie a d'excellentes compétences en communication et sait présenter clairement ses idées. Elle a montré sa capacité à travailler en équipe et à recevoir des critiques constructives.",
        strengths: ["Communication claire", "Écoute active", "Capacité à défendre ses choix de design"],
        weaknesses: [],
      },
      {
        name: "Culture d'entreprise",
        score: 82,
        feedback: "Marie semble bien comprendre notre culture d'entreprise et nos valeurs. Elle a montré un intérêt sincère pour notre mission et nos produits.",
        strengths: ["Intérêt pour notre mission", "Valeurs alignées avec l'entreprise"],
        weaknesses: ["Préférence pour le travail en présentiel alors que nous sommes en remote"],
      },
    ],
    questions: [
      {
        question: "Pouvez-vous décrire votre processus de conception UX ?",
        answer: "Mon processus commence toujours par la recherche utilisateur pour comprendre les besoins et les problèmes. Ensuite, je crée des personas et des parcours utilisateur, suivis de wireframes et de prototypes. Je conduis des tests d'utilisabilité et j'itère sur les designs en fonction des retours. Enfin, je travaille étroitement avec les développeurs pour assurer une implémentation fidèle.",
        evaluation: "Excellente réponse qui démontre une compréhension approfondie du processus UX et une approche méthodique.",
        score: 95,
      },
      {
        question: "Comment abordez-vous l'accessibilité dans vos designs ?",
        answer: "L'accessibilité est une priorité dans mes designs. Je m'assure de respecter les normes WCAG, d'utiliser des contrastes suffisants, de fournir des alternatives textuelles pour les images, et de concevoir des interfaces navigables au clavier. Je teste également avec des lecteurs d'écran et j'implique des utilisateurs ayant différents besoins dans mes tests.",
        evaluation: "Bonne connaissance des principes d'accessibilité et engagement à créer des designs inclusifs.",
        score: 85,
      },
      {
        question: "Comment gérez-vous les retours critiques sur vos designs ?",
        answer: "Je considère les retours comme une opportunité d'amélioration. J'écoute attentivement, pose des questions pour clarifier, et évite d'être défensive. Je prends le temps d'analyser les commentaires et d'identifier les améliorations possibles. Je crois que la collaboration et l'itération sont essentielles pour créer les meilleurs designs.",
        evaluation: "Excellente attitude face aux critiques, démontrant maturité et professionnalisme.",
        score: 90,
      },
      {
        question: "Quelle est votre expérience avec les design systems ?",
        answer: "J'ai créé et maintenu un design system pour Creative Studio qui a été utilisé par toute l'équipe de design et de développement. J'ai établi des composants réutilisables, des guidelines de style, et une documentation complète. Cela a permis d'améliorer la cohérence des designs et d'accélérer le processus de développement.",
        evaluation: "Bonne expérience pratique avec les design systems et compréhension de leur valeur.",
        score: 80,
      },
    ],
  },
  "4": {
    candidateId: "4",
    candidateName: "Sophie Lefebvre",
    position: "Chef de Projet",
    interviewDate: "2023-10-15",
    overallScore: 92,
    recommendation: "Fortement recommandé",
    summary: "Sophie a démontré d'excellentes compétences en gestion de projet et une grande expérience dans la coordination d'équipes multidisciplinaires. Sa capacité à communiquer clairement, à résoudre des problèmes complexes et à gérer les priorités en fait une candidate idéale pour le poste de Chef de Projet.",
    categories: [
      {
        name: "Compétences techniques",
        score: 90,
        feedback: "Sophie maîtrise parfaitement les méthodologies Agile et Scrum. Elle a une excellente connaissance des outils de gestion de projet comme Jira, Trello et Microsoft Project. Elle comprend bien les aspects techniques des projets qu'elle gère.",
        strengths: ["Expertise en méthodologies Agile", "Maîtrise des outils de gestion de projet", "Compréhension technique solide"],
        weaknesses: [],
      },
      {
        name: "Expérience professionnelle",
        score: 95,
        feedback: "Avec plus de 8 ans d'expérience en gestion de projet, Sophie a dirigé avec succès des projets de grande envergure dans différents secteurs. Elle a démontré sa capacité à gérer des équipes de taille variable et à livrer des projets dans les délais et le budget impartis.",
        strengths: ["Expérience diversifiée", "Historique de projets réussis", "Gestion efficace des ressources"],
        weaknesses: [],
      },
      {
        name: "Soft skills",
        score: 94,
        feedback: "Sophie possède d'excellentes compétences en communication et en leadership. Elle sait motiver son équipe, gérer les conflits et maintenir une atmosphère de travail positive. Sa capacité à s'adapter rapidement aux changements est remarquable.",
        strengths: ["Leadership inspirant", "Excellente communication", "Résolution efficace des conflits"],
        weaknesses: ["Peut parfois être trop perfectionniste"],
      },
      {
        name: "Culture d'entreprise",
        score: 88,
        feedback: "Sophie s'aligne bien avec notre culture d'entreprise axée sur l'innovation et la collaboration. Elle valorise le travail d'équipe et l'amélioration continue, ce qui correspond parfaitement à nos valeurs.",
        strengths: ["Alignement avec nos valeurs", "Approche collaborative"],
        weaknesses: [],
      },
    ],
    questions: [
      {
        question: "Comment gérez-vous les projets qui prennent du retard ?",
        answer: "Lorsqu'un projet prend du retard, j'identifie d'abord les causes profondes du retard. Ensuite, je réévalue les priorités et ajuste le plan de projet en conséquence. Je communique ouvertement avec les parties prenantes sur la situation et les solutions proposées. Si nécessaire, je mobilise des ressources supplémentaires ou je négocie une extension de délai. Je mets également en place des mesures préventives pour éviter que des retards similaires ne se reproduisent à l'avenir.",
        evaluation: "Excellente approche méthodique pour gérer les retards de projet, avec un bon équilibre entre résolution de problèmes et communication.",
        score: 95,
      },
      {
        question: "Comment assurez-vous la communication efficace entre les membres de l'équipe ?",
        answer: "Je mets en place plusieurs canaux de communication adaptés aux besoins de l'équipe : réunions quotidiennes courtes pour synchroniser le travail, réunions hebdomadaires plus détaillées pour discuter des problèmes et des progrès, et des outils de communication en ligne pour les échanges continus. J'établis des règles claires sur la fréquence et le format des communications. Je m'assure également que chaque membre comprend son rôle et ses responsabilités, et j'encourage une culture de feedback constructif.",
        evaluation: "Réponse complète démontrant une compréhension approfondie de l'importance de la communication dans la gestion de projet.",
        score: 90,
      },
      {
        question: "Comment priorisez-vous les tâches dans un environnement où tout semble urgent ?",
        answer: "J'utilise une matrice d'Eisenhower pour classer les tâches selon leur importance et leur urgence. Je consulte les parties prenantes pour comprendre l'impact business de chaque tâche. J'évalue également les dépendances entre les tâches pour optimiser le flux de travail. Une fois les priorités établies, je les communique clairement à l'équipe et je m'assure que tout le monde comprend le raisonnement derrière ces décisions. Je réévalue régulièrement les priorités car elles peuvent changer rapidement.",
        evaluation: "Excellente méthodologie de priorisation avec une bonne prise en compte des facteurs business et techniques.",
        score: 95,
      },
      {
        question: "Comment gérez-vous les conflits au sein de votre équipe ?",
        answer: "Je considère les conflits comme une opportunité d'amélioration plutôt qu'un problème. J'aborde les conflits rapidement et directement, en organisant des discussions privées avec les personnes concernées. J'écoute activement toutes les parties, je reste neutre et je cherche à comprendre les perspectives de chacun. J'aide l'équipe à trouver un terrain d'entente et à élaborer des solutions mutuellement acceptables. Je m'assure ensuite de suivre la situation pour vérifier que le conflit est bien résolu.",
        evaluation: "Très bonne approche de la gestion des conflits, démontrant maturité et leadership.",
        score: 90,
      },
    ],
  },
};

export default function CandidateReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement de données
    setTimeout(() => {
      const reportData = mockReports[params.id as keyof typeof mockReports];
      if (reportData) {
        setReport(reportData);
      }
      setLoading(false);
    }, 500);
  }, [params.id]);

  const downloadReport = () => {
    if (!report) return;
    
    // Création d'un contenu pour le téléchargement
    let content = `# Rapport d'évaluation - ${report.candidateName}\n`;
    content += `## Poste: ${report.position}\n`;
    content += `## Date d'entretien: ${report.interviewDate}\n`;
    content += `## Score global: ${report.overallScore}/100\n`;
    content += `## Recommandation: ${report.recommendation}\n\n`;
    
    content += `### Résumé\n${report.summary}\n\n`;
    
    content += `### Évaluation par catégorie\n\n`;
    report.categories.forEach((category: any) => {
      content += `#### ${category.name} - ${category.score}/100\n`;
      content += `${category.feedback}\n\n`;
      content += `**Points forts:**\n`;
      category.strengths.forEach((strength: string) => {
        content += `- ${strength}\n`;
      });
      content += `\n**Points à améliorer:**\n`;
      if (category.weaknesses.length > 0) {
        category.weaknesses.forEach((weakness: string) => {
          content += `- ${weakness}\n`;
        });
      } else {
        content += `- Aucun point majeur à améliorer identifié\n`;
      }
      content += `\n`;
    });
    
    content += `### Questions et réponses\n\n`;
    report.questions.forEach((qa: any, index: number) => {
      content += `#### Q${index + 1}: ${qa.question}\n`;
      content += `**Réponse:** ${qa.answer}\n`;
      content += `**Évaluation:** ${qa.evaluation}\n`;
      content += `**Score:** ${qa.score}/100\n\n`;
    });
    
    // Création d'un blob pour le téléchargement
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rapport_${report.candidateName.replace(' ', '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-10 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col space-y-4 w-full max-w-3xl">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-[800px] bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!report) {
    return (
      <MainLayout>
        <div className="container py-10">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Rapport non trouvé</h1>
            <p className="text-muted-foreground mb-6">Le rapport que vous recherchez n'existe pas ou n'a pas encore été généré.</p>
            <Button onClick={() => router.push(`/candidates/${params.id}`)}>Retour au profil</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Fonction pour déterminer la couleur en fonction du score
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500 dark:text-green-400";
    if (score >= 70) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  // Fonction pour déterminer l'icône de recommandation
  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.toLowerCase().includes("fortement")) {
      return <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />;
    }
    if (recommendation.toLowerCase().includes("recommandé")) {
      return <ThumbsUp className="h-6 w-6 text-green-500 dark:text-green-400" />;
    }
    if (recommendation.toLowerCase().includes("réserve")) {
      return <AlertCircle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />;
    }
    return <ThumbsDown className="h-6 w-6 text-red-500 dark:text-red-400" />;
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <Button onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" /> Télécharger le rapport
          </Button>
        </div>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-primary" />
            <h1 className="text-xl font-bold">Rapport d'évaluation - {report.candidateName}</h1>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">Poste</div>
                <div className="text-lg font-semibold">{report.position}</div>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">Date d'entretien</div>
                <div className="text-lg font-semibold">{new Date(report.interviewDate).toLocaleDateString('fr-FR')}</div>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">Score global</div>
                <div className={`text-3xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}<span className="text-sm font-normal text-muted-foreground">/100</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold mr-2">Recommandation</h2>
                {getRecommendationIcon(report.recommendation)}
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-lg">{report.recommendation}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Résumé</h2>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p>{report.summary}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Évaluation par catégorie</h2>
          </div>
          <div className="p-6">
            <div className="space-y-8">
              {report.categories.map((category: any, index: number) => (
                <div key={index} className="border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <div className={`text-xl font-bold ${getScoreColor(category.score)}`}>
                      {category.score}<span className="text-sm font-normal text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <p className="mb-4">{category.feedback}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Points forts</h4>
                      <ul className="space-y-1">
                        {category.strengths.map((strength: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <ThumbsUp className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Points à améliorer</h4>
                      {category.weaknesses.length > 0 ? (
                        <ul className="space-y-1">
                          {category.weaknesses.map((weakness: string, i: number) => (
                            <li key={i} className="flex items-start">
                              <ThumbsDown className="h-4 w-4 text-red-500 dark:text-red-400 mr-2 mt-0.5" />
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun point majeur à améliorer identifié</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Questions et réponses</h2>
          </div>
          <div className="p-6">
            <div className="space-y-8">
              {report.questions.map((qa: any, index: number) => (
                <div key={index} className="border-b border-border pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold mb-3">Q{index + 1}: {qa.question}</h3>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="italic">"{qa.answer}"</p>
                  </div>
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Évaluation</h4>
                    <p>{qa.evaluation}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Score</h4>
                    <div className={`text-lg font-bold ${getScoreColor(qa.score)}`}>
                      {qa.score}<span className="text-sm font-normal text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}