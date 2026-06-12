"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Users, UserCircle } from "lucide-react";
import { registerSchema, type RegisterFormValues } from "@/schemas";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { USER_ROLES, ROUTES } from "@/constants";
import { cn } from "@/utils";
import type { Metadata } from "next";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: "parent",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser(values.email, values.password, values.role);
    } catch (err: unknown) {
      setServerError(
        (err as { message?: string }).message ?? "Registration failed. Please try again."
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
        <h1 className="text-xl font-semibold text-slate-900">Create an account</h1>
        <p className="text-sm text-slate-500 mt-1">Join TuitionSpace today</p>
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
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "register-email-error" : undefined}
          />
          {errors.email && (
            <p id="register-email-error" className="text-xs text-red-500" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "register-password-error" : undefined}
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
            <p id="register-password-error" className="text-xs text-red-500" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="register-confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              placeholder="••••••••"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "register-confirm-password-error" : undefined}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="register-confirm-password-error" className="text-xs text-red-500" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
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
          id="register-submit"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
        
        {/* Navigation link */}
        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <Link href={ROUTES.LOGIN} className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
