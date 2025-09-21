import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserWithRole } from "@/types/user-roles";

// Données fictives pour la démonstration
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
    // Récupérer les données de la requête
    const data = await req.json();
    
    // Valider les données
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    
    // Définir l'URL de l'API backend
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Transférer la requête au backend
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    // Récupérer la réponse du backend
    const responseData = await response.json();
    
    // Retourner la réponse avec le même statut
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}