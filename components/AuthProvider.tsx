"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

// Auth context type definitions
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Public routes that don't require authentication checks
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/albums',
  '/events',
  '/reviews',
  '/contact',
  '/about',
  '/merchandise'
];

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || 
    pathname?.startsWith(`${route}/`)
  );

  // Function to fetch current user
  const refreshUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        // Only redirect if not on a public route
        if (!isPublicRoute && response.status === 401) {
          router.push(`/auth/login?redirect=${pathname}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (response.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on mount and route changes
  useEffect(() => {
    refreshUser();
    
    // Make the refreshUser available globally
    window.refreshAuthUser = refreshUser;
    
    return () => {
      window.refreshAuthUser = undefined;
    };
  }, [pathname]);
  
  // If this is a protected route and we're still loading, show nothing
  // This prevents the UI flash on protected routes
  if (!isPublicRoute && loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-2">
          <div className="h-6 w-32 bg-muted rounded"></div>
          <div className="h-4 w-24 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
