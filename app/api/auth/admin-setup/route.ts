import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function GET() {
  try {
    // Look for existing admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    // If admin exists, return info
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin already exists',
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      });
    }
    
    // Admin doesn't exist, create one
    const adminData = {
      email: 'admin@radiomusic.com',
      password: 'admin123', // This is intentionally a simple password for development
      name: 'Admin User',
      role: 'admin'
    };
    
    const hashedPassword = hashPassword(adminData.password);
    
    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        name: adminData.name,
        role: adminData.role
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      },
      note: 'For security, please change the default password after first login'
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set up admin user' },
      { status: 500 }
    );
  }
}
