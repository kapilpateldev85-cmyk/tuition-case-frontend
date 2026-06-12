"use client";

/**
 * AuthProvider
 *
 * Manages authentication state across the entire application.
 * - Persists session in localStorage (key: SESSION_KEY)
 * - Exposes useAuth() and useCurrentUser() hooks
 * - Handles session expiry
 * - Easy to swap for a real auth provider (Clerk, NextAuth, Supabase Auth)
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthSession, User, LoginCredentials } from "@/types";
import { authService } from "@/services/auth.service";
import { SESSION_KEY } from "@/lib/axios";
import { ROUTES } from "@/constants";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (email: string, password: string, role: "parent" | "tutor") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session from localStorage on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const stored: AuthSession = JSON.parse(raw);
          // Check expiry
          if (new Date(stored.expiresAt) > new Date()) {
            setSession(stored);
          } else {
            // Token expired, attempt to refresh
            try {
              const newSession = await authService.refreshToken(stored.refreshToken);
              localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
              setSession(newSession);
            } catch (err) {
              console.error("Failed to refresh token", err);
              localStorage.removeItem(SESSION_KEY);
            }
          }
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const newSession = await authService.login(credentials);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);

      // Redirect based on role
      if (newSession.user.role === "parent") {
        router.push(ROUTES.PARENT_DASHBOARD);
      } else {
        router.push(ROUTES.TUTOR_DASHBOARD);
      }
    },
    [router]
  );

  const register = useCallback(
    async (email: string, password: string, role: "parent" | "tutor") => {
      const newSession = await authService.register(email, password, role);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);

      // Redirect based on role
      if (newSession.user.role === "parent") {
        router.push(ROUTES.PARENT_DASHBOARD);
      } else {
        router.push(ROUTES.TUTOR_DASHBOARD);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    router.push(ROUTES.LOGIN);
  }, [router]);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    isLoading,
    isAuthenticated: !!session,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Returns the full auth context: login, logout, user, isLoading, isAuthenticated.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

/**
 * Returns just the current user. Throws if not authenticated.
 * Convenience hook for components that always require a user.
 */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) {
    throw new Error("useCurrentUser called without authenticated session");
  }
  return user;
}
