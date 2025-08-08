"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

// Données fictives pour la démonstration
const mockCandidates = {
  "1": {
    id: "1",
    name: "Jean Dupont",
    position: "Développeur Frontend",
    cvContent: `# Jean Dupont
## Développeur Frontend

**Contact:** jean.dupont@example.com | +33 6 12 34 56 78

### Résumé
Développeur Frontend passionné avec 3 ans d'expérience dans la création d'interfaces utilisateur modernes et réactives. Spécialisé dans React, Next.js et TypeScript.

### Expérience Professionnelle

**Développeur Frontend** | Tech Solutions | 2020-2023
- Développement d'applications web avec React et Next.js
- Implémentation de designs responsive et accessibles
- Collaboration avec les designers UX/UI pour créer des interfaces intuitives
- Optimisation des performances frontend

**Stagiaire Développeur Web** | Digital Agency | 2019-2020
- Création de sites web responsive avec HTML, CSS et JavaScript
- Intégration de maquettes Figma
- Maintenance et mise à jour de sites existants

### Formation

**Master en Informatique** | Université de Paris | 2018-2020

**Licence en Informatique** | Université de Lyon | 2015-2018

### Compétences

- JavaScript, TypeScript
- React, Next.js
- HTML5, CSS3, Sass
- Git, GitHub
- Responsive Design
- Tailwind CSS
- Jest, Testing Library
- Webpack, Babel

### Langues

- Français (natif)
- Anglais (courant)
- Espagnol (intermédiaire)

### Projets Personnels

**Portfolio Personnel** - Site web personnel développé avec Next.js et Tailwind CSS

**Application de Gestion de Tâches** - Application React avec gestion d'état Redux et backend Firebase

**Extension Chrome** - Outil de productivité pour développeurs
`,
  },
  "2": {
    id: "2",
    name: "Marie Martin",
    position: "UX Designer",
    cvContent: `# Marie Martin
## UX Designer

**Contact:** marie.martin@example.com | +33 6 23 45 67 89

### Résumé
UX Designer créative avec 4 ans d'expérience dans la conception d'interfaces utilisateur centrées sur l'humain. Expertise en recherche utilisateur, wireframing, prototypage et tests d'utilisabilité.

### Expérience Professionnelle

**UX Designer** | Creative Studio | 2019-2023
- Conception d'interfaces utilisateur et réalisation de tests d'utilisabilité
- Création de personas et parcours utilisateur
- Animation d'ateliers de design thinking
- Collaboration avec les développeurs pour l'implémentation des designs

**Stagiaire UI Designer** | Web Agency | 2018-2019
- Création de maquettes et prototypes pour applications mobiles
- Participation aux réunions client et présentation des concepts
- Assistance à la direction artistique

### Formation

**Master en Design d'Interface** | École de Design de Nantes | 2017-2019

**Licence en Arts Appliqués** | Université de Bordeaux | 2014-2017

### Compétences

- Figma, Adobe XD, Sketch
- Prototypage et wireframing
- Recherche utilisateur
- Tests d'utilisabilité
- Design System
- UI Design
- HTML/CSS (notions)
- Design Thinking

### Langues

- Français (natif)
- Anglais (courant)
- Allemand (notions)

### Projets

**Refonte UX d'une application bancaire** - Projet personnel de refonte complète de l'expérience utilisateur

**Design System pour startup** - Création d'un système de design complet pour une startup de la foodtech

**Application de méditation** - Conception UX/UI d'une application mobile de méditation et bien-être
`,
  },
};

export default function CandidateCVPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement de données
    setTimeout(() => {
      const candidateData = mockCandidates[params.id as keyof typeof mockCandidates];
      if (candidateData) {
        setCandidate(candidateData);
      }
      setLoading(false);
    }, 500);
  }, [params.id]);

  const downloadCV = () => {
    if (!candidate) return;
    
    // Création d'un blob pour le téléchargement
    const blob = new Blob([candidate.cvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${candidate.name.replace(' ', '_')}.md`;
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

  if (!candidate) {
    return (
      <MainLayout>
        <div className="container py-10">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">CV non trouvé</h1>
            <p className="text-muted-foreground mb-6">Le CV que vous recherchez n'existe pas ou a été supprimé.</p>
            <Button onClick={() => router.push(`/candidates/${params.id}`)}>Retour au profil</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Fonction pour convertir le Markdown en HTML (version simplifiée)
  const renderMarkdown = (markdown: string) => {
    let html = markdown
      // Titres
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-2">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-6 mb-2">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
      // Gras
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italique
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Listes
      .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>')
      // Paragraphes
      .replace(/^(?!<[hl]|<li|$)(.+)$/gm, '<p class="mb-2">$1</p>')
      // Regrouper les listes
      .replace(/(<li[^>]*>.*<\/li>\n)+/g, (match) => `<ul class="my-2">${match}</ul>`);

    return { __html: html };
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <Button onClick={downloadCV}>
            <Download className="mr-2 h-4 w-4" /> Télécharger le CV
          </Button>
        </div>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            <h1 className="text-xl font-bold">CV de {candidate.name}</h1>
          </div>
          <div className="p-6 max-w-4xl mx-auto">
            <div 
              className="prose prose-sm md:prose-base dark:prose-invert max-w-none" 
              dangerouslySetInnerHTML={renderMarkdown(candidate.cvContent)} 
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}