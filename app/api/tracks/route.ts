import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.album_id || !data.track_number) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: title, album_id, or track_number" },
        { status: 400 }
      );
    }

    // Create the track
    const track = await prisma.track.create({
      data: {
        title: data.title,
        duration: data.duration || null,
        track_number: parseInt(data.track_number, 10),
        lyrics: data.lyrics || null,
        album_id: parseInt(data.album_id, 10),
        youtube_id: data.youtube_id || null, // Ensure YouTube ID is saved to the database
        // Additional fields if needed
      },
    });

    // If there are credits, create them
    if (data.credits && Array.isArray(data.credits) && data.credits.length > 0) {
      await Promise.all(
        data.credits.map((credit: { role: string; name: string }) => 
          prisma.trackCredit.create({
            data: {
              role: credit.role,
              name: credit.name,
              track_id: track.id
            }
          })
        )
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Track created successfully",
        track,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Failed to create track:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create track",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      include: {
        album: true, // Ensure `album` is defined in the Prisma schema
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        tracks,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Failed to fetch tracks:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tracks",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Add DELETE endpoint to handle track deletion
export async function DELETE(request: NextRequest) {
  try {
    // Get the ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Track ID is required" },
        { status: 400 }
      );
    }

    // Delete the track
    await prisma.track.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Track deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Failed to delete track:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete track",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
