import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Access Denied" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold text-slate-200 mb-4">401</p>
        <h1 className="text-lg font-semibold text-slate-900 mb-2">Unauthorized</h1>
        <p className="text-sm text-slate-500 mb-6">
          You need to be signed in to access this page.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
