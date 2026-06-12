import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/constants";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🔑</span>
      </div>
      <h1 className="text-lg font-semibold text-slate-900 mb-2">Password reset</h1>
      <p className="text-sm text-slate-500 mb-6">
        In the full implementation, this page would send a password reset email.
        For now, please use the demo credentials on the login page.
      </p>
      <Link
        href={ROUTES.LOGIN}
        className="text-sm font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700"
      >
        Back to login
      </Link>
    </div>
  );
}
