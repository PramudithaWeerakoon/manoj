import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get all images for an event
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Get the params directly since Next.js App Router already awaits them
    const { id } = context.params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID" },
        { status: 400 }
      );
    }

    const eventImages = await prisma.eventImage.findMany({
      where: { 
        eventId: eventId 
      },
      select: {
        id: true,
        imageName: true,
        imageMimeType: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!eventImages || eventImages.length === 0) {
      return NextResponse.json(
        { success: false, message: "No images found for this event" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      images: eventImages
    });
    
  } catch (error) {
    console.error('Error fetching event images:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event images" },
      { status: 500 }
    );
  }
}
