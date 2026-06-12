import type { CaseStatus, CaseSubject, CaseLevel, UserRole } from "@/types";

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  SESSION_EXPIRED: "/session-expired",
  UNAUTHORIZED: "/unauthorized",
  FORBIDDEN: "/forbidden",

  // Parent
  PARENT_DASHBOARD: "/dashboard",
  PARENT_CASES: "/cases",
  PARENT_CASES_NEW: "/cases/new",
  PARENT_CASE_DETAIL: (id: string) => `/cases/${id}`,
  PARENT_CASE_EDIT: (id: string) => `/cases/${id}/edit`,
  PARENT_TUTORS: "/tutors",
  PARENT_TUTOR_PROFILE: (id: string) => `/tutors/${id}`,

  // Tutor
  TUTOR_DASHBOARD: "/tutor/dashboard",
  TUTOR_CASES: "/tutor/cases",
  TUTOR_CASE_DETAIL: (id: string) => `/tutor/cases/${id}`,
  TUTOR_PROFILE: "/tutor/profile",
  TUTOR_PROFILE_EDIT: "/tutor/profile/edit",

  // Docs
  DOCS: "/docs",
} as const;

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  auth: {
    currentUser: ["auth", "currentUser"] as const,
  },
  cases: {
    all: ["cases"] as const,
    list: (filters?: object) => ["cases", "list", filters] as const,
    detail: (id: string) => ["cases", "detail", id] as const,
    documents: (id: string) => ["cases", id, "documents"] as const,
    invitations: (id: string) => ["cases", id, "invitations"] as const,
  },
  tutors: {
    all: ["tutors"] as const,
    list: (filters?: object) => ["tutors", "list", filters] as const,
    profile: (id: string) => ["tutors", "profile", id] as const,
    myProfile: ["tutors", "myProfile"] as const,
    documents: (id: string) => ["tutors", id, "documents"] as const,
    invitations: ["tutors", "invitations"] as const,
  },
  documents: {
    all: ["documents"] as const,
  },
} as const;

// ─── Case Options ─────────────────────────────────────────────────────────────

export const CASE_SUBJECTS: CaseSubject[] = [
  "Math", "English", "Chinese", "Physics", "Chemistry",
  "Biology", "History", "Geography", "Economics", "Literature",
  "Tamil", "Malay", "Other",
];

export const CASE_LEVELS: CaseLevel[] = [
  "P1", "P2", "P3", "P4", "P5", "P6",
  "S1", "S2", "S3", "S4", "S5",
  "JC1", "JC2",
];

export const CASE_STATUSES: { value: CaseStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "matched", label: "Matched" },
  { value: "closed", label: "Closed" },
];

// ─── User Roles ───────────────────────────────────────────────────────────────

export const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: "parent",
    label: "Parent",
    description: "Post cases and find tutors for your child",
  },
  {
    value: "tutor",
    label: "Tutor",
    description: "Browse cases and offer your teaching services",
  },
];

// ─── File Constraints ─────────────────────────────────────────────────────────

export const FILE_CONSTRAINTS = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  MAX_SIZE_LABEL: "10 MB",
  ALLOWED_MIME_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ],
  ALLOWED_EXTENSIONS: [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"],
  ALLOWED_LABEL: "PDF, DOC, DOCX, PNG, JPG",
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ─── Mock Delay ───────────────────────────────────────────────────────────────

export const MOCK_DELAY_MS = 600;

// ─── Status Colors ────────────────────────────────────────────────────────────

export const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
  open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  matched: "bg-blue-50 text-blue-700 border-blue-200",
  closed: "bg-slate-50 text-slate-600 border-slate-200",
};
