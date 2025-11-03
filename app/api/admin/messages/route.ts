import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all contact messages sorted by most recent first
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      messages 
    });
    
  } catch (error: any) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch messages", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
