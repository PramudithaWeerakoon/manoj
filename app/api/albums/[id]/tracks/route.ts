import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unwrappedParams = await params;
    const id = parseInt(unwrappedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid album ID'
      }, { status: 400 });
    }
    
    // Fetch the album with all tracks and details
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        tracks: {
          orderBy: { track_number: 'asc' },
          include: {
            credits: true // Include track credits
          }
        },
        album_credits: true
      }
    });
    
    if (!album) {
      return NextResponse.json({
        success: false,
        error: 'Album not found'
      }, { status: 404 });
    }

    // Format the response data
    const formattedAlbum = {
      id: album.id,
      title: album.title,
      release_date: album.release_date,
      description: album.description,
      youtube_id: album.youtube_id,
      cover_image_url: album.coverImageData ? `/api/albums/${id}/cover` : null,
      tracks: album.tracks.map(track => ({
        id: track.id,
        title: track.title,
        track_number: track.track_number,
        duration: track.duration,
        lyrics: track.lyrics,
        youtube_id: track.youtube_id,
        has_audio: !!track.audioData,
        audio_url: track.audioData ? `/api/tracks/${track.id}/audio` : null,
        artist: track.artist,
        credits: track.credits.map(credit => ({
          role: credit.role,
          name: credit.name
        }))
      })),
      credits: album.album_credits.map(credit => ({
        role: credit.role,
        name: credit.name
      }))
    };
    
    return NextResponse.json({
      success: true,
      album: formattedAlbum
    });
  } catch (error) {
    console.error('Error fetching album tracks:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch album tracks',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
