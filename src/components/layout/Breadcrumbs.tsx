"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm text-slate-500 mb-4", className)}
    >
      <Link href="/" className="flex items-center hover:text-slate-900 transition-colors">
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-slate-900 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(i === items.length - 1 && "text-slate-900 font-medium")}
              aria-current={i === items.length - 1 ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
