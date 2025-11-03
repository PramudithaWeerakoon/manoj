import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Get a specific review
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }
    
    // If review is not approved, only the author and admins can see it
    const currentUser = await getCurrentUser(request);
    if (!review.approved && (!currentUser || (currentUser.id !== review.userId && currentUser.role !== 'admin'))) {
      return NextResponse.json(
        { success: false, message: 'Review not available' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// Update a review
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    // Find the review
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });
    
    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user is author or admin
    if (existingReview.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this review' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    const updateData: any = {};
    
    // Users can only update content and rating
    if (user.role !== 'admin') {
      if (data.title) updateData.title = data.title;
      if (data.content) updateData.content = data.content;
      if (data.rating) updateData.rating = Number(data.rating);
      // Reset to pending approval if user updates their review
      updateData.approved = false;
    } else {
      // Admins can update any field
      if (data.title) updateData.title = data.title;
      if (data.content) updateData.content = data.content;
      if (data.rating) updateData.rating = Number(data.rating);
      if (data.approved !== undefined) updateData.approved = data.approved;
    }
    
    const review = await prisma.review.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({
      success: true,
      message: user?.role === 'admin' ? 'Review updated' : 'Review updated and awaiting approval',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// Delete a review
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    // Find the review
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });
    
    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user is author or admin
    if (existingReview.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this review' },
        { status: 403 }
      );
    }
    
    await prisma.review.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
