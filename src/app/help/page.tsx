import Link from "next/link";
import { Search, ChevronRight, HelpCircle, FileText, MessageSquare, Users, Settings, BarChart } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

const helpCategories = [
  {
    title: "Premiers pas",
    icon: <HelpCircle className="h-6 w-6" />,
    description: "Apprenez les bases de la plateforme et comment commencer",
    articles: [
      { title: "Bienvenue sur la plateforme de recrutement IA", slug: "welcome" },
      { title: "Configuration de votre compte", slug: "account-setup" },
      { title: "Ajouter votre premier candidat", slug: "add-first-candidate" },
      { title: "Comprendre le tableau de bord", slug: "dashboard-overview" },
    ],
  },
  {
    title: "Gestion des candidats",
    icon: <Users className="h-6 w-6" />,
    description: "Tout ce que vous devez savoir sur la gestion des candidats",
    articles: [
      { title: "Ajouter et modifier des candidats", slug: "manage-candidates" },
      { title: "Importer des CV en masse", slug: "bulk-import" },
      { title: "Rechercher et filtrer les candidats", slug: "search-filter" },
      { title: "Comprendre les statuts des candidats", slug: "candidate-statuses" },
    ],
  },
  {
    title: "Entretiens automatisés",
    icon: <MessageSquare className="h-6 w-6" />,
    description: "Comment configurer et mener des entretiens avec l'IA",
    articles: [
      { title: "Configurer un entretien automatisé", slug: "setup-interview" },
      { title: "Personnaliser les questions d'entretien", slug: "customize-questions" },
      { title: "Analyser les résultats d'entretien", slug: "analyze-results" },
      { title: "Bonnes pratiques pour les entretiens IA", slug: "best-practices" },
    ],
  },
  {
    title: "Rapports et analyses",
    icon: <BarChart className="h-6 w-6" />,
    description: "Comprendre et utiliser les rapports d'évaluation",
    articles: [
      { title: "Comprendre les scores des candidats", slug: "candidate-scores" },
      { title: "Interpréter les rapports d'évaluation", slug: "evaluation-reports" },
      { title: "Exporter des données et rapports", slug: "export-data" },
      { title: "Statistiques et tendances de recrutement", slug: "recruitment-stats" },
    ],
  },
  {
    title: "Paramètres et configuration",
    icon: <Settings className="h-6 w-6" />,
    description: "Personnaliser la plateforme selon vos besoins",
    articles: [
      { title: "Gérer les utilisateurs et les rôles", slug: "users-roles" },
      { title: "Configurer les notifications", slug: "notifications" },
      { title: "Personnaliser l'apparence", slug: "appearance" },
      { title: "Intégrations avec d'autres outils", slug: "integrations" },
    ],
  },
  {
    title: "Ressources techniques",
    icon: <FileText className="h-6 w-6" />,
    description: "Documentation technique et guides avancés",
    articles: [
      { title: "API et intégrations", slug: "api-docs" },
      { title: "Sécurité et confidentialité des données", slug: "security" },
      { title: "Résolution des problèmes courants", slug: "troubleshooting" },
      { title: "Mises à jour et nouvelles fonctionnalités", slug: "updates" },
    ],
  },
];

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-2">Centre d'aide</h1>
        <p className="text-muted-foreground mb-8">Trouvez des réponses à vos questions et apprenez à utiliser la plateforme</p>

        {/* Barre de recherche */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Rechercher dans la documentation..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
          />
        </div>

        {/* Catégories d'aide */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-bold">{category.title}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <Link 
                        href={`/help/articles/${article.slug}`}
                        className="flex items-center py-2 px-3 rounded-md hover:bg-muted/50 text-sm"
                      >
                        <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-4 bg-muted/30 border-t">
                <Link 
                  href={`/help/categories/${category.title.toLowerCase().replace(/ /g, '-')}`}
                  className="text-sm font-medium text-primary hover:underline flex items-center"
                >
                  Voir tous les articles
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Section de contact */}
        <div className="mt-12 bg-card rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Notre équipe de support est disponible pour vous aider avec toutes vos questions concernant la plateforme de recrutement IA.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg">
              <MessageSquare className="mr-2 h-5 w-5" /> Contacter le support
            </Button>
            <Button variant="outline" size="lg">
              <FileText className="mr-2 h-5 w-5" /> Consulter la documentation
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}