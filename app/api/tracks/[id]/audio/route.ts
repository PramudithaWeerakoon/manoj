import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return new Response('Invalid track ID', { status: 400 });
    }
    
    const track = await prisma.track.findUnique({
      where: { id },
      select: {
        audioData: true,
        audioMimeType: true,
        title: true
      }
    });
    
    if (!track || !track.audioData) {
      return new Response('Audio not found', { status: 404 });
    }
    
    // Create a response with the binary audio data and correct content type
    return new Response(track.audioData, {
      headers: {
        'Content-Type': track.audioMimeType || 'audio/mpeg',
        'Content-Disposition': `inline; filename="${track.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3"`,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    });
  } catch (error) {
    console.error('Error fetching track audio:', error);
    return new Response('Error fetching audio', { status: 500 });
  }
}
