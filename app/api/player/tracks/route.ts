import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const tracks = await prisma.playerTrack.findMany({
      select: {
        id: true,
        title: true,
        artist: true,
        duration: true,
        orderInPlaylist: true,
        playCount: true,
        isFavorite: true,
      },
      orderBy: {
        orderInPlaylist: 'asc'
      }
    });
    
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error getting player tracks for public player:', error);
    return NextResponse.json(
      { message: 'Failed to get player tracks', error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
