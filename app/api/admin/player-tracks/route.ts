import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FormDataFile {
  arrayBuffer(): Promise<ArrayBuffer>;
  name: string;
  type: string;
  size: number;
}

// Get all player tracks
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const playerTracks = await prisma.playerTrack.findMany({
      orderBy: {
        orderInPlaylist: 'asc'
      }
    });
    
    return NextResponse.json(playerTracks);
  } catch (error) {
    console.error('Error getting player tracks:', error);
    return NextResponse.json(
      { message: 'Failed to get player tracks', error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Add a new track to the player
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const duration = formData.get('duration') as string;
    const audioFile = formData.get('audioFile') as unknown as FormDataFile;
    
    if (!title || !artist || !audioFile) {
      return NextResponse.json(
        { message: 'Title, artist and audio file are required' },
        { status: 400 }
      );
    }
    
    // Get the highest current order value
    const highestOrder = await prisma.playerTrack.findFirst({
      orderBy: {
        orderInPlaylist: 'desc'
      },
      select: {
        orderInPlaylist: true
      }
    });
    
    const nextOrder = highestOrder ? highestOrder.orderInPlaylist + 1 : 1;
    
    // Process audio file
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Create new player track
    const newTrack = await prisma.playerTrack.create({
      data: {
        title,
        artist,
        duration,
        audioData: buffer,
        audioFileName: audioFile.name,
        audioMimeType: audioFile.type,
        orderInPlaylist: nextOrder
      }
    });
    
    return NextResponse.json(newTrack, { status: 201 });
  } catch (error) {
    console.error('Error adding player track:', error);
    return NextResponse.json(
      { message: 'Failed to add player track', error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
