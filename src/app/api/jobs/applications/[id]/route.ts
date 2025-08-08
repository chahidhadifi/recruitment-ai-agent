import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Données fictives pour les candidatures
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

// GET /api/jobs/applications/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    // Vérifier si l'utilisateur est un recruteur ou un administrateur
    const userRole = session.user?.role;
    if (userRole !== "recruteur" && userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    
    // Récupérer l'ID de la candidature
    const { id: applicationId } = await params;
    
    // Rechercher la candidature dans les données fictives
    const application = mockApplications.find(app => app.id === applicationId);
    
    if (!application) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 });
    }
    
    return NextResponse.json(application);
  } catch (error) {
    console.error("Erreur lors de la récupération de la candidature:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/jobs/applications/[id] - Mettre à jour le statut d'une candidature (pour les recruteurs)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  // Vérifier si l'utilisateur est connecté
  if (!session) {
    return NextResponse.json({ error: 'Vous devez être connecté pour accéder à cette ressource' }, { status: 401 });
  }
  
  // Vérifier si l'utilisateur est un administrateur (seuls les administrateurs peuvent modifier les candidatures)
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Seuls les administrateurs peuvent modifier le statut des candidatures' }, { status: 403 });
  }
  
  try {
    const { id: applicationId } = await params;
    
    // Définir les données mock pour les applications
    const application = mockApplications.find(app => app.id === applicationId);
    
    if (!applicationId || !application) {
      return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 });
    }
    
    const data = await request.json();
    const { status } = data;
    
    if (!status || !['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    
    // Dans un environnement réel, vous mettriez à jour le statut dans votre base de données
    // Pour cette démonstration, nous retournons simplement un objet mis à jour
    const updatedApplication = {
      ...application,
      status,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la candidature:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}