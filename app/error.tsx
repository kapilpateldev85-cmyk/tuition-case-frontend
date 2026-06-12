"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    // e.g., Sentry.captureException(error);
  }, [error]);

  return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="text-center max-w-sm">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-6">
              An unexpected error occurred. Our team has been notified.
              <br />
              <span className="text-red-500 font-mono mt-2 block">{error.message}</span>
            </p>
            <Button onClick={reset} className="mr-2">Try again</Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Go home
            </Button>
          </div>
        </div>
  );
}
