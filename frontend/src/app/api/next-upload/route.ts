import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import * as fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowedFileTypes: Record<string, string[]> = {
  profile_image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  cover_letter: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    const formData = await (request as any).formData();
    const file = formData.get('file') as File | null;
    const fileType = String(formData.get('type') || '');

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!fileType || !allowedFileTypes[fileType]) {
      return NextResponse.json({ error: 'Type de fichier non valide' }, { status: 400 });
    }

    if (!allowedFileTypes[fileType].includes((file as any).type)) {
      return NextResponse.json({ error: 'Format de fichier non autorisé' }, { status: 400 });
    }

    if ((file as any).size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 });
    }

    const fileExtension = (file as any).name?.split('.').pop() || 'bin';
    const fileName = `${fileType}_${uuidv4()}.${fileExtension}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await (file as any).arrayBuffer());
    await writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${fileName}`;
    const proto = (request.headers as any).get('x-forwarded-proto') || 'http';
    const host = (request.headers as any).get('host');
    const absoluteUrl = host ? `${proto}://${host}${relativeUrl}` : relativeUrl;

    // Try to persist image on backend if available
    if (session && fileType === 'profile_image') {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${baseUrl}/api/users/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify({ image: absoluteUrl }),
        });
      } catch (e) {
        console.error('Erreur lors de la mise à jour du backend:', e);
      }
    }

    return NextResponse.json({ success: true, fileUrl: absoluteUrl, relativeUrl });
  } catch (error) {
    console.error('Erreur upload next-upload:', error);
    return NextResponse.json({ error: 'Erreur lors du traitement du fichier' }, { status: 500 });
  }
}


