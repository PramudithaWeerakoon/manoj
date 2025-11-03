import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request
): Promise<NextResponse> {
  try {
    // Extract the id from the URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Track ID is required' },
        { status: 400 }
      );
    }
    
    // Get the track
    const track = await prisma.playerTrack.findUnique({
      where: {
        id: parseInt(id as string)
      },
      select: {
        audioData: true,
        audioMimeType: true,
        id: true
      }
    });
    
    if (!track || !track.audioData) {
      return NextResponse.json(
        { message: 'Track not found or audio data missing' },
        { status: 404 }
      );
    }
    
    // Increment play count
    await prisma.playerTrack.update({
      where: {
        id: parseInt(id as string)
      },
      data: {
        playCount: {
          increment: 1
        },
        lastPlayed: new Date()
      }
    });
    
    // Create a response with the audio data
    const response = new NextResponse(track.audioData);
    response.headers.set('Content-Type', track.audioMimeType || 'audio/mpeg');
    return response;
  } catch (error) {
    console.error('Error streaming audio:', error);
    return NextResponse.json(
      { message: 'Failed to stream audio', error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
