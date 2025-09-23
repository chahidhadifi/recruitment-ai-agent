import Link from "next/link";
import { Search, ChevronRight, HelpCircle, FileText, MessageSquare, Users, Settings, Briefcase, Lightbulb, BookOpen, Shield } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Guides rapides pour les différents types d'utilisateurs
const userGuides = [
  {
    role: "candidat",
    title: "Guide du candidat",
    steps: [
      "Créez votre compte et complétez votre profil",
      "Téléchargez votre CV et vos documents",
      "Recherchez et postulez aux offres d'emploi",
      "Suivez l'état de vos candidatures",
      "Préparez-vous aux entretiens automatisés"
    ]
  },
  {
    role: "recruteur",
    title: "Guide du recruteur",
    steps: [
      "Publiez et gérez vos offres d'emploi",
      "Consultez les candidatures reçues",
      "Programmez des entretiens automatisés",
      "Analysez les rapports d'évaluation",
      "Suivez le processus de recrutement"
    ]
  },
  {
    role: "admin",
    title: "Guide de l'administrateur",
    steps: [
      "Gérez les utilisateurs et leurs droits",
      "Configurez les paramètres de la plateforme",
      "Personnalisez les modèles d'entretien",
      "Consultez les statistiques globales",
      "Gérez les intégrations avec d'autres outils"
    ]
  }
];

// Fonctionnalités principales avec explications simples
const keyFeatures = [
  {
    title: "Offres d'emploi",
    icon: <Briefcase className="h-6 w-6" />,
    description: "Publiez, recherchez et postulez aux offres d'emploi",
    actions: [
      { text: "Publier une offre", link: "/jobs/new", role: "recruteur" },
      { text: "Consulter les offres", link: "/jobs", role: "all" },
      { text: "Mes candidatures", link: "/jobs/my-applications", role: "candidat" }
    ]
  },
  {
    title: "Candidats",
    icon: <Users className="h-6 w-6" />,
    description: "Gérez les profils et les candidatures",
    actions: [
      { text: "Ajouter un candidat", link: "/candidates/new", role: "recruteur" },
      { text: "Liste des candidats", link: "/candidates", role: "recruteur" },
      { text: "Mon profil", link: "/profile", role: "candidat" }
    ]
  },
  {
    title: "Entretiens",
    icon: <MessageSquare className="h-6 w-6" />,
    description: "Entretiens automatisés par IA",
    actions: [
      { text: "Programmer un entretien", link: "/interviews/new", role: "recruteur" },
      { text: "Mes entretiens", link: "/interviews", role: "all" }
    ]
  },
  {
    title: "Rapports",
    icon: <FileText className="h-6 w-6" />,
    description: "Analyses et évaluations des candidats",
    actions: [
      { text: "Consulter les rapports", link: "/reports", role: "recruteur" }
    ]
  }
];

// FAQ avec questions fréquentes
const faqItems = [
  {
    question: "Comment créer un compte ?",
    answer: "Cliquez sur 'S'inscrire' en haut à droite de la page d'accueil. Remplissez le formulaire avec vos informations et choisissez votre type de compte (candidat ou recruteur)."
  },
  {
    question: "Comment postuler à une offre d'emploi ?",
    answer: "Consultez la liste des offres d'emploi, cliquez sur 'Voir l'offre' pour celle qui vous intéresse, puis sur 'Postuler'. Vous devrez être connecté en tant que candidat."
  },
  {
    question: "Comment publier une offre d'emploi ?",
    answer: "Connectez-vous en tant que recruteur, accédez à la page 'Offres d'emploi' et cliquez sur 'Publier une offre'. Remplissez le formulaire avec les détails du poste."
  },
  {
    question: "Comment fonctionne l'entretien automatisé ?",
    answer: "L'entretien automatisé utilise l'IA pour poser des questions pertinentes au candidat. Les réponses sont analysées pour générer un rapport d'évaluation complet."
  },
  {
    question: "Comment consulter les candidatures reçues ?",
    answer: "En tant que recruteur, accédez à vos offres d'emploi et cliquez sur le nombre de candidatures pour voir la liste des candidats ayant postulé."
  }
];

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col items-center text-center mb-8">
          <HelpCircle className="h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold">Aide et support</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Tout ce dont vous avez besoin pour utiliser efficacement notre plateforme de recrutement IA
          </p>
        </div>

        {/* Barre de recherche simplifiée */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Comment puis-je vous aider aujourd'hui ?"
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
          />
        </div>

        {/* Onglets pour différentes sections d'aide */}
        <Tabs defaultValue="guides" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guides">Guides rapides</TabsTrigger>
            <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Support</TabsTrigger>
          </TabsList>
          
          {/* Guides rapides par type d'utilisateur */}
          <TabsContent value="guides" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userGuides.map((guide, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold">{guide.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm">{step}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Fonctionnalités principales */}
          <TabsContent value="features" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keyFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.actions.map((action, actionIndex) => (
                        <Button key={actionIndex} variant="outline" size="sm" asChild>
                          <Link href={action.link}>{action.text}</Link>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* FAQ */}
          <TabsContent value="faq" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="pb-4 border-b last:border-0">
                      <h3 className="text-lg font-medium flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                        {item.question}
                      </h3>
                      <p className="mt-2 text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contact et support */}
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center text-center p-6 bg-muted/30 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Support technique</h3>
                    <p className="text-muted-foreground mb-4">
                      Besoin d'aide avec un problème technique ? Notre équipe est là pour vous aider.
                    </p>
                    <Button>Contacter le support</Button>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 bg-muted/30 rounded-lg">
                    <BookOpen className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Documentation</h3>
                    <p className="text-muted-foreground mb-4">
                      Consultez notre documentation détaillée pour des guides pas à pas.
                    </p>
                    <Button variant="outline">Voir la documentation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Ressources supplémentaires */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Ressources supplémentaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/help/tutorials" className="flex items-center p-4 bg-card rounded-lg hover:bg-muted/50">
              <BookOpen className="h-5 w-5 mr-3 text-primary" />
              <span>Tutoriels vidéo</span>
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Link>
            <Link href="/help/best-practices" className="flex items-center p-4 bg-card rounded-lg hover:bg-muted/50">
              <Lightbulb className="h-5 w-5 mr-3 text-primary" />
              <span>Bonnes pratiques</span>
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Link>
            <Link href="/help/security" className="flex items-center p-4 bg-card rounded-lg hover:bg-muted/50">
              <Shield className="h-5 w-5 mr-3 text-primary" />
              <span>Sécurité et confidentialité</span>
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}