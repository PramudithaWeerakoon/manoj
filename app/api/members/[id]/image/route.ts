import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Extract the "id" param (inferred correctly by Next.js)
    const { id: idParam } = await context.params;
    if (!idParam) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Fetch the member record including image data and MIME type
    const member = await prisma.member.findUnique({
      where: { id },
      select: {
        imageData: true,
        imageMimeType: true
      }
    });

    if (!member || !member.imageData) {
      // Redirect to a default image if none is found
      return NextResponse.redirect(
        new URL('/images/default-profile.jpg', request.url)
      );
    }

    // Stream the binary image data with correct headers
    return new NextResponse(member.imageData, {
      headers: {
        "Content-Type": member.imageMimeType || "image/jpeg",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error: any) {
    console.error("Error fetching member image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
