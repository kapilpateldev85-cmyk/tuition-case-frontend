"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  UserCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import { ROUTES } from "@/constants";

const parentNav = [
  { href: ROUTES.PARENT_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.PARENT_CASES, label: "My Cases", icon: FolderOpen },
  { href: ROUTES.PARENT_TUTORS, label: "Tutors", icon: Users },
];

const tutorNav = [
  { href: ROUTES.TUTOR_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.TUTOR_CASES, label: "My Cases", icon: FolderOpen },
  { href: ROUTES.TUTOR_PROFILE, label: "My Profile", icon: UserCircle },
];

interface SidebarNavProps {
  onNavClick?: () => void;
}

export function SidebarNav({ onNavClick }: SidebarNavProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = user?.role === "parent" ? parentNav : tutorNav;

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}

    </nav>
  );
}
