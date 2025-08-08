import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JobApplication } from "@/types/job";

// Données fictives pour les candidatures
const mockApplications: JobApplication[] = [
  {
    id: "app1",
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
    id: "app2",
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
    id: "app3",
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
    id: "app4",
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
    id: "app5",
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

// GET - Récupérer toutes les candidatures (pour les recruteurs et administrateurs)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à cette ressource" },
        { status: 401 }
      );
    }
    
    // Vérifier les autorisations (seuls les administrateurs peuvent gérer les candidatures)
    // Les recruteurs peuvent uniquement voir les candidatures liées à leurs offres
    if (session.user.role !== "admin" && session.user.role !== "recruteur") {
      return NextResponse.json(
        { error: "Vous n'avez pas les autorisations nécessaires pour accéder à cette ressource" },
        { status: 403 }
      );
    }
    
    // Récupérer les paramètres de requête
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    const status = url.searchParams.get("status");
    
    // Filtrer les candidatures en fonction des paramètres
    let applications = [...mockApplications];
    
    if (jobId) {
      applications = applications.filter(app => app.jobId === jobId);
    }
    
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    
    // Si l'utilisateur est un recruteur (non admin), filtrer pour ne montrer que ses offres
    // Dans une application réelle, vous utiliseriez une relation entre les offres et les recruteurs
    if (session.user.role === "recruteur") {
      // Simuler le filtrage par recruteur (dans une application réelle, vous utiliseriez une requête à la base de données)
      // Pour cette démonstration, nous supposons que le recruteur ne peut voir que les candidatures pour les offres 1 et 2
      applications = applications.filter(app => ["1", "2"].includes(app.jobId));
    }
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH - Mettre à jour le statut d'une candidature
export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à cette ressource" },
        { status: 401 }
      );
    }
    
    // Vérifier les autorisations (seuls les administrateurs peuvent mettre à jour les candidatures)
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier le statut des candidatures" },
        { status: 403 }
      );
    }
    
    // Récupérer les données de la requête
    const data = await request.json();
    const { applicationId, status } = data;
    
    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "L'identifiant de la candidature et le statut sont requis" },
        { status: 400 }
      );
    }
    
    // Vérifier que le statut est valide
    const validStatuses = ["pending", "reviewing", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Le statut fourni n'est pas valide" },
        { status: 400 }
      );
    }
    
    // Simuler la mise à jour du statut
    // Dans une application réelle, vous mettriez à jour la base de données
    const applicationIndex = mockApplications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: "Candidature non trouvée" },
        { status: 404 }
      );
    }
    
    // Mettre à jour le statut
    mockApplications[applicationIndex].status = status;
    mockApplications[applicationIndex].updatedAt = new Date().toISOString();
    
    return NextResponse.json(mockApplications[applicationIndex]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la candidature:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}