import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserWithRole } from "@/types/user-roles";

// Configuration de l'API backend
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Fonction pour récupérer les utilisateurs depuis le backend
async function fetchUsersFromBackend(token: string): Promise<UserWithRole[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur backend: ${response.status}`);
    }

    const users = await response.json();
    return users.map((user: any) => ({
      id: user.id.toString(),
      name: user.name || user.email,
      email: user.email,
      image: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=0D8ABC&color=fff`,
      role: user.role
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis le backend:", error);
    throw new Error("Impossible de récupérer les utilisateurs depuis le backend");
  }
}

// GET /api/users - Récupérer tous les utilisateurs
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    
    // Récupérer les paramètres de requête
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get("searchTerm");
    const role = url.searchParams.get("role");
    const sortBy = url.searchParams.get("sortBy");
    const sortOrder = url.searchParams.get("sortOrder");
    
    // Filtrer les utilisateurs
    let filteredUsers = [...mockUsers];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(
        user => 
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }
    
    if (role && role !== "all") {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Trier les résultats
    if (sortBy) {
      filteredUsers.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
          case "name":
            valueA = a.name;
            valueB = b.name;
            break;
          case "email":
            valueA = a.email;
            valueB = b.email;
            break;
          case "role":
            valueA = a.role;
            valueB = b.role;
            break;
          default:
            valueA = a.name;
            valueB = b.name;
        }
        
        if (sortOrder === "desc") {
          return valueB.localeCompare(valueA);
        }
        return valueA.localeCompare(valueB);
      });
    }
    
    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    
    // Récupérer les données de la requête
    const data = await req.json();
    
    // Valider les données
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = mockUsers.find(user => user.email === data.email);
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }
    
    // Créer un nouvel utilisateur
    const newUser: UserWithRole = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0D8ABC&color=fff`,
      role: data.role
    };
    
    // Ajouter l'utilisateur à la liste
    mockUsers.push(newUser);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l&apos;utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}