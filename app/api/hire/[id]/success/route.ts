import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define the context type that matches Next.js's expectations
type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  _: Request,
  context: RouteContext
) {
  try {
    // Next infers context.params.id as string
    const params = await context.params;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    // If you ever need data from the client side, parse the body
    // const body = await request.json();

    const updatedHire = await prisma.hire.update({
      where: { id },
      data: { status: "confirmed", payment: true }
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
