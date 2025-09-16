"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, MessageSquare, BarChart, User, Mail, Phone, Briefcase, Calendar, Clock } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

// Données fictives pour la démonstration
const mockCandidates = {
  "1": {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    phone: "+33 6 12 34 56 78",
    position: "Développeur Frontend",
    status: "En attente d'entretien",
    score: null,
    appliedDate: "2023-10-15",
    lastActivity: "2023-10-20",
    education: [
      {
        degree: "Master en Informatique",
        institution: "Université de Paris",
        year: "2018-2020"
      },
      {
        degree: "Licence en Informatique",
        institution: "Université de Lyon",
        year: "2015-2018"
      }
    ],
    experience: [
      {
        title: "Développeur Frontend",
        company: "Tech Solutions",
        period: "2020-2023",
        description: "Développement d'applications web avec React et Next.js"
      },
      {
        title: "Stagiaire Développeur Web",
        company: "Digital Agency",
        period: "2019-2020",
        description: "Création de sites web responsive avec HTML, CSS et JavaScript"
      }
    ],
    skills: ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Next.js", "Git"]
  },
  "2": {
    id: "2",
    name: "Marie Martin",
    email: "marie.martin@example.com",
    phone: "+33 6 23 45 67 89",
    position: "UX Designer",
    status: "Entretien terminé",
    score: 85,
    appliedDate: "2023-09-28",
    lastActivity: "2023-10-18",
    education: [
      {
        degree: "Master en Design d'Interface",
        institution: "École de Design de Nantes",
        year: "2017-2019"
      },
      {
        degree: "Licence en Arts Appliqués",
        institution: "Université de Bordeaux",
        year: "2014-2017"
      }
    ],
    experience: [
      {
        title: "UX Designer",
        company: "Creative Studio",
        period: "2019-2023",
        description: "Conception d'interfaces utilisateur et réalisation de tests d'utilisabilité"
      },
      {
        title: "Stagiaire UI Designer",
        company: "Web Agency",
        period: "2018-2019",
        description: "Création de maquettes et prototypes pour applications mobiles"
      }
    ],
    skills: ["Figma", "Adobe XD", "Sketch", "Prototypage", "Recherche utilisateur", "Wireframing", "UI Design"]
  }
};

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  // Utiliser React.use() pour accéder aux params
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [candidate, setCandidate] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    status: string;
    score?: number;
    appliedDate: string;
    lastActivity: string;
    experience: Array<{
      title: string;
      company: string;
      period: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    skills: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement de données
    setTimeout(() => {
      const candidateData = mockCandidates[resolvedParams.id as keyof typeof mockCandidates];
      if (candidateData) {
        setCandidate(candidateData);
      }
      setLoading(false);
    }, 500);
  }, [resolvedParams.id]);

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

  if (!candidate) {
    return (
      <MainLayout>
        <div className="container py-10">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Candidat non trouvé</h1>
            <p className="text-muted-foreground mb-6">Le candidat que vous recherchez n&apos;existe pas ou a été supprimé.</p>
            <Button onClick={() => router.push("/candidates")}>Voir tous les candidats</Button>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colonne de gauche - Informations principales */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">{candidate.name}</h1>
                <p className="text-muted-foreground">{candidate.position}</p>
                <div className="mt-2">
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
                </div>
                {candidate.score && (
                  <div className="mt-4 bg-muted/30 p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Score d&apos;évaluation</div>
                    <div className="text-3xl font-bold">{candidate.score}<span className="text-sm font-normal text-muted-foreground">/100</span></div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <a href={`mailto:${candidate.email}`} className="text-sm text-primary hover:underline">{candidate.email}</a>
                  <p className="text-sm text-muted-foreground">L&apos;email est le moyen de contact privilégié</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Téléphone</div>
                    <a href={`tel:${candidate.phone}`} className="text-sm">{candidate.phone}</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Poste</div>
                    <div className="text-sm">{candidate.position}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Date de candidature</div>
                    <div className="text-sm">{new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Dernière activité</div>
                    <div className="text-sm">{new Date(candidate.lastActivity).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="w-full" onClick={() => router.push(`/candidates/${candidate.id}/cv`)}>
                  <FileText className="mr-2 h-4 w-4" /> Voir le CV
                </Button>
                {/*candidate.status !== "Entretien terminé" && (
                  <Button className="w-full" variant="outline" onClick={() => router.push(`/interviews/new?candidate=${candidate.id}`)}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Démarrer l'entretien
                  </Button>
                )*/}
                {candidate.status === "Entretien terminé" && (
                  <Button className="w-full" variant="outline" onClick={() => router.push(`/candidates/${candidate.id}/report`)}>
                    <BarChart className="mr-2 h-4 w-4" /> Voir le rapport
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Colonne de droite - Expérience, Éducation, Compétences */}
          <div className="md:col-span-2 space-y-6">
            {/* Expérience */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Expérience professionnelle</h2>
              <div className="space-y-6">
                {candidate.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-4 pb-2">
                    <h3 className="font-semibold">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company} | {exp.period}</p>
                    <p className="text-sm mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Éducation */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Formation</h2>
              <div className="space-y-6">
                {candidate.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-4 pb-2">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.institution} | {edu.year}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compétences */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Compétences</h2>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}