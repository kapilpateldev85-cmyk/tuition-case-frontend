"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCaseSchema, editCaseSchema, type CreateCaseFormValues, type EditCaseFormValues } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CASE_SUBJECTS, CASE_LEVELS, CASE_STATUSES } from "@/constants";
import type { Case } from "@/types";
import { cn } from "@/utils";

interface CaseFormProps {
  defaultValues?: Partial<EditCaseFormValues>;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
  submitLabel?: string;
  isEditing?: boolean;
}

/**
 * CaseForm — reusable form for creating and editing cases.
 * Uses react-hook-form + zod for fully validated, accessible forms.
 */
export function CaseForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Save",
  isEditing = false,
}: CaseFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EditCaseFormValues>({
    resolver: zodResolver(isEditing ? editCaseSchema : createCaseSchema),
    defaultValues: {
      title: "",
      location: "",
      description: "",
      budgetPerHour: undefined,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="case-title">
          Title <span aria-hidden="true" className="text-red-500">*</span>
        </Label>
        <Input
          id="case-title"
          {...register("title")}
          placeholder="e.g. Weekly P5 Math tuition near Bishan"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "case-title-error" : undefined}
          maxLength={100}
        />
        {errors.title && (
          <p id="case-title-error" className="text-xs text-red-500" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Subject and Level */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="case-subject">
            Subject <span aria-hidden="true" className="text-red-500">*</span>
          </Label>
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="case-subject" aria-invalid={!!errors.subject}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {CASE_SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.subject && (
            <p className="text-xs text-red-500" role="alert">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="case-level">
            Level <span aria-hidden="true" className="text-red-500">*</span>
          </Label>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="case-level" aria-invalid={!!errors.level}>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {CASE_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.level && (
            <p className="text-xs text-red-500" role="alert">
              {errors.level.message}
            </p>
          )}
        </div>
      </div>

      {/* Location and Budget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="case-location">
            Location <span aria-hidden="true" className="text-red-500">*</span>
          </Label>
          <Input
            id="case-location"
            {...register("location")}
            placeholder="e.g. Bishan, Singapore"
            aria-invalid={!!errors.location}
          />
          {errors.location && (
            <p className="text-xs text-red-500" role="alert">
              {errors.location.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="case-budget">
            Budget/hour ($) <span aria-hidden="true" className="text-red-500">*</span>
          </Label>
          <Input
            id="case-budget"
            type="number"
            min={1}
            max={10000}
            {...register("budgetPerHour", { valueAsNumber: true })}
            placeholder="e.g. 60"
            aria-invalid={!!errors.budgetPerHour}
          />
          {errors.budgetPerHour && (
            <p className="text-xs text-red-500" role="alert">
              {errors.budgetPerHour.message}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="case-description">
          Description{" "}
          <span className="text-slate-400 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="case-description"
          {...register("description")}
          placeholder="Describe your child's needs, any specific topics, schedule preferences..."
          rows={4}
          maxLength={1000}
        />
        {errors.description && (
          <p className="text-xs text-red-500" role="alert">
            {errors.description.message}
          </p>
        )}
        <p className="text-xs text-slate-400">Max 1,000 characters</p>
      </div>

      {/* Status (Only when editing) */}
      {isEditing && (
        <div className="space-y-1.5">
          <Label htmlFor="case-status">
            Status
          </Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="case-status" aria-invalid={!!errors.status}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {CASE_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-xs text-red-500" role="alert">
              {errors.status.message}
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !isDirty}
        id="case-form-submit"
        className="w-full sm:w-auto"
      >
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
