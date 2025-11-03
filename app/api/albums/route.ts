import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Helper function to handle BigInt serialization
const serializeData = (data: any): any => {
  return JSON.parse(
    JSON.stringify(data, (key: string, value: any) => {
      // Convert BigInt to String to avoid serialization errors
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    })
  );
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Create the album with its tracks and credits
    const album = await prisma.album.create({
      data: {
        title: data.title,
        release_date: new Date(data.releaseDate),
        // Using the correct property names from the Prisma schema
        // Removed cover_art which doesn't exist in the schema
        description: data.description || null,
        youtube_id: data.youtubeId || null,
        // Create tracks related to this album
        tracks: {
          create: data.tracks.map((track: any, index: number) => ({
            title: track.title,
            duration: track.duration,
            track_number: index + 1
          }))
        },
        // Create credits related to this album
        album_credits: {
          create: data.credits.map((credit: any) => ({
            role: credit.role,
            name: credit.name
          }))
        }
      },
      include: {
        tracks: true,
        album_credits: true
      }
    });

    // Serialize the album data to handle BigInt
    const serializedAlbum = serializeData(album);

    return NextResponse.json({
      message: "Album created successfully",
      album: serializedAlbum
    }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create album:", error);
    return NextResponse.json({
      message: "Failed to create album",
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        tracks: true,
        album_credits: true
      },
      orderBy: {
        release_date: 'desc'
      }
    });
    
    // Serialize to handle BigInt values before formatting
    const serializedAlbums = serializeData(albums);
    
    const formattedAlbums = serializedAlbums.map((album: any) => ({
      id: album.id,
      title: album.title,
      release_date: album.release_date,
      // Replace direct cover_art reference with URL to the cover image API endpoint
      cover_art: album.coverImageData ? `/api/albums/${album.id}/cover` : '/placeholder-album.jpg',
      description: album.description || null,
      youtube_id: album.youtube_id || null,
      tracks: album.tracks,
      album_credits: album.album_credits
    }));
    
    return NextResponse.json({ 
      success: true, 
      albums: formattedAlbums 
    });
  } catch (error: any) {
    console.error('Error fetching albums:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch albums',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
