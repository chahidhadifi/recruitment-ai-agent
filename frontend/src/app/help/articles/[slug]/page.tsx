import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Copy, Printer } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";

// Données fictives pour les articles d'aide
const helpArticles = {
  "welcome": {
    title: "Bienvenue sur la plateforme de recrutement IA",
    category: "Premiers pas",
    lastUpdated: "2023-10-15",
    content: `
## Bienvenue sur la plateforme de recrutement IA

Notre plateforme de recrutement alimentée par l'intelligence artificielle est conçue pour simplifier et optimiser votre processus de recrutement. Grâce à des technologies avancées d'IA, nous automatisons les tâches chronophages tout en vous fournissant des insights précieux pour prendre les meilleures décisions d'embauche.

### Fonctionnalités principales

- **Analyse automatique des CV** : Notre IA analyse les CV et extrait les informations pertinentes pour vous aider à identifier rapidement les candidats qualifiés.

- **Entretiens automatisés** : Configurez des entretiens automatisés qui s'adaptent au profil du candidat et au poste recherché.

- **Évaluation objective** : Obtenez des rapports d'évaluation détaillés basés sur des critères objectifs pour chaque candidat.

- **Tableau de bord intuitif** : Suivez facilement l'avancement de vos recrutements et accédez à des statistiques pertinentes.

### Comment commencer

1. **Configurez votre compte** : Complétez votre profil et personnalisez les paramètres selon vos besoins.

2. **Ajoutez votre premier candidat** : Importez un CV ou ajoutez manuellement les informations d'un candidat.

3. **Lancez un entretien** : Configurez et démarrez un entretien automatisé avec un candidat.

4. **Analysez les résultats** : Consultez le rapport d'évaluation généré par notre IA.

### Ressources supplémentaires

Pour vous aider à tirer le meilleur parti de notre plateforme, nous avons préparé plusieurs ressources :

- [Configuration de votre compte](/help/articles/account-setup)
- [Ajouter votre premier candidat](/help/articles/add-first-candidate)
- [Comprendre le tableau de bord](/help/articles/dashboard-overview)

Si vous avez des questions, n'hésitez pas à contacter notre équipe de support qui sera ravie de vous aider.
    `,
    relatedArticles: [
      { title: "Configuration de votre compte", slug: "account-setup" },
      { title: "Ajouter votre premier candidat", slug: "add-first-candidate" },
      { title: "Comprendre le tableau de bord", slug: "dashboard-overview" },
    ],
  },
  "account-setup": {
    title: "Configuration de votre compte",
    category: "Premiers pas",
    lastUpdated: "2023-10-12",
    content: `
## Configuration de votre compte

Pour tirer le meilleur parti de notre plateforme de recrutement IA, il est important de bien configurer votre compte. Ce guide vous aidera à personnaliser votre profil et à définir les paramètres selon vos besoins.

### Compléter votre profil

1. **Informations personnelles** : Accédez à la page Paramètres et complétez vos informations personnelles (nom, email, etc.).

2. **Informations de l'entreprise** : Ajoutez le nom de votre entreprise et votre rôle pour personnaliser votre expérience.

3. **Photo de profil** : Ajoutez une photo de profil professionnelle pour personnaliser votre compte.

### Paramètres de notification

Personnalisez vos préférences de notification pour rester informé des activités importantes :

- **Notifications par email** : Activez ou désactivez les notifications par email.
- **Alertes de nouveaux candidats** : Recevez des alertes lorsque de nouveaux candidats sont ajoutés.
- **Rappels d'entretiens** : Soyez notifié avant les entretiens programmés.
- **Alertes de rapports** : Recevez une notification lorsqu'un rapport d'évaluation est prêt.

### Paramètres de sécurité

Renforcez la sécurité de votre compte :

1. **Mot de passe fort** : Assurez-vous d'utiliser un mot de passe fort et unique.
2. **Authentification à deux facteurs** : Activez l'authentification à deux facteurs pour une sécurité renforcée.
3. **Expiration de session** : Définissez la durée après laquelle vous serez automatiquement déconnecté.

### Personnalisation de l'interface

Adaptez l'interface à vos préférences :

- **Thème** : Choisissez entre le thème clair, sombre ou système.
- **Langue** : Sélectionnez votre langue préférée.
- **Format de date** : Définissez le format de date qui vous convient le mieux.

Une fois votre compte configuré, vous serez prêt à commencer à utiliser toutes les fonctionnalités de notre plateforme de recrutement IA.
    `,
    relatedArticles: [
      { title: "Bienvenue sur la plateforme de recrutement IA", slug: "welcome" },
      { title: "Gérer les utilisateurs et les rôles", slug: "users-roles" },
      { title: "Configurer les notifications", slug: "notifications" },
    ],
  },
};

export default function HelpArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = helpArticles[slug as keyof typeof helpArticles];

  if (!article) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Article principal */}
          <div className="md:w-3/4">
            <div className="mb-4">
              <Link 
                href="/help" 
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Retour au centre d&apos;aide
              </Link>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
                  <div className="flex flex-wrap items-center text-sm text-muted-foreground">
                    <span className="mr-4">Catégorie: {article.category}</span>
                    <span>Dernière mise à jour: {new Date(article.lastUpdated).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  {article.content.split('\n').map((line, index) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('### ', '')}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={index} className="ml-6 mb-2">{line.replace('- ', '')}</li>;
                    } else if (line.startsWith('1. ')) {
                      return <div key={index} className="ml-6 mb-2 flex"><span className="mr-2">{line.split('.')[0]}.</span><span>{line.replace(/^\d+\.\s/, '')}</span></div>;
                    } else if (line.trim() === '') {
                      return <div key={index} className="h-4"></div>;
                    } else {
                      return <p key={index} className="mb-4">{line}</p>;
                    }
                  })}
                </div>
                
                <div className="mt-10 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Cet article vous a-t-il été utile ?</h3>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="mr-2 h-4 w-4" /> Oui
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsDown className="mr-2 h-4 w-4" /> Non
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-4 bg-muted/30 border-t flex justify-between">
                <Button variant="ghost" size="sm">
                  <Copy className="mr-2 h-4 w-4" /> Copier le lien
                </Button>
                <Button variant="ghost" size="sm">
                  <Printer className="mr-2 h-4 w-4" /> Imprimer
                </Button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-card rounded-lg shadow-sm overflow-hidden sticky top-24">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Articles connexes</h3>
                <ul className="space-y-3">
                  {article.relatedArticles.map((relatedArticle, index) => (
                    <li key={index}>
                      <Link 
                        href={`/help/articles/${relatedArticle.slug}`}
                        className="flex items-start py-2 text-sm hover:text-primary"
                      >
                        <ChevronRight className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <span>{relatedArticle.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Besoin d&apos;aide supplémentaire ?</h3>
                <Button className="w-full">
                  Contacter le support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}