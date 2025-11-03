import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Update a specific subscriber
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const unwrappedParams = await params;
    const id = parseInt(unwrappedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscriber ID' },
        { status: 400 }
      );
    }
    
    const { subscribed } = await request.json();
    
    if (subscribed === undefined) {
      return NextResponse.json(
        { success: false, message: 'Subscription status is required' },
        { status: 400 }
      );
    }
    
    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: { 
        subscribed,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Subscriber ${subscribed ? 'subscribed' : 'unsubscribed'} successfully`,
      subscriber
    });
  } catch (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

// Delete a specific subscriber
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const unwrappedParams = await params;
    const id = parseInt(unwrappedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscriber ID' },
        { status: 400 }
      );
    }
    
    await prisma.subscriber.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
