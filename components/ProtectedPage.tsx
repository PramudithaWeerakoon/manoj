"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

// Helper component that shows a loading indicator while auth is being verified
function AuthenticatingIndicator() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
        <p className="text-sm text-muted-foreground">Verifying authentication...</p>
      </div>
    </div>
  );
}

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const pathname = usePathname();

  // Use this effect to detect and debug auth issues
  useEffect(() => {
    if (loading) {
      console.log(`Auth verification in progress for ${pathname}`);
    }
  }, [loading, pathname]);

  // Show a loading indicator while auth is being verified
  if (loading) {
    return <AuthenticatingIndicator />;
  }

  return <>{children}</>;
}
