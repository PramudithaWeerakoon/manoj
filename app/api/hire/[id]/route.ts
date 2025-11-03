import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handle updating a specific hire by ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeParams = await params;
    const id = parseInt(routeParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { contactName, contactEmail, preferredDate, description, status, payment } = body;

    if (!contactName || !contactEmail || !preferredDate || !description) {
      return NextResponse.json(
          { success: false, message: "Missing required fields" },
          { status: 400 }
      );
    }

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedHire = await prisma.hire.update({
      where: { id },
      data: { status, contactName, contactEmail, preferredDate, description, payment }
    });
    
    return NextResponse.json({
      success: true,
      hire: updatedHire
    });
    
  } catch (error: any) {
    console.error("Error updating hire:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update hire",
        error: error.message
      },
      { status: 500 }
    );
  }
}

// Handle fetching a specific hire by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params object before accessing its properties
    const routeParams = await params;
    const id = parseInt(routeParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
          { success: false, message: "Invalid ID" },
          { status: 400 }
      );
    }

    const hire = await prisma.hire.findUnique({
      where: { id },
      include: {
        user: true // Include user details
      }
    });
    if (!hire) {
      return NextResponse.json(
          { success: false, message: "Hire not found" },
          { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hire
    });

  } catch (error: any) {
    console.error("Error fetching hire:", error);
    return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch hire",
          error: error.message
        },
        { status: 500 }
    );
  }
}

// Handle deleting a specific hire by ID (or marking as cancelled)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }
    
    // Option 1: Hard delete
    // const deletedHire = await prisma.hire.delete({
    //   where: { id }
    // });
    
    // Option 2: Soft delete (update status to cancelled)
    const cancelledHire = await prisma.hire.update({
      where: { id },
      data: { status: "cancelled" }
    });
    
    return NextResponse.json({
      success: true,
      message: "Hire cancelled successfully"
    });
    
  } catch (error: any) {
    console.error("Error cancelling hire:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel hire",
        error: error.message
      },
      { status: 500 }
    );
  }
}