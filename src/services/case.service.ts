import type {
  Case,
  CaseFilters,
  CreateCasePayload,
  UpdateCasePayload,
  Invitation,
  PaginatedResponse,
} from "@/types";
import { axiosInstance } from "@/lib/axios";
import { CASE_SUBJECTS } from "@/constants";

/** Map frontend subject labels to backend Prisma enum values. */
const SUBJECT_TO_BACKEND: Record<string, string> = {
  Math: "MATHEMATICS",
  English: "ENGLISH",
  Chinese: "CHINESE",
  Physics: "PHYSICS",
  Chemistry: "CHEMISTRY",
  Biology: "BIOLOGY",
  History: "HISTORY",
  Geography: "GEOGRAPHY",
  Economics: "ECONOMICS",
  Literature: "OTHER",
  Tamil: "OTHER",
  Malay: "OTHER",
  Other: "OTHER",
};

function mapSubjectToBackend(subject: string): string {
  return SUBJECT_TO_BACKEND[subject] ?? subject.toUpperCase();
}

function mapCaseFromBackend(data: any): Case {
  if (!data) return data;
  
  // Map subject back to frontend casing (e.g. "MATHEMATICS" -> "Math")
  let mappedSubject = data.subject;
  if (typeof data.subject === "string") {
    const found = CASE_SUBJECTS.find(s => s.toUpperCase() === data.subject.toUpperCase());
    if (found) mappedSubject = found;
  }

  return {
    ...data,
    subject: mappedSubject,
    status: data.status ? data.status.toLowerCase() : "open",
    invitedTutors: (data.invitations || data.invitedTutors || []).map((inv: any) => ({
      ...inv,
      status: inv.status ? inv.status.toLowerCase() : "pending",
      tutor: inv.tutor ? {
        ...inv.tutor,
        name: inv.tutor.displayName || inv.tutor.name || "Unknown Tutor",
      } : { name: "Unknown Tutor" },
    })),
    documents: (data.documents || []).map((d: any) => ({
      ...d,
      originalName: d.filename || d.originalName || "Document",
      fileName: d.filename || d.fileName || "document",
      createdAt: d.uploadedAt || d.createdAt || new Date().toISOString(),
      uploadedBy: d.uploadedBy ? {
        id: d.uploadedBy.id || "",
        name: d.uploadedBy.name || d.uploadedBy.email || "Unknown User",
      } : { id: "", name: "Unknown User" },
    })),
  };
}

export const caseService = {
  /**
   * List cases with pagination, search, and filtering.
   */
  async list(
    filters: CaseFilters,
    viewerId: string,
    viewerRole: "parent" | "tutor"
  ): Promise<PaginatedResponse<Case>> {
    const params: any = {
      ...filters,
      limit: filters.pageSize,
    };
    delete params.pageSize;
    delete params.sortBy;
    delete params.sortOrder;
    if (params.subject) params.subject = mapSubjectToBackend(params.subject);
    if (params.level) params.level = params.level.toUpperCase();
    if (params.status) params.status = params.status.toUpperCase();

    const response = await axiosInstance.get("/cases", { params });
    const data = response.data;

    return {
      data: (data.items || []).map(mapCaseFromBackend),
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.limit || 10,
      totalPages: data.totalPages || 1,
    };
  },

  /**
   * Get a single case by ID.
   */
  async getById(
    id: string,
    viewerId: string,
    viewerRole: "parent" | "tutor"
  ): Promise<Case> {
    const response = await axiosInstance.get(`/cases/${id}`);
    return mapCaseFromBackend(response.data);
  },

  /**
   * Create a new case (parent only).
   */
  async create(
    payload: CreateCasePayload,
    ownerId: string,
    ownerName: string,
    ownerEmail: string
  ): Promise<Case> {
    const mappedPayload = {
      ...payload,
      subject: mapSubjectToBackend(payload.subject),
      level: payload.level.toUpperCase(),
    };
    const response = await axiosInstance.post("/cases", mappedPayload);
    return mapCaseFromBackend(response.data);
  },

  /**
   * Update a case (parent owner only).
   */
  async update(
    id: string,
    payload: UpdateCasePayload,
    requesterId: string
  ): Promise<Case> {
    const mappedPayload = { ...payload } as any;
    if (mappedPayload.subject) mappedPayload.subject = mapSubjectToBackend(mappedPayload.subject);
    if (mappedPayload.level) mappedPayload.level = mappedPayload.level.toUpperCase();
    if (mappedPayload.status) mappedPayload.status = mappedPayload.status.toUpperCase();
    
    const response = await axiosInstance.patch(`/cases/${id}`, mappedPayload);
    return mapCaseFromBackend(response.data);
  },

  /**
   * Delete a case (parent owner only).
   */
  async delete(id: string, requesterId: string): Promise<void> {
    await axiosInstance.delete(`/cases/${id}`);
  },

  /**
   * Invite a tutor to a case.
   */
  async inviteTutor(
    caseId: string,
    tutorId: string,
    requesterId: string
  ): Promise<Invitation> {
    const response = await axiosInstance.post(`/cases/${caseId}/invite`, { tutorId });
    return response.data;
  },

  /**
   * Revoke a tutor's invitation from a case.
   */
  async revokeInvitation(
    caseId: string,
    tutorId: string,
    requesterId: string
  ): Promise<void> {
    await axiosInstance.delete(`/cases/${caseId}/invite/${tutorId}`);
  },

  /**
   * Accept or decline a case invitation (tutor only).
   */
  async respondToInvitation(
    invitationId: string,
    status: "accepted" | "declined"
  ): Promise<void> {
    await axiosInstance.patch(`/cases/invitations/${invitationId}`, {
      status: status.toUpperCase(),
    });
  },
};
