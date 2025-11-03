import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { getCurrentUser } from '@/lib/auth';

type HireRequest = {
  userId: string;
  contactName: string;
  contactEmail: string;
  contactMobile: string;
  lineup: string;
  musicalOffering: string;
  preferredDate: string;
  description: string;
  paymentMethod: string;
};

export async function POST(request: Request) {
  try {
    const user_document = await getCurrentUser();

    const body: HireRequest = await request.json();
    // Validate required fields
    const {contactName, contactEmail, contactMobile, lineup, musicalOffering, preferredDate, description } = body;
    
    if (!contactName || !contactEmail || !contactMobile || !preferredDate || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!user_document?.id) {
      return NextResponse.json(
          { success: false, message: 'Invalid user data' },
          { status: 401 }
      );
    }
    
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the user and check if it exists
      const user = await tx.user.findUnique({
        where: { id: user_document?.id },
      });
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // In a real application, we would process payment here
      // For this example, we'll simulate successful payment
      
      // Generate a hire reference
      const hireReference = `HR-${randomUUID().substring(0, 8).toUpperCase()}`;
      
      // Create hire in database
      const hire = await tx.hire.create({
        data: {
          userId: user_document?.id,
          contactName,
          contactEmail,
          contactMobile,
          lineup,
          musicalOffering,
          preferredDate: new Date(preferredDate),
          description,
          payment: false,
          status: "pending"
        }
      });
      
      return {
        hire,
        user,
        hireReference
      };
    });
    
    // Send email confirmation in a real app
    // For demo, we'll just log it
    console.log(`Hire confirmation email sent to: ${contactEmail}`);
    
    return NextResponse.json({
      success: true,
      message: "Hire confirmed successfully",
      hireReference: result.hireReference,
      hireId: result.hire.id,
      hireDetails: {
        user: result.user.name || result.user.email,
        contactName: result.hire.contactName,
        contactEmail: result.hire.contactEmail,
        preferredDate: result.hire.preferredDate,
        status: result.hire.status
      }
    });
    
  } catch (error: any) {
    console.error("Error processing hire:", error);
    
    // Check if it's a known error we threw
    if (error.message.includes("User not found")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process hire request",
        error: error.message
      },
      { status: 500 }
    );
  }
}