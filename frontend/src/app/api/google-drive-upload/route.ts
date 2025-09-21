import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';

// POST /api/google-drive-upload - Upload a file to Google Drive
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Vous devez être connecté pour télécharger des fichiers' }, { status: 401 });
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'cv' or 'cover_letter'
    const candidateId = formData.get('candidateId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!type || (type !== 'cv' && type !== 'cover_letter')) {
      return NextResponse.json({ error: 'Type de fichier invalide. Doit être "cv" ou "cover_letter"' }, { status: 400 });
    }

    if (!candidateId) {
      return NextResponse.json({ error: 'ID du candidat requis' }, { status: 400 });
    }

    // Verify file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé. Seuls les fichiers PDF, DOC et DOCX sont acceptés.' }, { status: 400 });
    }

    // Verify file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Le fichier est trop volumineux. La taille maximale est de 5MB.' }, { status: 400 });
    }

    // Créer un nouveau FormData pour l'envoi au backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('type', type);
    backendFormData.append('candidate_id', candidateId);

    // Envoyer le fichier au backend pour téléchargement vers Google Drive
    const response = await axios.post('http://localhost:8000/api/upload-to-drive/', backendFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${session.user.token || session.user.access_token}`
      }
    });

    return NextResponse.json({
      success: true,
      url: response.data.url,
      message: response.data.message
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    const errorMessage = error.response?.data?.detail || 'Erreur lors du téléchargement du fichier';
    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}