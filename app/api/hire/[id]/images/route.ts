// File: app/api/members/[id]/image/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Make sure the params type matches Next.js 13+ App Router conventions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params value before using it
    const id = parseInt((await params).id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Fetch the hire (or member) record with its images
    const hire = await prisma.hire.findUnique({
      where: { id },
      select: {
        imageName: true,
        imageData: true
      }
    });

    if (!hire) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    // Convert binary data to Base64 strings for the client
    const images = hire.imageData.map((data) => {
      if (!data) return "";
      const base64 = Buffer.from(data).toString("base64");
      // You should store the actual MIME type per image in a real app
      return `data:image/jpeg;base64,${base64}`;
    });

    return NextResponse.json({
      success: true,
      imageNames: hire.imageName,
      images
    });
  } catch (error: any) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch images",
        error: error.message
      },
      { status: 500 }
    );
  }
}

// Ensure other methods also use the correct params type
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ...existing code...
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ...existing code...
}
