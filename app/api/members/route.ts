import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  try {
    const members = await prisma.member.findMany();
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const role = formData.get("role") as string;
    const bio = formData.get("bio") as string || undefined;
    const joinDate = formData.get("joinDate") as string;
    const socialLinksJson = formData.get("socialLinks") as string;
    const socialLinks = JSON.parse(socialLinksJson);
    const profileImage = formData.get("profileImage") as File | null;
    
    let imageName = null;
    let imageData = null;
    let imageMimeType = null;
    
    if (profileImage) {
      // Store image information
      imageName = profileImage.name;
      imageMimeType = profileImage.type;
      
      // Read file as ArrayBuffer and convert to Buffer for storage
      const imageArrayBuffer = await profileImage.arrayBuffer();
      imageData = new Uint8Array(imageArrayBuffer);
    }
    
    const newMember = await prisma.member.create({
      data: {
        firstName,
        lastName,
        role,
        bio,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        imageName,
        imageData,
        imageMimeType,
        facebook: socialLinks.facebook,
        twitter: socialLinks.twitter,
        instagram: socialLinks.instagram,
      }
    });
    
    // Don't include binary data in response
    const memberResponse = {
      ...newMember,
      imageData: newMember.imageData ? "Binary data not included in response" : null
    };
    
    return NextResponse.json({ 
      success: true, 
      message: "Member created successfully", 
      member: memberResponse 
    }, { status: 201 });
    
  } catch (error: unknown) {
    console.error("Error deleting member:", error);
  
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
  
    return NextResponse.json({ 
      error: "Failed to delete member", 
      detail: errorMessage 
    }, { status: 500 });
  }
  
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    await prisma.member.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
