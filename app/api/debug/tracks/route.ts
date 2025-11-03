import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get the albumId from query params
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("albumId");
    
    let query = {};
    
    if (albumId && !isNaN(parseInt(albumId))) {
      query = {
        where: {
          album_id: parseInt(albumId)
        }
      };
    }
    
    // Fetch all tracks with full details
    const tracks = await prisma.track.findMany({
      ...query,
      select: {
        id: true,
        title: true,
        track_number: true,
        duration: true,
        lyrics: true,
        youtube_id: true,
        artist: true,
        album_id: true,
        album: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        album_id: 'asc',
        track_number: 'asc'
      }
    });
    
    // Log detailed info about each track
    console.log(`Found ${tracks.length} tracks total`);
    tracks.forEach(track => {
      console.log(`- Track ID: ${track.id}, Number: ${track.track_number}, Title: "${track.title}", Album: ${track.album_id} (${track.album?.title}), YouTube: ${track.youtube_id || "none"}`);
    });
    
    return NextResponse.json({
      success: true,
      tracks: tracks,
      count: tracks.length
    });
  } catch (error: any) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch debug track data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
