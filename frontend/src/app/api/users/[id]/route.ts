import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserWithRole } from "@/types/user-roles";

// Référence aux données mockées dans la route principale
// Dans une application réelle, cela serait remplacé par une base de données
let mockUsers: UserWithRole[] = [
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

// GET /api/users/[id] - Récupérer un utilisateur spécifique
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    
    // Récupérer l'utilisateur par ID
    const { id } = await params;
    const user = mockUsers.find(user => user.id === id);
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT /api/users/[id] - Mettre à jour un utilisateur
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (!data.name || !data.email || !data.role) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    
    // Récupérer l'ID de l'utilisateur
    const { id } = await params;
    
    // Trouver l'utilisateur à mettre à jour
    const userIndex = mockUsers.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }
    
    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    const existingUser = mockUsers.find(user => user.email === data.email && user.id !== id);
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = {
      ...mockUsers[userIndex],
      name: data.name,
      email: data.email,
      role: data.role,
      // Mettre à jour l'image si le nom a changé
      image: mockUsers[userIndex].name !== data.name
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0D8ABC&color=fff`
        : mockUsers[userIndex].image
    };
    
    // Remplacer l'utilisateur dans la liste
    mockUsers[userIndex] = updatedUser;
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Supprimer un utilisateur
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    
    // Récupérer l'ID de l'utilisateur
    const { id } = await params;
    
    // Vérifier si l'utilisateur existe
    const userIndex = mockUsers.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }
    
    // Empêcher la suppression du dernier administrateur
    if (mockUsers[userIndex].role === "admin") {
      const adminCount = mockUsers.filter(user => user.role === "admin").length;
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Impossible de supprimer le dernier administrateur" },
          { status: 400 }
        );
      }
    }
    
    // Supprimer l'utilisateur
    mockUsers = mockUsers.filter(user => user.id !== id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}