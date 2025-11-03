import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { encrypt, decrypt } from './encryption';

export interface UserPayload {
  id: number;
  email: string;
  name: string;
  role: string;
}

// Function to get current user from encrypted cookie - works with both server components and API routes
export async function getCurrentUser(request?: Request): Promise<UserPayload | null> {
  try {
    let authCookie: string | undefined;
    
    if (request) {
      // API route context - extract from request headers
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split('; ').map(cookie => {
            const [name, ...rest] = cookie.split('=');
            return [name, rest.join('=')];
          })
        );
        authCookie = cookies.authUser;
      }
    } else {
      // Server component context - use Next.js cookies
      const cookieStore = await cookies();
      authCookie = cookieStore.get('authUser')?.value;
    }
    
    if (!authCookie) return null;
    
    // Decrypt the cookie value to get the user data
    const decrypted = decrypt(authCookie);
    const userData = JSON.parse(decrypted) as UserPayload;
    
    return userData;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Create user session cookie
export const createUserSession = (user: UserPayload) => {
  const data = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  
  const encrypted = encrypt(data);
    // Set cookie options - updated for better compatibility
  const cookieOptions = {
    httpOnly: true,
    secure: true, // Always use secure for security
    sameSite: 'lax' as const, // Change to 'lax' for better compatibility
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  };
  
  // Serialize cookie for HTTP header
  return serialize('authUser', encrypted, cookieOptions);
};

// Clear user session
export const clearUserSession = () => {
  return serialize('authUser', '', {
    httpOnly: true,
    secure: true, // Always use secure, matching the creation settings
    sameSite: 'lax' as const, // Use same sameSite value as when setting
    maxAge: -1,
    path: '/',
  });
};

// Updated middleware to protect routes that require authentication
export const requireAuth = (handler: Function) => {
  return async (request: Request) => {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return handler(request, user);
  };
};

// Updated middleware to protect admin routes
export const requireAdmin = (handler: Function) => {
  return async (request: Request) => {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return handler(request, user);
  };
};