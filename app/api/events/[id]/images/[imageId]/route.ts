import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string, imageId: string }> }
) {
  try {
    // Await context.params before accessing the properties
    const { id, imageId } = await context.params;
    const eventId = parseInt(id);
    const imageId2 = parseInt(imageId);
    
    if (isNaN(eventId) || isNaN(imageId2)) {
      return new NextResponse('Invalid event or image ID', { status: 400 });
    }

    const eventImage = await prisma.eventImage.findFirst({
      where: { 
        id: imageId2,
        eventId: eventId 
      },
      select: {
        imageData: true,
        imageMimeType: true,
        imageName: true
      }
    });

    if (!eventImage || !eventImage.imageData) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Get query params to check for cache busting
    const url = new URL(request.url);
    const timestamp = url.searchParams.get('t');

    // Return the image with the appropriate content type
    const response = new NextResponse(eventImage.imageData);
    response.headers.set('Content-Type', eventImage.imageMimeType || 'image/jpeg');
    response.headers.set('Content-Disposition', `inline; filename="${eventImage.imageName || 'event-image'}"`);
    
    // Set no-cache headers to prevent browsers from caching images
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching event image:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
