import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';

// This endpoint is for development purposes to set up an admin account
// Should be disabled or secured in production
export async function GET() {
  try {
    // Check if an admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        email: existingAdmin.email
      });
    }
    
    // Admin credentials - in production, these should come from environment variables or a setup form
    const adminEmail = 'admin@radiomusic.com';
    const adminPassword = 'admin123'; // Use a strong password in production
    
    // Hash the password
    const hashedPassword = hashPassword(adminPassword);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      email: admin.email
    });
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set up admin user' },
      { status: 500 }
    );
  }
}
