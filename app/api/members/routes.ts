import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newMember = await prisma.member.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        bio: data.bio,
        joinDate: new Date(data.joinDate),
        facebook: data.socialLinks.facebook,
        twitter: data.socialLinks.twitter,
        instagram: data.socialLinks.instagram,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}