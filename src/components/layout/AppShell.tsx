"use client";

import { Navbar } from "./Navbar";
import { SidebarNav } from "./SidebarNav";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — the main authenticated layout wrapper.
 * - Fixed navbar at the top
 * - Sticky sidebar on large screens
 * - Scrollable main content area
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex pt-14">
        {/* Desktop Sidebar */}
        <aside
          className="hidden lg:flex flex-col fixed left-0 top-14 bottom-0 w-[220px] border-r border-slate-200 bg-white px-3 py-4 overflow-y-auto z-30"
          aria-label="Sidebar navigation"
        >
          <SidebarNav />
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 lg:pl-[220px] min-h-[calc(100vh-56px)]"
          id="main-content"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
