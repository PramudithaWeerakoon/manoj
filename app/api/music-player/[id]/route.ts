import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const idParam = request.nextUrl.pathname.split('/').pop();
    const id = parseInt(idParam ?? '', 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid track ID' },
        { status: 400 }
      );
    }

    const track = await prisma.track.findUnique({
      where: { id },
      select: {
        audioData: true,
        audioMimeType: true,
        audioFileName: true,
      },
    });

    if (!track || !track.audioData) {
      return NextResponse.json(
        { success: false, error: 'Track not found or has no audio data' },
        { status: 404 }
      );
    }

    // Stream the binary audio data with headers
    const response = new NextResponse(track.audioData);
    response.headers.set('Content-Type', track.audioMimeType || 'audio/mpeg');
    response.headers.set(
      'Content-Disposition',
      `inline; filename="${track.audioFileName}"`
    );

    return response;
  } catch (error: any) {
    console.error('Error fetching track audio:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch track audio',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
