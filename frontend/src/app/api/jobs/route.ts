import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Job } from '@/types/job';

// Données fictives pour la démonstration
const mockJobs: Record<string, Job> = {
  "1": {
    id: "1",
    title: "Développeur Frontend React",
    company: "TechSolutions",
    location: "Paris, France",
    type: "CDI",
    salary: "45 000€ - 60 000€",
    postedDate: "2023-11-15",
    description: "Nous recherchons un développeur Frontend React expérimenté pour rejoindre notre équipe de développement web. Vous serez responsable de la création d'interfaces utilisateur réactives et performantes pour nos applications web.",
    responsibilities: [
      "Développer des interfaces utilisateur réactives et performantes",
      "Collaborer avec les designers UX/UI pour implémenter les maquettes",
      "Travailler avec les développeurs backend pour intégrer les API",
      "Optimiser les applications pour une performance maximale",
      "Participer aux revues de code et assurer la qualité du code"
    ],
    requirements: [
      "3+ ans d'expérience en développement React",
      "Maîtrise de JavaScript/TypeScript",
      "Expérience avec les API RESTful",
      "Connaissance de Next.js est un plus",
      "Bonne compréhension des principes de responsive design",
      "Expérience avec les outils de test comme Jest ou React Testing Library"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Mutuelle d'entreprise",
      "Tickets restaurant"
    ],
    recruiter: "recruteur-1",
    applications: 12
  },
  "2": {
    id: "2",
    title: "UX/UI Designer",
    company: "DesignStudio",
    location: "Lyon, France",
    type: "CDI",
    salary: "40 000€ - 55 000€",
    postedDate: "2023-11-10",
    description: "Rejoignez notre studio de design pour créer des expériences utilisateur exceptionnelles pour nos clients. Vous travaillerez sur des projets variés allant des applications mobiles aux sites web.",
    responsibilities: [
      "Créer des wireframes, prototypes et maquettes haute fidélité",
      "Conduire des recherches utilisateurs et des tests d'utilisabilité",
      "Collaborer avec les développeurs pour assurer une implémentation fidèle",
      "Créer et maintenir des systèmes de design cohérents",
      "Présenter les concepts de design aux clients et aux parties prenantes"
    ],
    requirements: [
      "Portfolio démontrant des compétences en UX/UI",
      "Maîtrise de Figma et Adobe Creative Suite",
      "Expérience en recherche utilisateur",
      "Capacité à travailler en équipe multidisciplinaire",
      "Connaissance des principes d'accessibilité web",
      "Expérience dans la création de systèmes de design"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Budget matériel",
      "Abonnements à des ressources de design",
      "Participation à des conférences de design"
    ],
    recruiter: "recruteur-1",
    applications: 8
  },
  "3": {
    id: "3",
    title: "Développeur Backend Node.js",
    company: "ServerTech",
    location: "Bordeaux, France",
    type: "CDD",
    salary: "40 000€ - 50 000€",
    postedDate: "2023-11-05",
    description: "Nous cherchons un développeur Backend pour renforcer notre équipe et développer nos API. Vous serez responsable de la conception et du développement de services backend robustes et évolutifs.",
    responsibilities: [
      "Concevoir et développer des API RESTful",
      "Implémenter des modèles de données et des schémas de base de données",
      "Assurer la sécurité et la performance des applications",
      "Collaborer avec l'équipe frontend pour l'intégration des API",
      "Participer à l'amélioration continue de notre architecture"
    ],
    requirements: [
      "Expérience avec Node.js et Express",
      "Connaissance des bases de données SQL et NoSQL",
      "Compréhension des principes de sécurité web",
      "Expérience avec Docker est un plus",
      "Familiarité avec les principes de microservices",
      "Expérience en développement d'API RESTful"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Mutuelle d'entreprise",
      "Tickets restaurant"
    ],
    recruiter: "recruteur-2",
    applications: 5
  },
  "4": {
    id: "4",
    title: "Data Scientist",
    company: "DataInsights",
    location: "Toulouse, France",
    type: "CDI",
    salary: "50 000€ - 70 000€",
    postedDate: "2023-11-01",
    description: "Rejoignez notre équipe d'analyse de données pour transformer les données brutes en insights précieux. Vous travaillerez sur des projets variés dans différents secteurs d'activité.",
    responsibilities: [
      "Analyser de grands ensembles de données complexes",
      "Développer des modèles prédictifs et des algorithmes de machine learning",
      "Créer des visualisations de données et des tableaux de bord",
      "Collaborer avec les équipes produit pour implémenter des solutions basées sur les données",
      "Communiquer les résultats et insights aux parties prenantes"
    ],
    requirements: [
      "Master ou PhD en Data Science, Statistiques ou domaine connexe",
      "Expérience avec Python, R et outils d'analyse de données",
      "Connaissance des algorithmes de machine learning",
      "Expérience en visualisation de données",
      "Familiarité avec les bases de données SQL et NoSQL",
      "Expérience avec des frameworks de big data comme Spark"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Accès à des ressources de calcul haute performance",
      "Participation à des conférences et événements"
    ],
    recruiter: "recruteur-1",
    applications: 15
  },
  "5": {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudSystems",
    location: "Lille, France",
    type: "CDI",
    salary: "45 000€ - 65 000€",
    postedDate: "2023-10-25",
    description: "Nous recherchons un ingénieur DevOps pour améliorer notre infrastructure cloud et nos processus de déploiement. Vous serez responsable de l'automatisation et de l'optimisation de nos environnements de développement et de production.",
    responsibilities: [
      "Concevoir et maintenir notre infrastructure cloud",
      "Automatiser les processus de déploiement et d'intégration continue",
      "Optimiser la performance et la sécurité de nos systèmes",
      "Mettre en place des outils de monitoring et d'alerte",
      "Collaborer avec les équipes de développement pour résoudre les problèmes d'infrastructure"
    ],
    requirements: [
      "Expérience avec AWS, Azure ou GCP",
      "Maîtrise de Docker, Kubernetes et Terraform",
      "Connaissance des pratiques CI/CD",
      "Expérience en automatisation et scripting",
      "Familiarité avec les outils de monitoring comme Prometheus et Grafana",
      "Connaissance des principes de sécurité cloud"
    ],
    benefits: [
      "Salaire compétitif",
      "Télétravail partiel",
      "Horaires flexibles",
      "Formation continue",
      "Mutuelle d'entreprise",
      "Tickets restaurant"
    ],
    recruiter: "recruteur-2",
    applications: 7
  }
};

import axios from 'axios';

// GET /api/jobs - Récupérer toutes les offres d'emploi
export async function GET(request: NextRequest) {
  try {
    // Authentication check removed as per instruction
    const session = await getServerSession(authOptions);
    
    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query')?.toLowerCase();
    
    // Construire l'URL de l'API backend avec les paramètres de recherche
    let backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/jobs/`;
    
    // Ajouter les paramètres de requête si nécessaire
    const params: Record<string, string> = {};
    if (query) {
      params.title = query;
    }
    
    // Appeler l'API backend avec axios - Authentication header removed
    const response = await axios.get(backendUrl, {
      params
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des offres d'emploi" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Créer une nouvelle offre d'emploi
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Vérifier si l'utilisateur est connecté et a le rôle de recruteur ou admin
  if (!session || (session.user.role !== 'recruteur' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  
  try {
    const jobData = await request.json();
    
    // Validation des données
    if (!jobData.title || !jobData.company || !jobData.description) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 });
    }
    
    // Dans un environnement de production, vous enregistreriez les données dans une base de données
    // Pour cette démonstration, nous simulons la création d'une nouvelle offre
    const newJobId = (Math.max(...Object.keys(mockJobs).map(Number)) + 1).toString();
    
    const newJob: Job = {
      id: newJobId,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location || 'Non spécifié',
      type: jobData.type || 'CDI',
      salary: jobData.salary || 'Non spécifié',
      postedDate: new Date().toISOString().split('T')[0],
      description: jobData.description,
      responsibilities: jobData.responsibilities || [],
      requirements: jobData.requirements || [],
      benefits: jobData.benefits || [],
      recruiter: session.user.id,
      applications: 0
    };
    
    // Dans un environnement réel, vous enregistreriez newJob dans votre base de données
    // Pour cette démonstration, nous le retournons simplement
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l&apos;offre d&apos;emploi:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}