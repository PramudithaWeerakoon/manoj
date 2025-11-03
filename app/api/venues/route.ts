import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';  // Using the correct import path for your project

export async function GET() {
  try {
    // Find all unique venues from events table
    const uniqueVenues = await prisma.event.findMany({
      select: {
        venue: true,
      },
      distinct: ['venue'],
      orderBy: {
        venue: 'asc',
      },
    });
    
    // Format the response to just include venue names
    const venues = uniqueVenues.map(item => ({
      name: item.venue
    }));
    
    return NextResponse.json({ venues });
  } catch (error) {
    console.error('Failed to fetch venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  } finally {
    // Properly disconnect from Prisma client if needed
    await prisma.$disconnect();
  }
}
