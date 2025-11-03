import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing the id property
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return new Response('Invalid album ID', { status: 400 });
    }
    
    const album = await prisma.album.findUnique({
      where: { id },
      select: {
        coverImageData: true,
        coverImageMimeType: true
      }
    });
    
    if (!album || !album.coverImageData) {
      return new Response('Image not found', { status: 404 });
    }
    
    // Create a response with the binary image data and correct content type
    return new Response(album.coverImageData, {
      headers: {
        'Content-Type': album.coverImageMimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    });
  } catch (error) {
    console.error('Error fetching album cover image:', error);
    return new Response('Error fetching image', { status: 500 });
  }
}
