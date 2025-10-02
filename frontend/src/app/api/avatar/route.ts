import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'avatar.glb');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      console.error('Avatar file not found at:', filePath);
      return NextResponse.json({ error: 'Avatar file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error loading avatar.glb:', error);
    return NextResponse.json({ 
      error: 'Error loading avatar', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export const dynamic = 'force-static';