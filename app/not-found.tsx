import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm">
        <p className="text-7xl font-bold text-slate-200 mb-4">404</p>
        <h1 className="text-lg font-semibold text-slate-900 mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
