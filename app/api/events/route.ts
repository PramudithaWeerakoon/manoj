import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get all events
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      ...(limit ? { take: limit } : {}),
      include: {
        images: {
          select: {
            id: true,
            imageName: true,
          }
        }
      }
    });
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse the form data instead of JSON
    const formData = await request.formData();
    // Extract basic event info from form data
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const venue = formData.get('venue') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string || 'others';
    const youtubeId = formData.get('youtubeId') as string | undefined;
    // Extract all image files
    const images: File[] = [];
    formData.forEach((value, key) => {
      if (key === 'images' && value instanceof File) {
        images.push(value);
      }
    });
    // Set date as a DateTime object
    const eventDateTime = new Date(date);
    // Prepare the event data for database
    const eventData: any = {
      title,
      date: eventDateTime,
      venue,
      description,
      category,
      youtubeId,
      price: 0,
      availableSeats: 0,
    };
    // Create the event first (without images)
    const event = await prisma.event.create({
      data: eventData,
    });
    // If images were uploaded, create EventImage records
    if (images.length > 0) {
      for (const file of images) {
        const arrayBuffer = await file.arrayBuffer();
        const imageBuffer = new Uint8Array(arrayBuffer);
        await prisma.eventImage.create({
          data: {
            eventId: event.id,
            imageName: file.name,
            imageData: imageBuffer,
            imageMimeType: file.type,
          },
        });
      }
    }
    // Return the created event (with images if needed)
    return NextResponse.json({ success: true, eventId: event.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
