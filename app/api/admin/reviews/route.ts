import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// Get all reviews for admin (includes unapproved)
export async function GET(request: Request) {
  return requireAdmin(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const approvedStatus = searchParams.get('approved');
      
      const reviews = await prisma.review.findMany({
        where: {
          approved: approvedStatus === 'true' ? true : 
                   approvedStatus === 'false' ? false : 
                   undefined
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json({ success: true, reviews });
    } catch (error) {
      console.error('Error fetching reviews for admin:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }
  })(request);
}

// Bulk approve/reject reviews
export async function PUT(request: Request) {
  return requireAdmin(async () => {
    try {
      const { ids, approved } = await request.json();
      
      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json(
          { success: false, message: 'Invalid request format' },
          { status: 400 }
        );
      }
      
      await prisma.$transaction(
        ids.map((id: number) => 
          prisma.review.update({
            where: { id },
            data: { approved }
          })
        )
      );
      
      return NextResponse.json({
        success: true,
        message: `Reviews ${approved ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      console.error('Error updating reviews:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update reviews' },
        { status: 500 }
      );
    }
  })(request);
}
