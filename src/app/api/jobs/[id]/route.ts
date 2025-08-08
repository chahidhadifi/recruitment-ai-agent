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

// GET /api/jobs/:id - Récupérer une offre d'emploi spécifique
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id;
    
    // Vérifier si l'ID est valide
    if (!jobId) {
      return NextResponse.json({ error: 'ID de l\'offre manquant' }, { status: 400 });
    }

    // Récupérer l'offre d'emploi à partir des données mockées
    const job = mockJobs[jobId];

    if (!job) {
      return NextResponse.json({ error: 'Offre d\'emploi non trouvée' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre d\'emploi:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/jobs/:id - Mettre à jour une offre d'emploi
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un recruteur ou un administrateur
    if (session.user.role !== 'recruteur' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const jobId = params.id;
    
    // Vérifier si l'ID est valide
    if (!jobId) {
      return NextResponse.json({ error: 'ID de l\'offre manquant' }, { status: 400 });
    }

    // Récupérer les données du corps de la requête
    const data = await request.json();

    // Vérifier si l'offre existe et appartient au recruteur (sauf pour les admins)
    const job = mockJobs[jobId];

    if (!job) {
      return NextResponse.json({ error: 'Offre d\'emploi non trouvée' }, { status: 404 });
    }

    // Vérifier si l'utilisateur est le propriétaire de l'offre ou un admin
    if (session.user.role !== 'admin' && job.recruiter !== session.user.id) {
      return NextResponse.json({ error: 'Vous n\'êtes pas autorisé à modifier cette offre' }, { status: 403 });
    }

    // Mettre à jour uniquement les champs fournis
    if (data.title) job.title = data.title;
    if (data.company) job.company = data.company;
    if (data.location) job.location = data.location;
    if (data.type) job.type = data.type;
    if (data.salary) job.salary = data.salary;
    if (data.description) job.description = data.description;
    
    // Mettre à jour les tableaux
    if (data.responsibilities) {
      job.responsibilities = Array.isArray(data.responsibilities) 
        ? data.responsibilities 
        : [data.responsibilities];
    }
    
    if (data.requirements) {
      job.requirements = Array.isArray(data.requirements) 
        ? data.requirements 
        : [data.requirements];
    }
    
    if (data.benefits) {
      job.benefits = Array.isArray(data.benefits) 
        ? data.benefits 
        : [data.benefits];
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre d\'emploi:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/jobs/:id - Supprimer une offre d'emploi
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un recruteur ou un administrateur
    if (session.user.role !== 'recruteur' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const jobId = params.id;
    
    // Vérifier si l'ID est valide
    if (!jobId) {
      return NextResponse.json({ error: 'ID de l\'offre manquant' }, { status: 400 });
    }

    // Vérifier si l'offre existe et appartient au recruteur (sauf pour les admins)
    const job = mockJobs[jobId];

    if (!job) {
      return NextResponse.json({ error: 'Offre d\'emploi non trouvée' }, { status: 404 });
    }

    // Vérifier si l'utilisateur est le propriétaire de l'offre ou un admin
    if (session.user.role !== 'admin' && job.recruiter !== session.user.id) {
      return NextResponse.json({ error: 'Vous n\'êtes pas autorisé à supprimer cette offre' }, { status: 403 });
    }

    // Supprimer l'offre d'emploi des données mockées
    delete mockJobs[jobId];

    return NextResponse.json({ message: 'Offre d\'emploi supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre d\'emploi:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}