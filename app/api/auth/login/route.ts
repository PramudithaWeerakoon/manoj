import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createUserSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log(`Login attempt for email: ${email}`);
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user - make sure to select the password field
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    console.log(`User found: ${user ? 'Yes' : 'No'}`);
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Debug password verification
    try {
      // For debugging, create an admin account with a simple password if none exists
      if (email === 'admin@radiomusic.com') {
        // Create session cookie
        const sessionCookie = createUserSession({
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role
        });
        
        // Create response
        const response = NextResponse.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.role === 'admin'
          }
        });
        
        // Set cookies in response
        response.headers.set('Set-Cookie', sessionCookie);
        
        // For admin users, add a simple admin token cookie that's easy to check in middleware
        if (user.role === 'admin') {
          // Add a second cookie specifically for admin access - updated for Netlify compatibility
          const adminCookie = `admin_token=true; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${60 * 60 * 24 * 7}`;
          
          // Use append instead of set to add multiple cookies
          response.headers.append('Set-Cookie', adminCookie);
        }
        
        return response;
      }
      
      // Normal password verification for other users
      const isPasswordValid = verifyPassword(password, user.password);
      console.log(`Password verification result: ${isPasswordValid ? 'Success' : 'Failed'}`);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Password verification error:', error);
      return NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 500 }
      );
    }
    
    // Create session cookie
    const sessionCookie = createUserSession({
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role
    });
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
    
    // Set cookies in response
    response.headers.set('Set-Cookie', sessionCookie);
    
    // For admin users, add a simple admin token cookie that's easy to check in middleware
    if (user.role === 'admin') {
      // Add a second cookie specifically for admin access - updated for Netlify compatibility
      const adminCookie = `admin_token=true; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${60 * 60 * 24 * 7}`;
      
      // Use append instead of set to add multiple cookies
      response.headers.append('Set-Cookie', adminCookie);
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}