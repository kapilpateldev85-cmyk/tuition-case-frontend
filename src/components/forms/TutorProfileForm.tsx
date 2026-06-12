"use client";

import { useEffect } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { tutorProfileSchema, type TutorProfileFormValues } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { TutorProfile } from "@/types";

interface TutorProfileFormProps {
  defaultValues?: Partial<TutorProfileFormValues>;
  onSubmit: (values: TutorProfileFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TutorProfileForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Save",
}: TutorProfileFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<TutorProfileFormValues>({
    resolver: zodResolver(tutorProfileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      qualifications: [{ degree: "", institution: "", year: new Date().getFullYear() }],
      experiences: [{ description: "", yearsOfExperience: 0 }],
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (!defaultValues) return;

    reset({
      displayName: defaultValues.displayName ?? "",
      bio: defaultValues.bio ?? "",
      qualifications:
        defaultValues.qualifications?.length
          ? defaultValues.qualifications
          : [{ degree: "", institution: "", year: new Date().getFullYear() }],
      experiences:
        defaultValues.experiences?.length
          ? defaultValues.experiences
          : [{ description: "", yearsOfExperience: 0 }],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultValues?.displayName,
    defaultValues?.bio,
    JSON.stringify(defaultValues?.qualifications),
    JSON.stringify(defaultValues?.experiences),
    reset,
  ]);

  const {
    fields: qualFields,
    append: appendQual,
    remove: removeQual,
  } = useFieldArray({ control, name: "qualifications" });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control, name: "experiences" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Display name */}
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">
          Display Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="profile-name"
          {...register("displayName")}
          placeholder="Your public name"
          maxLength={80}
        />
        {errors.displayName && (
          <p className="text-xs text-red-500" role="alert">{errors.displayName.message}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="profile-bio">Bio <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Textarea
          id="profile-bio"
          {...register("bio")}
          placeholder="Brief introduction about yourself, your teaching style, and strengths..."
          rows={3}
          maxLength={500}
        />
        {errors.bio && (
          <p className="text-xs text-red-500" role="alert">{errors.bio.message}</p>
        )}
      </div>

      <Separator />

      {/* Qualifications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base">
            Qualifications <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendQual({ degree: "", institution: "", year: new Date().getFullYear() })}
            id="add-qualification"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
        {errors.qualifications?.root && (
          <p className="text-xs text-red-500 mb-2" role="alert">{errors.qualifications.root.message}</p>
        )}
        <div className="space-y-3">
          {qualFields.map((field, i) => (
            <div key={field.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Qualification {i + 1}</span>
                {qualFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:text-red-500"
                    onClick={() => removeQual(i)}
                    aria-label={`Remove qualification ${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`qual-degree-${i}`}>Degree / Certificate</Label>
                  <Input id={`qual-degree-${i}`} {...register(`qualifications.${i}.degree`)} placeholder="BSc Mathematics" />
                  {errors.qualifications?.[i]?.degree && (
                    <p className="text-xs text-red-500">{errors.qualifications[i]?.degree?.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`qual-institution-${i}`}>Institution</Label>
                  <Input id={`qual-institution-${i}`} {...register(`qualifications.${i}.institution`)} placeholder="NUS" />
                  {errors.qualifications?.[i]?.institution && (
                    <p className="text-xs text-red-500">{errors.qualifications[i]?.institution?.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`qual-year-${i}`}>Year Awarded</Label>
                  <Input
                    id={`qual-year-${i}`}
                    type="number"
                    min={1950}
                    max={new Date().getFullYear()}
                    {...register(`qualifications.${i}.year`, { valueAsNumber: true })}
                    placeholder={String(new Date().getFullYear())}
                  />
                  {errors.qualifications?.[i]?.year && (
                    <p className="text-xs text-red-500">{errors.qualifications[i]?.year?.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Experience */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base">
            Experience <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendExp({ description: "", yearsOfExperience: 0 })}
            id="add-experience"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
        {errors.experiences?.root && (
          <p className="text-xs text-red-500 mb-2" role="alert">{errors.experiences.root.message}</p>
        )}
        <div className="space-y-3">
          {expFields.map((field, i) => (
            <div key={field.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Experience {i + 1}</span>
                {expFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:text-red-500"
                    onClick={() => removeExp(i)}
                    aria-label={`Remove experience ${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`exp-desc-${i}`}>Description</Label>
                <Textarea
                  id={`exp-desc-${i}`}
                  {...register(`experiences.${i}.description`)}
                  placeholder="e.g. 5 years teaching Sec 3-4 A-Math and E-Math"
                  rows={2}
                  maxLength={300}
                />
                {errors.experiences?.[i]?.description && (
                  <p className="text-xs text-red-500">{errors.experiences[i]?.description?.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`exp-years-${i}`}>Years of Experience</Label>
                <Input
                  id={`exp-years-${i}`}
                  type="number"
                  min={0}
                  max={50}
                  {...register(`experiences.${i}.yearsOfExperience`, { valueAsNumber: true })}
                  placeholder="5"
                  className="w-24"
                />
                {errors.experiences?.[i]?.yearsOfExperience && (
                  <p className="text-xs text-red-500">{errors.experiences[i]?.yearsOfExperience?.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        id="profile-form-submit"
        className="w-full sm:w-auto"
      >
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
