"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { ROUTES } from "@/constants";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute — wraps any page that requires authentication.
 * Optionally restricts access to specific roles.
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={["parent"]}>
 *     <ParentDashboard />
 *   </ProtectedRoute>
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace(ROUTES.FORBIDDEN);
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGuard — conditionally renders children based on the current user's role.
 * Unlike ProtectedRoute, this does NOT redirect — it simply hides UI elements.
 *
 * Usage:
 *   <RoleGuard allowedRoles={["parent"]}>
 *     <InviteTutorButton />
 *   </RoleGuard>
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
