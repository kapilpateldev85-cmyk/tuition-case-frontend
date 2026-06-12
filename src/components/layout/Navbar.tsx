"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { SidebarNav } from "./SidebarNav";
import { useAuth } from "@/features/auth/AuthProvider";
import { getInitials } from "@/utils";
import { ROUTES } from "@/constants";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 gap-4"
        role="banner"
      >
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          id="mobile-menu-button"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link
          href={user?.role === "tutor" ? ROUTES.TUTOR_DASHBOARD : ROUTES.PARENT_DASHBOARD}
          className="flex items-center gap-2 font-semibold text-slate-900 text-sm"
          aria-label="TuitionSpace home"
        >
          <div className="h-7 w-7 rounded-md bg-slate-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">TS</span>
          </div>
          <span className="hidden sm:inline">TuitionSpace</span>
        </Link>

        <div className="flex-1" />

        {/* Role badge */}
        {user && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 capitalize">
            {user.role}
          </span>
        )}

        {/* Notifications (placeholder) */}
        <Button variant="ghost" size="icon" aria-label="Notifications" id="notifications-button">
          <Bell className="h-4 w-4 text-slate-500" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-8 px-2"
              id="user-menu-trigger"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-slate-900 text-white">
                  {user ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium text-slate-700">
                {user?.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.role === "tutor" && (
              <DropdownMenuItem asChild>
                <Link href={ROUTES.TUTOR_PROFILE} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 focus:text-red-600 cursor-pointer"
              id="logout-button"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="sm:max-w-xs left-0 top-0 translate-x-0 translate-y-0 h-full rounded-none border-r border-l-0 border-t-0 border-b-0 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100">
              <div className="h-7 w-7 rounded-md bg-slate-900 flex items-center justify-center">
                <span className="text-white text-xs font-bold">TS</span>
              </div>
              <span className="font-semibold text-slate-900 text-sm">TuitionSpace</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarNav onNavClick={() => setMobileOpen(false)} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
