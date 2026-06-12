// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "parent" | "tutor";

export type CaseStatus = "open" | "matched" | "closed";

export type InvitationStatus = "pending" | "accepted" | "declined";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
  rememberMe: boolean;
}

// ─── Case ─────────────────────────────────────────────────────────────────────

export type CaseLevel =
  | "P1" | "P2" | "P3" | "P4" | "P5" | "P6"
  | "S1" | "S2" | "S3" | "S4" | "S5"
  | "JC1" | "JC2";

export type CaseSubject =
  | "Math" | "English" | "Chinese" | "Physics"
  | "Chemistry" | "Biology" | "History" | "Geography"
  | "Economics" | "Literature" | "Tamil" | "Malay" | "Other";

export interface Case {
  id: string;
  title: string;
  subject: CaseSubject;
  level: CaseLevel;
  location: string;
  budgetPerHour: number;
  status: CaseStatus;
  description?: string;
  ownerId: string;
  owner: Pick<User, "id" | "name" | "email">;
  invitedTutors: Invitation[];
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseFilters {
  search?: string;
  subject?: CaseSubject | "";
  level?: CaseLevel | "";
  status?: CaseStatus | "";
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "budgetPerHour" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CreateCasePayload {
  title: string;
  subject: CaseSubject;
  level: CaseLevel;
  location: string;
  budgetPerHour: number;
  description?: string;
}

export interface UpdateCasePayload extends Partial<CreateCasePayload> {
  status?: CaseStatus;
}

// ─── Invitation ───────────────────────────────────────────────────────────────

export interface Invitation {
  id: string;
  caseId: string;
  tutorId: string;
  tutor: Pick<User, "id" | "name" | "email"> & { profile?: TutorProfile | null };
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  case?: Pick<Case, "id" | "title" | "subject" | "level" | "location" | "budgetPerHour" | "status" | "createdAt">;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export type DocumentContext = "case" | "tutor_profile";

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  context: DocumentContext;
  caseId?: string;
  tutorProfileId?: string;
  uploadedById: string;
  uploadedBy: Pick<User, "id" | "name">;
  createdAt: string;
  updatedAt: string;
}

// ─── Tutor Profile ────────────────────────────────────────────────────────────

export interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: number;
}

export interface Experience {
  id: string;
  description: string;
  yearsOfExperience: number;
}

export interface TutorProfile {
  id: string;
  userId: string;
  user: Pick<User, "id" | "name" | "email" | "avatarUrl">;
  displayName: string;
  bio?: string;
  qualifications: Qualification[];
  experiences: Experience[];
  documents: Document[];
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TutorProfileFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── API Layer Types ──────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  field?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
