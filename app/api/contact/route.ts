import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate form data
    const { firstName, lastName, email, subject, message } = body;
    
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }
    
    // Create a new contact message
    const newMessage = await prisma.contactMessage.create({
      data: {
        firstName,
        lastName,
        email,
        subject,
        message,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      id: newMessage.id,
    });
    
  } catch (error: any) {
    console.error("Error saving contact message:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to send message", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
