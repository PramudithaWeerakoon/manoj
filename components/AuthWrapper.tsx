"use client";

// Main entry component that provides auth context to the application
import { PropsWithChildren } from "react";
import AuthProvider from "./AuthProvider";
import ProtectedPage from "./ProtectedPage";

// This component can be used in client components that need auth
export function AuthWrapper({ 
  children,
  requireAuth = false
}: PropsWithChildren<{ 
  requireAuth?: boolean 
}>) {
  return (
    <AuthProvider>
      {requireAuth ? (
        <ProtectedPage>{children}</ProtectedPage>
      ) : (
        children
      )}
    </AuthProvider>
  );
}
