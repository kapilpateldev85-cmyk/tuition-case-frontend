import { z } from "zod";
import { CASE_SUBJECTS, CASE_LEVELS, CASE_STATUSES, FILE_CONSTRAINTS } from "@/constants";

// ─── Auth Schemas ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["parent", "tutor"], {
    message: "Please select a role",
  }),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
  role: z.enum(["parent", "tutor"], {
    message: "Please select a role",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Case Schemas ──────────────────────────────────────────────────────────────

export const createCaseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters")
    .trim(),
  subject: z.enum(
    CASE_SUBJECTS as [string, ...string[]],
    { message: "Subject is required" }
  ),
  level: z.enum(
    CASE_LEVELS as [string, ...string[]],
    { message: "Level is required" }
  ),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location must be at most 200 characters")
    .trim(),
  budgetPerHour: z
    .number({ message: "Budget must be a number" })
    .min(1, "Budget must be at least $1")
    .max(10000, "Budget must be at most $10,000"),
  description: z
    .string()
    .max(1000, "Description must be at most 1,000 characters")
    .trim()
    .optional(),
});

export type CreateCaseFormValues = z.infer<typeof createCaseSchema>;

export const editCaseSchema = createCaseSchema.extend({
  status: z.enum(["open", "matched", "closed"]).optional(),
});

export type EditCaseFormValues = z.infer<typeof editCaseSchema>;

export const updateCaseSchema = createCaseSchema.partial().extend({
  status: z.enum(["open", "matched", "closed"]).optional(),
});

export type UpdateCaseFormValues = z.infer<typeof updateCaseSchema>;

// ─── Tutor Profile Schemas ─────────────────────────────────────────────────────

export const qualificationSchema = z.object({
  degree: z
    .string()
    .min(1, "Degree is required")
    .max(100, "Max 100 characters")
    .trim(),
  institution: z
    .string()
    .min(1, "Institution is required")
    .max(100, "Max 100 characters")
    .trim(),
  year: z
    .number({ message: "Year must be a number" })
    .min(1950, "Year must be 1950 or later")
    .max(new Date().getFullYear(), `Year cannot be in the future`),
});

export type QualificationFormValues = z.infer<typeof qualificationSchema>;

export const experienceSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Max 300 characters")
    .trim(),
  yearsOfExperience: z
    .number({ message: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(50, "Must be 50 years or less"),
});

export type ExperienceFormValues = z.infer<typeof experienceSchema>;

export const tutorProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(80, "Max 80 characters")
    .trim(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .trim()
    .optional(),
  qualifications: z.array(qualificationSchema).min(1, "Add at least one qualification"),
  experiences: z.array(experienceSchema).min(1, "Add at least one experience entry"),
});

export type TutorProfileFormValues = z.infer<typeof tutorProfileSchema>;

// ─── File Upload Schema ────────────────────────────────────────────────────────

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine(
      (f) => f.size <= FILE_CONSTRAINTS.MAX_SIZE_BYTES,
      `File must be smaller than ${FILE_CONSTRAINTS.MAX_SIZE_LABEL}`
    )
    .refine(
      (f) => (FILE_CONSTRAINTS.ALLOWED_MIME_TYPES as readonly string[]).includes(f.type),
      `Allowed types: ${FILE_CONSTRAINTS.ALLOWED_LABEL}`
    ),
});

// ─── Search / Filter Schemas ───────────────────────────────────────────────────

export const caseFilterSchema = z.object({
  search: z.string().optional(),
  subject: z.enum(CASE_SUBJECTS as [string, ...string[]]).or(z.literal("")).optional(),
  level: z.enum(CASE_LEVELS as [string, ...string[]]).or(z.literal("")).optional(),
  status: z.enum(["open", "matched", "closed"]).or(z.literal("")).optional(),
});

export type CaseFilterFormValues = z.infer<typeof caseFilterSchema>;
