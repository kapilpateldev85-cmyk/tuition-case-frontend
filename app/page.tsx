"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { ROUTES } from "@/constants";

/** Root page — redirects to dashboard or login based on auth state. */
export default function RootPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) {
      router.replace(user.role === "tutor" ? ROUTES.TUTOR_DASHBOARD : ROUTES.PARENT_DASHBOARD);
    } else {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" />
    </div>
  );
}
