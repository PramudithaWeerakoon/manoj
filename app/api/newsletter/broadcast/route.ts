import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// In a real app, you would implement actual email sending here
const sendEmails = async (emails: string[], subject: string, content: string) => {
  console.log(`Sending email to ${emails.length} subscribers`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${content}`);
  
  // Simulate sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { sent: emails.length };
};

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only administrators can send newsletter broadcasts' },
        { status: 403 }
      );
    }
    
    const { subject, content } = await request.json();
    
    if (!subject || !content) {
      return NextResponse.json(
        { success: false, message: 'Subject and content are required' },
        { status: 400 }
      );
    }
    
    // Get all active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { subscribed: true },
      select: { email: true }
    });
    
    if (subscribers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No subscribers to send to'
      }, { status: 400 });
    }
    
    // Extract email addresses
    const emails = subscribers.map(sub => sub.email);
    
    // Send the emails (in a real app, use a proper email service)
    const result = await sendEmails(emails, subject, content);
    
    // Log the broadcast
    // You might want to create a BroadcastHistory model in the future
    
    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${result.sent} subscribers`,
      sentCount: result.sent
    });
  } catch (error) {
    console.error('Newsletter broadcast error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}
