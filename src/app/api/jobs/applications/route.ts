import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JobApplication } from '@/types/job';

// GET /api/jobs/applications - Récupérer les candidatures
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const candidateOnly = searchParams.get('candidateOnly') === 'true';
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');

    // Construire la requête en fonction des paramètres
    const whereClause: any = {};

    // Si candidateOnly est true, filtrer par candidat (pour voir ses propres candidatures)
    if (candidateOnly) {
      if (session.user.role !== 'candidat') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
      whereClause.candidateId = session.user.id;
    } else {
      // Sinon, vérifier que l'utilisateur est un administrateur pour voir toutes les candidatures
      // ou un recruteur pour voir uniquement les candidatures liées à ses offres
      if (session.user.role !== 'admin' && session.user.role !== 'recruteur') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      // Pour les recruteurs, montrer uniquement les candidatures liées à leurs offres
      if (session.user.role === 'recruteur') {
        whereClause.job = {
          recruiterId: session.user.id
        };
      }
      // Pour les administrateurs, montrer toutes les candidatures (pas de filtre supplémentaire)
    }

    // Filtrer par statut si spécifié
    if (status && ['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      whereClause.status = status;
    }

    // Filtrer par offre d'emploi si spécifié
    if (jobId) {
      whereClause.jobId = jobId;
    }

    // Utiliser des données mock au lieu de prisma
    // Dans une application réelle, vous utiliseriez prisma pour accéder à la base de données
    const mockApplications = [
      {
        id: "1",
        jobId: "1",
        candidateId: "cand1",
        candidateName: "Sophie Martin",
        candidateEmail: "sophie.martin@example.com",
        coverLetter: "Je suis très intéressée par ce poste car il correspond parfaitement à mes compétences et aspirations professionnelles...",
        cvUrl: "/uploads/cv-sophie-martin.pdf",
        status: "pending",
        appliedAt: "2023-05-15T10:30:00Z",
        updatedAt: "2023-05-15T10:30:00Z"
      },
      {
        id: "2",
        jobId: "2",
        candidateId: "cand2",
        candidateName: "Thomas Dubois",
        candidateEmail: "thomas.dubois@example.com",
        coverLetter: "Ayant une expérience de 5 ans dans le développement web, je suis convaincu de pouvoir apporter une contribution significative...",
        cvUrl: "/uploads/cv-thomas-dubois.pdf",
        status: "reviewing",
        appliedAt: "2023-05-10T14:45:00Z",
        updatedAt: "2023-05-12T09:15:00Z"
      }
    ];
    
    // Filtrer les applications en fonction des critères
    let applications = [...mockApplications];
    
    if (jobId) {
      applications = applications.filter(app => app.jobId === jobId);
    }
    
    if (status) {
      applications = applications.filter(app => app.status === status);
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/jobs/applications - Créer une nouvelle candidature
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et a le rôle de candidat
    if (!session || session.user.role !== 'candidat') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Récupérer les données du formulaire
    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const cvFile = formData.get('cv') as File;
    
    // Validation des données
    if (!jobId || !coverLetter || !cvFile) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 });
    }
    
    // Simuler la vérification de l'existence de l'offre d'emploi
    const mockJobs = {
      "1": { title: "Développeur Frontend React", company: "TechSolutions" },
      "2": { title: "Développeur Backend Node.js", company: "WebInnovate" },
      "3": { title: "UX/UI Designer", company: "DesignStudio" },
      "4": { title: "Data Scientist", company: "DataInsight" },
      "5": { title: "DevOps Engineer", company: "CloudTech" }
    };
    
    const job = mockJobs[jobId];
    
    if (!job) {
      return NextResponse.json({ error: 'Offre d\'emploi non trouvée' }, { status: 404 });
    }
    
    // Simuler la vérification si l'utilisateur a déjà postulé à cette offre
    const mockApplications = [
      {
        id: "1",
        jobId: "1",
        candidateId: "cand1",
        status: "pending"
      }
    ];
    
    const existingApplication = mockApplications.find(app => app.jobId === jobId && app.candidateId === session.user.id);
    
    if (existingApplication) {
      return NextResponse.json({ error: 'Vous avez déjà postulé à cette offre' }, { status: 400 });
    }
    
    // Traitement du fichier CV
    // Dans un environnement de production, vous enregistreriez le fichier CV dans un stockage
    // Pour cette démonstration, nous stockons simplement le nom du fichier
    const cvFileName = `${session.user.id}-${Date.now()}-${cvFile.name}`;
    const cvUrl = `/uploads/cv/${cvFileName}`;
    
    // Simuler la création d'une candidature (sans prisma)
    const newApplication = {
      id: `app-${Date.now()}`,
      jobId,
      candidateId: session.user.id,
      candidateName: session.user.name || "Candidat",
      candidateEmail: session.user.email || "candidat@example.com",
      coverLetter,
      cvUrl,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      job: {
        title: mockJobs[jobId]?.title || "Offre d'emploi",
        company: mockJobs[jobId]?.company || "Entreprise"
      }
    };
    
    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la candidature:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Note: La fonction PATCH a été déplacée vers le fichier [id]/route.ts