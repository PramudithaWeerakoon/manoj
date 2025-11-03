import { NextResponse } from 'next/server';
import { clearUserSession } from '@/lib/auth';

export async function POST() {
  // Create the response object
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });
  
  // Clear the main session cookie
  const authCookieClear = clearUserSession();
  
  // Also clear the admin token cookie - match the settings used when setting
  const adminCookieClear = 'admin_token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0';
  
  // Apply both cookies as separate Set-Cookie headers (this is the correct way to set multiple cookies)
  response.headers.append('Set-Cookie', authCookieClear);
  response.headers.append('Set-Cookie', adminCookieClear);
  
  return response;
}
