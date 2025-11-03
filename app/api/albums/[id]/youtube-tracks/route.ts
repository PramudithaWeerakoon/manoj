import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const albumId = parseInt((await params).id);

    if (isNaN(albumId)) {
      return NextResponse.json(
        { success: false, message: "Invalid album ID" },
        { status: 400 }
      );
    }

    // Fetch tracks with their YouTube IDs, lyrics, and credits
    const tracks = await prisma.track.findMany({
      where: {
        album_id: albumId,
      },
      select: {
        id: true,
        title: true,
        track_number: true,
        youtube_id: true,
        lyrics: true,
        credits: {
          select: {
            id: true,
            role: true,
            name: true,
          }
        },
      },
      orderBy: {
        track_number: 'asc',
      },
    });

    // Log detailed information for each track to help with debugging
    //console.log(`[YouTube Tracks API] Album ${albumId}: Found ${tracks.length} tracks`);
    tracks.forEach(track => {
      //console.log(`[YouTube Tracks API] Track #${track.track_number} (ID:${track.id}) "${track.title}": YouTube ID = ${track.youtube_id || 'none'}`);
      //console.log(`[YouTube Tracks API] Track has lyrics: ${track.lyrics ? 'Yes' : 'No'}, Credits: ${track.credits.length}`);
      
      // Print full lyrics for debugging
      //console.log(`[YouTube Tracks API] FULL LYRICS for track ${track.id}:`);
      //console.log(track.lyrics);
      
      // Print full credits for debugging
      //console.log(`[YouTube Tracks API] FULL CREDITS for track ${track.id}:`);
      track.credits.forEach(credit => {
        //console.log(`- ${credit.role}: ${credit.name} (ID: ${credit.id})`);
      });
    });
    
    return NextResponse.json({
      success: true,
      tracks: tracks,
    });
  } catch (error: any) {
    //console.error("[YouTube Tracks API] Failed to fetch track YouTube IDs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch track YouTube IDs",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
