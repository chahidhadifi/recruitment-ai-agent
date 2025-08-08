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
  },
  {
    id: "3",
    jobId: "3",
    candidateId: "cand3",
    candidateName: "Emma Leroy",
    candidateEmail: "emma.leroy@example.com",
    coverLetter: "Mon parcours en tant que UX/UI designer m'a permis de développer une expertise dans la création d'interfaces utilisateur intuitives...",
    cvUrl: "/uploads/cv-emma-leroy.pdf",
    status: "accepted",
    appliedAt: "2023-05-05T11:20:00Z",
    updatedAt: "2023-05-18T16:30:00Z"
  },
  {
    id: "4",
    jobId: "1",
    candidateId: "cand4",
    candidateName: "Lucas Moreau",
    candidateEmail: "lucas.moreau@example.com",
    coverLetter: "Je suis passionné par le développement frontend et j'ai une solide expérience avec React et Next.js...",
    cvUrl: "/uploads/cv-lucas-moreau.pdf",
    status: "rejected",
    appliedAt: "2023-05-08T09:10:00Z",
    updatedAt: "2023-05-16T13:45:00Z"
  },
  {
    id: "5",
    jobId: "4",
    candidateId: "cand5",
    candidateName: "Julie Petit",
    candidateEmail: "julie.petit@example.com",
    coverLetter: "En tant que data scientist expérimentée, j'ai développé des compétences avancées en analyse de données et machine learning...",
    cvUrl: "/uploads/cv-julie-petit.pdf",
    status: "pending",
    appliedAt: "2023-05-17T15:25:00Z",
    updatedAt: "2023-05-17T15:25:00Z"
  }
];

// GET /api/applications/[id]
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    // Vérifier si l'utilisateur est un administrateur (seuls les administrateurs peuvent modifier les candidatures)
    const userRole = session.user?.role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Seuls les administrateurs peuvent modifier le statut des candidatures" }, { status: 403 });
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

// PATCH /api/applications/[id]
export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    // Vérifier si l'utilisateur est un administrateur (seuls les administrateurs peuvent modifier les candidatures)
    const userRole = session.user?.role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Seuls les administrateurs peuvent modifier le statut des candidatures" }, { status: 403 });
    }
    
    // Récupérer l'ID de la candidature
    const { id: applicationId } = await params;
    
    // Récupérer les données de la requête
    const data = await request.json();
    const { status } = data;
    
    // Valider les données
    if (!status || !['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    
    // Rechercher la candidature dans les données fictives
    const applicationIndex = mockApplications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 });
    }
    
    // Dans une application réelle, vous mettriez à jour la candidature dans la base de données
    // Ici, nous simulons la mise à jour
    const updatedApplication = {
      ...mockApplications[applicationIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Mettre à jour la candidature dans le tableau (simulation)
    mockApplications[applicationIndex] = updatedApplication;
    
    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la candidature:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/applications/[id]
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
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
    const applicationIndex = mockApplications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 });
    }
    
    // Dans une application réelle, vous supprimeriez la candidature de la base de données
    // Ici, nous simulons la suppression
    mockApplications.splice(applicationIndex, 1);
    
    return NextResponse.json({ message: "Candidature supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la candidature:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}