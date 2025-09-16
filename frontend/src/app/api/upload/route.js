import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import * as fs from 'fs/promises';
import path from 'path';
const { v4: uuidv4 } = require('uuid');

// Forcer l'exécution sur le runtime Node.js et éviter la mise en cache
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Configuration pour les types de fichiers autorisés
const allowedFileTypes = {
  'profile_image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  'cv': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'cover_letter': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Taille maximale des fichiers (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    // Ne pas bloquer l'upload si la session est absente; on autorise l'upload local

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('type');

    // Vérifier si le fichier existe
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    if (!fileType || !allowedFileTypes[fileType]) {
      return NextResponse.json({ error: 'Type de fichier non valide' }, { status: 400 });
    }

    // Vérifier le MIME type
    if (!allowedFileTypes[fileType].includes(file.type)) {
      return NextResponse.json({ error: 'Format de fichier non autorisé' }, { status: 400 });
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 });
    }

    // Créer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileType}_${uuidv4()}.${fileExtension}`;

    // Définir le chemin de sauvegarde
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Vérifier si le dossier uploads existe, sinon le créer
    try {
      await fs.access(uploadDir);
    } catch (error) {
      // Le dossier n'existe pas, le créer
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);

    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Écrire le fichier sur le disque
    await writeFile(filePath, buffer);

    // URL publique du fichier (relative et absolue)
    const relativeUrl = `/uploads/${fileName}`;
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const absoluteUrl = host ? `${proto}://${host}${relativeUrl}` : relativeUrl;

    // Mettre à jour l'image utilisateur côté backend si c'est une image de profil
    try {
      if (session && fileType === 'profile_image') {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${baseUrl}/api/users/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify({ image: absoluteUrl })
        });
      }
    } catch (e) {
      // Ne pas échouer l'upload si la mise à jour du backend échoue
      console.error('Erreur lors de la mise à jour de la photo de profil:', e);
    }

    return NextResponse.json({ success: true, fileUrl: absoluteUrl, relativeUrl });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json({ error: 'Erreur lors du traitement du fichier' }, { status: 500 });
  }
}