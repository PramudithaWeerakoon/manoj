import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.album_id || !data.track_number) {
      return NextResponse.json(
        { message: "Missing required fields: title, album_id, or track_number" },
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
        // Additional fields if needed
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Track created successfully",
        track,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create track:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create track",
        error: error instanceof Error ? error.message : "Unknown error",
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

    return NextResponse.json({ tracks }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch tracks:", error);
    return NextResponse.json(
        {
            message: "Failed to fetch tracks",
            error: (error instanceof Error ? error.message : "Unknown error"),
        },
        { status: 500 }
    );
  }
}