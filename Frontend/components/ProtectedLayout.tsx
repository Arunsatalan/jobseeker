"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedLayoutProps {
  children: ReactNode;
  requiredRole?: string; // 'admin', 'employer', etc.
}

export function ProtectedLayout({ 
  children, 
  requiredRole 
}: ProtectedLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth context to load
    if (isLoading) {
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      router.push('/?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    // If specific role is required, check it
    if (requiredRole && user.role !== requiredRole) {
      console.error(`Access denied: User role is '${user.role}', but '${requiredRole}' is required`);
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, router, requiredRole]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // If role is required but doesn't match, don't render
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
}
