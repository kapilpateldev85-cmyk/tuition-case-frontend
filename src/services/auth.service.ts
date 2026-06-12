/**
 * Auth Service — Real Implementation
 *
 * Integrates with NestJS backend REST API:
 * POST   /auth/login          → returns { accessToken, refreshToken, user }
 * POST   /auth/register       → returns { accessToken, refreshToken, user }
 * POST   /auth/refresh        → returns { accessToken, refreshToken, user }
 * GET    /auth/me             → returns { id, email, role }
 * POST   /auth/change-password → returns { success }
 */

import type { AuthSession, LoginCredentials, User } from "@/types";
import { axiosInstance } from "@/lib/axios";

/**
 * Helper: Normalize role from backend format (PARENT/TUTOR) to frontend format (parent/tutor)
 */
function normalizeRole(role: string): "parent" | "tutor" {
  const lower = role.toLowerCase();
  if (lower === "parent") return "parent";
  if (lower === "tutor") return "tutor";
  throw new Error(`Unknown role: ${role}`);
}

/**
 * Helper: Map backend user + tokens to AuthSession format
 */
function mapAuthResponse(data: {
  user: { id: string; email: string; role: string };
  accessToken: string;
  refreshToken: string;
}): AuthSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.email.split("@")[0], // Derive from email
      role: normalizeRole(data.user.role),
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    token: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: expiresAt.toISOString(),
  };
}

export const authService = {
  /**
   * Login with email, password, and role.
   * Backend endpoint: POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      });

      // Backend does not wrap response in { success, data, ... } for auth endpoints
      const authData = response.data;
      return mapAuthResponse(authData);
    } catch (error: any) {
      throw {
        message: error.message ?? "Login failed. Please try again.",
        code: error.code ?? "LOGIN_ERROR",
        statusCode: error.statusCode ?? 500,
      };
    }
  },

  /**
   * Register a new user.
   * Backend endpoint: POST /auth/register
   */
  async register(email: string, password: string, role: "parent" | "tutor"): Promise<AuthSession> {
    try {
      const response = await axiosInstance.post("/auth/register", {
        email: email.toLowerCase().trim(),
        password,
        role: role.toUpperCase(),
      });

      const authData = response.data;
      return mapAuthResponse(authData);
    } catch (error: any) {
      throw {
        message: error.message ?? "Registration failed. Please try again.",
        code: error.code ?? "REGISTER_ERROR",
        statusCode: error.statusCode ?? 500,
      };
    }
  },

  /**
   * Refresh the access token using a refresh token.
   * Backend endpoint: POST /auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<AuthSession> {
    try {
      const response = await axiosInstance.post("/auth/refresh", {
        refreshToken,
      });

      const authData = response.data;
      return mapAuthResponse(authData);
    } catch (error: any) {
      throw {
        message: "Session expired. Please login again.",
        code: "REFRESH_FAILED",
        statusCode: error.statusCode ?? 500,
      };
    }
  },

  /**
   * Fetch the currently authenticated user.
   * Backend endpoint: GET /auth/me
   * Requires Authorization header (handled by axios interceptor).
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axiosInstance.get("/auth/me");
      const userData = response.data;

      return {
        id: userData.id,
        email: userData.email,
        name: userData.email.split("@")[0],
        role: normalizeRole(userData.role),
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        message: error.message ?? "Failed to fetch user.",
        code: error.code ?? "GET_USER_ERROR",
        statusCode: error.statusCode ?? 500,
      };
    }
  },

  /**
   * Change password.
   * Backend endpoint: POST /auth/change-password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await axiosInstance.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      throw {
        message: error.message ?? "Failed to change password.",
        code: error.code ?? "CHANGE_PASSWORD_ERROR",
        statusCode: error.statusCode ?? 500,
      };
    }
  },

  /**
   * Logout — clear session (client-side only, no backend call needed)
   */
  async logout(): Promise<void> {
    // Backend doesn't track sessions, just clear client-side
    return Promise.resolve();
  },
};
