"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Users, UserCircle } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/schemas";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { USER_ROLES, ROUTES } from "@/constants";
import { cn } from "@/utils";
import type { UserRole } from "@/types";
import type { Metadata } from "next";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "parent",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
    } catch (err: unknown) {
      setServerError(
        (err as { message?: string }).message ?? "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-sm">TS</span>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to your TuitionSpace account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Role selector */}
        <div className="space-y-2">
          <Label>I am a</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Select role">
                {USER_ROLES.map((role) => {
                  const Icon = role.value === "parent" ? Users : UserCircle;
                  const isSelected = field.value === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => field.onChange(role.value)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all",
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                      )}
                      id={`role-${role.value}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium">{role.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.role && (
            <p className="text-xs text-red-500" role="alert">{errors.role.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
          />
          {errors.email && (
            <p id="login-email-error" className="text-xs text-red-500" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" className="text-xs text-red-500" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="remember-me"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="remember-me" className="font-normal text-slate-600 cursor-pointer">
            Remember me for 30 days
          </Label>
        </div>

        {/* Server error */}
        {serverError && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          id="login-submit"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {/* Navigation link */}
      <p className="text-center text-sm text-slate-600 mt-6">
        Don't have an account?{" "}
        <Link href={ROUTES.REGISTER} className="font-semibold text-slate-900 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
