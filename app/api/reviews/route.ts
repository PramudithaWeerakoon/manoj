import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Get reviews (public endpoint - returns only approved reviews)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const showAll = searchParams.get('showAll') === 'true';
    
    // Check if user is admin for showAll functionality
    const user = await getCurrentUser(request);
    const isAdmin = user?.role === 'admin';
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await prisma.review.count({
      where: {
        approved: isAdmin && showAll ? undefined : true
      }
    });
    
    // Get paginated reviews
    const reviews = await prisma.review.findMany({
      where: {
        // Only admins can see unapproved reviews when showAll is true
        approved: isAdmin && showAll ? undefined : true
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    return NextResponse.json({ 
      success: true, 
      reviews,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// Create a new review (requires authentication)
export async function POST(request: Request) {
  try {
    // Properly await getCurrentUser
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { title, content, rating } = await request.json();
    
    // Validate input
    if (!title || !content || !rating) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure we have a user.id before creating the review
    if (!user.id) {
      return NextResponse.json(
        { success: false, message: 'Invalid user data' },
        { status: 401 }
      );
    }
    
    // Create review with explicit userId
    const review = await prisma.review.create({
      data: {
        title,
        content,
        rating: Number(rating),
        userId: user.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully and awaiting approval',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
