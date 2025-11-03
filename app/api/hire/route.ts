import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hires = await prisma.hire.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true // Include the related user information
      }
    });
    
    return NextResponse.json({
      success: true,
      hires
    });
    
  } catch (error: any) {
    console.error("Error fetching hires:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch hire requests",
        error: error.message
      },
      { status: 500 }
    );
  }
}