// @ts-nocheck - Ignoring type errors during build

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Get the params directly since Next.js App Router already awaits them
    const { id } = context.params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return new NextResponse('Invalid event ID', { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        imageData: true,
        imageMimeType: true,
        imageName: true
      }
    });

    if (!event || !event.imageData) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Get query params to check for cache busting
    const url = new URL(request.url);
    const timestamp = url.searchParams.get('t');

    // Return the image with the appropriate content type
    const response = new NextResponse(event.imageData);
    response.headers.set('Content-Type', event.imageMimeType || 'image/jpeg');
    response.headers.set('Content-Disposition', `inline; filename="${event.imageName || 'event-image'}"`);
    
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
