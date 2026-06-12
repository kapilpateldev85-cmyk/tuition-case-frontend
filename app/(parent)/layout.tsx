"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/features/auth/guards";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["parent"]}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
