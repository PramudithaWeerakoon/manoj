import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { status } = body;
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }
    
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status }
    });
    
    return NextResponse.json({
      success: true,
      booking: updatedBooking
    });
    
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update booking", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
