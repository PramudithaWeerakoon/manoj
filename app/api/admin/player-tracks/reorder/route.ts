import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ReorderRequestBody {
  trackId: string | number;
  direction: 'up' | 'down';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as ReorderRequestBody;
    const { trackId, direction } = body;
    
    if (!trackId || !direction) {
      return NextResponse.json(
        { message: 'Track ID and direction are required' },
        { status: 400 }
      );
    }
    
    // Get all tracks ordered by position
    const allTracks = await prisma.playerTrack.findMany({
      orderBy: {
        orderInPlaylist: 'asc'
      }
    });
    
    // Find the current track
    const currentTrackIndex = allTracks.findIndex(track => track.id === parseInt(trackId as string));
    if (currentTrackIndex === -1) {
      return NextResponse.json(
        { message: 'Track not found' },
        { status: 404 }
      );
    }
    
    const currentTrack = allTracks[currentTrackIndex];
    
    // Determine new position based on direction
    let swapIndex: number;
    if (direction === 'up') {
      // Can't move up if already at the top
      if (currentTrackIndex === 0) {
        return NextResponse.json(allTracks);
      }
      swapIndex = currentTrackIndex - 1;
    } else if (direction === 'down') {
      // Can't move down if already at the bottom
      if (currentTrackIndex === allTracks.length - 1) {
        return NextResponse.json(allTracks);
      }
      swapIndex = currentTrackIndex + 1;
    } else {
      return NextResponse.json(
        { message: 'Invalid direction. Use "up" or "down"' },
        { status: 400 }
      );
    }
    
    // Get the track to swap with
    const swapTrack = allTracks[swapIndex];
    
    // Swap the positions
    await prisma.$transaction([
      prisma.playerTrack.update({
        where: { id: currentTrack.id },
        data: { orderInPlaylist: swapTrack.orderInPlaylist }
      }),
      prisma.playerTrack.update({
        where: { id: swapTrack.id },
        data: { orderInPlaylist: currentTrack.orderInPlaylist }
      })
    ]);
    
    // Get updated tracks
    const updatedTracks = await prisma.playerTrack.findMany({
      orderBy: {
        orderInPlaylist: 'asc'
      }
    });
    
    return NextResponse.json(updatedTracks);
  } catch (error) {
    console.error('Error reordering player track:', error);
    return NextResponse.json(
      { message: 'Failed to reorder player track', error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
