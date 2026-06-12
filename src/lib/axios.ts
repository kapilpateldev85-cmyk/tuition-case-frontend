/**
 * Axios instance with request/response interceptors.
 *
 * - Attaches Authorization header from session storage.
 * - Normalizes error responses into ApiError shape.
 * - 401 responses trigger session expiry redirect.
 *
 * To connect a real backend: set NEXT_PUBLIC_API_URL in .env.local
 * and this instance will automatically route all service calls there.
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/types";
import { API_BASE_URL, API_TIMEOUT_MS, getMissingApiUrlMessage, isApiConfigured } from "@/lib/api-config";

const SESSION_KEY = "tuition_session";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined" && !isApiConfigured()) {
      return Promise.reject({
        message: getMissingApiUrlMessage(),
        code: "API_URL_MISSING",
        statusCode: 0,
      } satisfies ApiError);
    }

    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        try {
          const session = JSON.parse(raw);
          if (session?.token) {
            config.headers.Authorization = `Bearer ${session.token}`;
          }
        } catch {
          // malformed session — ignore
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => {
    // Backend wraps all responses in { success, statusCode, data, message, ... }
    // We normalize this so services always get the unwrapped data
    const wrappedData = response.data;

    // If it's already a typical API response (has success field), extract data
    if (wrappedData && typeof wrappedData === "object" && "success" in wrappedData) {
      // Return a modified response object where response.data is just the actual data
      return {
        ...response,
        data: wrappedData.data || wrappedData,
      };
    }

    // Otherwise return as-is (for non-wrapped responses)
    return response;
  },
  (error: AxiosError<{ message?: string | string[]; code?: string; success?: boolean; statusCode?: number }>) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    const isAuthRoute = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");

    if (status === 401 && typeof window !== "undefined" && !isAuthRoute) {
      // Clear session and redirect to session-expired page.
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "/session-expired";
    }

    let errorMessage = "An unexpected error occurred";

    if (error.code === "ECONNABORTED") {
      errorMessage = isApiConfigured()
        ? "The server took too long to respond. If you use a free hosting tier, the backend may be waking up — wait a moment and try again."
        : getMissingApiUrlMessage();
    } else if (error.code === "ERR_NETWORK") {
      errorMessage = isApiConfigured()
        ? "Cannot reach the API. Check NEXT_PUBLIC_API_URL, ensure the backend is running, and verify FRONTEND_URL on the backend includes this site's URL (CORS)."
        : getMissingApiUrlMessage();
    } else if (typeof responseData?.message === "string") {
      errorMessage = responseData.message;
    } else if (Array.isArray(responseData?.message)) {
      errorMessage = responseData.message.join(", ");
    } else if (error.message) {
      errorMessage = error.message;
    }

    const apiError: ApiError = {
      message: errorMessage,
      code: responseData?.code ?? "UNKNOWN_ERROR",
      statusCode: status ?? 0,
    };

    return Promise.reject(apiError);
  }
);

export { SESSION_KEY };
