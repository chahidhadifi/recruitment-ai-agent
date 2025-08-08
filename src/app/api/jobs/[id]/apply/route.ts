import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JobApplication } from '@/types/job';

// Données fictives pour les candidatures
const mockApplications: Record<string, JobApplication[]> = {};

// POST /api/jobs/:id/apply - Postuler à une offre d'emploi
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un candidat
    if (session.user.role !== 'candidat') {
      return NextResponse.json({ error: 'Seuls les candidats peuvent postuler' }, { status: 403 });
    }

    const jobId = params.id;
    
    // Vérifier si l'ID est valide
    if (!jobId) {
      return NextResponse.json({ error: 'ID de l\'offre manquant' }, { status: 400 });
    }

    // Récupérer les données du corps de la requête
    const data = await request.json();

    // Validation des données
    if (!data.coverLetter) {
      return NextResponse.json({ error: 'Lettre de motivation requise' }, { status: 400 });
    }

    if (!data.cvUrl) {
      return NextResponse.json({ error: 'CV requis' }, { status: 400 });
    }

    // Vérifier si l'utilisateur a déjà postulé à cette offre
    const existingApplications = mockApplications[jobId] || [];
    const hasApplied = existingApplications.some(app => app.candidateId === session.user.id);

    if (hasApplied) {
      return NextResponse.json({ error: 'Vous avez déjà postulé à cette offre' }, { status: 400 });
    }

    // Créer une nouvelle candidature
    const newApplication: JobApplication = {
      id: `${jobId}-${session.user.id}-${Date.now()}`,
      jobId,
      candidateId: session.user.id,
      coverLetter: data.coverLetter,
      cvUrl: data.cvUrl,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ajouter la candidature aux données mockées
    if (!mockApplications[jobId]) {
      mockApplications[jobId] = [];
    }
    mockApplications[jobId].push(newApplication);

    // Dans un environnement réel, vous enregistreriez la candidature dans une base de données
    // et mettriez à jour le nombre de candidatures pour l'offre d'emploi

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la soumission de la candidature:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET /api/jobs/:id/apply - Récupérer les candidatures pour une offre d'emploi (pour les recruteurs)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Récupérer les candidatures pour cette offre
    const applications = mockApplications[jobId] || [];

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}