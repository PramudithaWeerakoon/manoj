import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  if (!id) {
    return NextResponse.json({ message: 'Track ID is required' }, { status: 400 });
  }

  try {
    await prisma.playerTrack.delete({
      where: {
        id: parseInt(id)
      }
    });

    return NextResponse.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Failed to delete track:', error);
    return NextResponse.json(
      { message: 'Failed to delete player track', error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
