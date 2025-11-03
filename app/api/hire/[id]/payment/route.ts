import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        // First, get the current hire to access existing image arrays
        const currentHire = await prisma.hire.findUnique({
            where: { id },
            select: { imageName: true, imageData: true }
        });

        if (!currentHire) {
            return NextResponse.json(
                { success: false, message: "Hire record not found" },
                { status: 404 }
            );
        }

        const formData = await request.formData();
        const imageFile = formData.get('file') as File | null;

        // Initialize updated image arrays with existing data
        let updatedImageNames = [...currentHire.imageName];
        let updatedImageData = [...currentHire.imageData];

        // Process new image if provided
        if (imageFile && imageFile instanceof File) {
            // Add new image name to the array
            updatedImageNames.push(imageFile.name);

            // Convert file to binary data and add to array
            const buffer = await imageFile.arrayBuffer();
            updatedImageData.push(Buffer.from(buffer));
        }

        // Update the hire record with new status, payment flag, and appended image arrays
        const updatedHire = await prisma.hire.update({
            where: { id },
            data: {
                status: "confirmed",
                payment: true,
                imageName: updatedImageNames,
                imageData: updatedImageData
            }
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