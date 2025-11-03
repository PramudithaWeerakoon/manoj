import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { eventType, venueType, preferredDate, expectedGuests, contactName, contactEmail } = body;
    const additionalRequirements = body.additionalRequirements || null;
    
    if (!eventType || !venueType || !preferredDate || !expectedGuests || !contactName || !contactEmail) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        eventType,
        venueType,
        preferredDate: new Date(preferredDate),
        expectedGuests,
        additionalRequirements,
        contactName,
        contactEmail,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Booking request submitted successfully",
      bookingId: booking.id,
    });
    
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to process booking request", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      bookings
    });
    
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch bookings", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
