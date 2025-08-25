import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserWithRole } from "@/types/user-roles";
import { UserStats } from "@/types/user";

// Référence aux données mockées dans la route principale
// Dans une application réelle, cela serait remplacé par une base de données
const mockUsers: UserWithRole[] = [
  {
    id: "admin-1",
    name: "Administrateur Principal",
    email: "admin@example.com",
    image: "https://ui-avatars.com/api/?name=Administrateur&background=0D8ABC&color=fff",
    role: "admin"
  },
  {
    id: "recruteur-1",
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    image: "https://ui-avatars.com/api/?name=Sophie+Martin&background=2E8B57&color=fff",
    role: "recruteur"
  },
  {
    id: "recruteur-2",
    name: "Thomas Dubois",
    email: "thomas.dubois@example.com",
    image: "https://ui-avatars.com/api/?name=Thomas+Dubois&background=2E8B57&color=fff",
    role: "recruteur"
  },
  {
    id: "candidat-1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    image: "https://ui-avatars.com/api/?name=Jean+Dupont&background=CD7F32&color=fff",
    role: "candidat"
  },
  {
    id: "candidat-2",
    name: "Marie Lefebvre",
    email: "marie.lefebvre@example.com",
    image: "https://ui-avatars.com/api/?name=Marie+Lefebvre&background=CD7F32&color=fff",
    role: "candidat"
  },
  {
    id: "candidat-3",
    name: "Pierre Bernard",
    email: "pierre.bernard@example.com",
    image: "https://ui-avatars.com/api/?name=Pierre+Bernard&background=CD7F32&color=fff",
    role: "candidat"
  },
];

// GET /api/users/stats - Récupérer les statistiques des utilisateurs
export async function GET(_req: NextRequest) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    
    // Calculer les statistiques
    const totalUsers = mockUsers.length;
    const adminCount = mockUsers.filter(user => user.role === "admin").length;
    const recruiterCount = mockUsers.filter(user => user.role === "recruteur").length;
    const candidateCount = mockUsers.filter(user => user.role === "candidat").length;
    
    const stats: UserStats = {
      totalUsers,
      adminCount,
      recruiterCount,
      candidateCount
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}