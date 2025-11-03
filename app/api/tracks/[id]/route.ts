import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a track by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Extract the track ID from the URL params
    // Await params before accessing its properties
    const id = parseInt((await params).id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid track ID" },
        { status: 400 }
      );
    }

    // Fetch the track with its credits and album info
    const track = await prisma.track.findUnique({
      where: {
        id: id,
      },
      include: {
        album: {
          select: {
            title: true,
          },
        },
        credits: true,
      },
    });

    if (!track) {
      return NextResponse.json(
        { success: false, message: "Track not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      track,
    });
  } catch (error) {
    console.error("Failed to get track:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get track",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// UPDATE a track by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Extract the track ID from the URL params
    // Await params before accessing its properties
    const id = parseInt((await params).id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid track ID" },
        { status: 400 }
      );
    }

    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.album_id || !data.track_number) {
      return NextResponse.json(
        { success: false, message: "Title, album ID, and track number are required" },
        { status: 400 }
      );
    }

    // Update the track in a transaction to handle credits
    const updatedTrack = await prisma.$transaction(async (tx) => {
      // 1. Update the track basic information
      const track = await tx.track.update({
        where: { id },
        data: {
          title: data.title,
          album_id: data.album_id,
          track_number: data.track_number,
          duration: data.duration || null,
          lyrics: data.lyrics || null,
          youtube_id: data.youtube_id || null,
          artist: data.artist || null,
        },
      });

      // 2. If credits are provided, handle them
      if (data.credits && Array.isArray(data.credits)) {
        // Delete existing credits
        await tx.trackCredit.deleteMany({
          where: { track_id: id },
        });

        // Create new credits if they exist
        if (data.credits.length > 0) {
          await tx.trackCredit.createMany({
            data: data.credits.map((credit: { role: string; name: string }) => ({
              role: credit.role,
              name: credit.name,
              track_id: id,
            })),
          });
        }
      }

      // Return the updated track
      return track;
    });

    return NextResponse.json({
      success: true,
      message: "Track updated successfully",
      track: updatedTrack,
    });
  } catch (error) {
    console.error("Failed to update track:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update track",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
