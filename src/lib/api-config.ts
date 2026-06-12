/**
 * Central API URL configuration for the frontend.
 *
 * NEXT_PUBLIC_API_URL must be set in the deployment platform (e.g. Vercel)
 * **before building** — Next.js inlines public env vars at build time.
 */

/** Backend base URL without trailing slash. Empty string if not configured. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/** Request timeout — longer in production for cold starts (Render, etc.). */
export const API_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_API_TIMEOUT ??
    (process.env.NODE_ENV === "production" ? 60000 : 15000)
);

export function isApiConfigured(): boolean {
  return API_BASE_URL.length > 0;
}

export function getMissingApiUrlMessage(): string {
  return (
    "Backend URL is not configured. Set NEXT_PUBLIC_API_URL to your hosted API URL " +
    "(e.g. https://your-api.onrender.com) in your deployment settings, then redeploy the frontend."
  );
}
