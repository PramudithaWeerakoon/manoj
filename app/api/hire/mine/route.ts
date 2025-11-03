import {NextResponse} from "next/server";
import { getCurrentUser } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const user_document = await getCurrentUser();
        if (!user_document?.id) {
            return NextResponse.json(
                { success: false, message: 'Invalid user data' },
                { status: 401 }
            );
        }
        const hire = await prisma.hire.findMany({
            where: { userId: user_document?.id },
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