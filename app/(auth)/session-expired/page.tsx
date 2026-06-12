import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/constants";

export const metadata: Metadata = { title: "Session Expired" };

export default function SessionExpiredPage() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">⏱️</span>
      </div>
      <h1 className="text-lg font-semibold text-slate-900 mb-2">Session expired</h1>
      <p className="text-sm text-slate-500 mb-6">
        Your session has expired for security reasons. Please sign in again to continue.
      </p>
      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
      >
        Sign in again
      </Link>
    </div>
  );
}
