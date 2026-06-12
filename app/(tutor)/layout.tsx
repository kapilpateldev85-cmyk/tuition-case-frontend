"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/features/auth/guards";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["tutor"]}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
