import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Fetching tracks from database...');
    
    const tracks = await prisma.track.findMany({
      select: {
        id: true,
        title: true,
        duration: true,
        artist: true,
        audioFileName: true,
        isInPlayer: true,
        album_id: true,
        album: {
          select: {
            title: true
          }
        }
      }
    });
    
    console.log(`Found ${tracks.length} tracks`);
    
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist || null,
      duration: track.duration || '0:00',
      album_id: track.album_id,
      album: track.album?.title || 'Unknown Album',
      audioFileName: track.audioFileName,
      isInPlayer: track.isInPlayer || false
    }));
    
    return NextResponse.json({ 
      success: true, 
      tracks: formattedTracks 
    });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch tracks',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
