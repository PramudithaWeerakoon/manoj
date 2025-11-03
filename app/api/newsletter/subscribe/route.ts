import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }
    
    // Check if already subscribed
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email }
    });
    
    if (existingSubscriber) {
      // If unsubscribed before, resubscribe them
      if (!existingSubscriber.subscribed) {
        await prisma.subscriber.update({
          where: { id: existingSubscriber.id },
          data: { subscribed: true }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been resubscribed to our newsletter.'
        });
      }
      
      // Already subscribed
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter.'
      });
    }
    
    // Create new subscriber
    await prisma.subscriber.create({
      data: {
        email,
        name: name || null
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
