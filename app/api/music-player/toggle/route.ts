import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackId, isInPlayer } = body;
    
    if (!trackId) {
      return NextResponse.json(
        { success: false, error: 'Track ID is required' }, 
        { status: 400 }
      );
    }
    
    const track = await prisma.track.update({
      where: { id: parseInt(trackId.toString()) },
      data: { 
        isInPlayer: isInPlayer,
        addedToPlayer: isInPlayer ? new Date() : null
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      isInPlayer: track.isInPlayer 
    });
  } catch (error) {
    console.error('Error updating track:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update track status',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
