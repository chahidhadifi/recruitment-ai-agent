import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserWithRole } from "@/types/user-roles";
import { UserStats } from "@/types/user";

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
    
    // Récupérer les utilisateurs depuis l'API backend
    const API_URL = 'http://localhost:8000';
    const response = await fetch(`http://localhost:8000/api/users/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Désactiver le cache pour toujours obtenir les données les plus récentes
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${response.status}`);
    }
    
    const users: UserWithRole[] = await response.json();
    
    // Calculer les statistiques
    const totalUsers = users.length;
    const adminCount = users.filter(user => user.role === "admin").length;
    const recruiterCount = users.filter(user => user.role === "recruteur").length;
    const candidateCount = users.filter(user => user.role === "candidat").length;
    // Ajouter les statistiques pour les utilisateurs actifs/inactifs
    const activeUsers = totalUsers; // Tous les utilisateurs sont considérés comme actifs pour l'instant
    const inactiveUsers = 0;
    
    const stats: UserStats = {
      totalUsers,
      adminCount,
      recruiterCount,
      candidateCount,
      activeUsers,
      inactiveUsers
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}