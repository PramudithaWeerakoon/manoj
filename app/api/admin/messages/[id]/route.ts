import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unwrappedParams = await params;
    const id = parseInt(unwrappedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }
    
    const message = await prisma.contactMessage.findUnique({
      where: { id }
    });
    
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message 
    });
    
  } catch (error: any) {
    console.error("Error fetching contact message:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch message", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unwrappedParams = await params;
    const id = parseInt(unwrappedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { isRead } = body;
    
    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { isRead }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: updatedMessage 
    });
    
  } catch (error: any) {
    console.error("Error updating contact message:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update message", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
