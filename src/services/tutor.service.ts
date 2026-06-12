import type {
  TutorProfile,
  TutorProfileFilters,
  PaginatedResponse,
  Invitation,
  Qualification,
  Experience,
  Document,
} from "@/types";
import type { TutorProfileFormValues } from "@/schemas";
import { axiosInstance } from "@/lib/axios";

function parseQualifications(raw: unknown): Qualification[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `qual-${index}`,
          degree: item,
          institution: "Not specified",
          year: new Date().getFullYear(),
        };
      }
      return {
        id: item.id ?? `qual-${index}`,
        degree: item.degree ?? "Qualification",
        institution: item.institution ?? "Not specified",
        year: item.year ?? new Date().getFullYear(),
      };
    });
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parseQualifications(parsed);
    } catch {
      return [
        {
          id: "qual-0",
          degree: raw,
          institution: "Not specified",
          year: new Date().getFullYear(),
        },
      ];
    }
  }

  return [];
}

function parseExperiences(raw: unknown): Experience[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `exp-${index}`,
          description: item,
          yearsOfExperience: 0,
        };
      }
      return {
        id: item.id ?? `exp-${index}`,
        description: item.description ?? "Experience",
        yearsOfExperience: item.yearsOfExperience ?? 0,
      };
    });
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parseExperiences(parsed);
    } catch {
      return [
        {
          id: "exp-0",
          description: raw,
          yearsOfExperience: 0,
        },
      ];
    }
  }

  return [];
}

function mapProfileDocuments(documents: unknown): Document[] {
  if (!Array.isArray(documents)) return [];

  return documents.map((doc: any, index) => ({
    id: doc.id ?? `doc-${index}`,
    filename: doc.filename ?? doc.originalName ?? "document",
    originalName: doc.filename ?? doc.originalName ?? "Document",
    mimeType: doc.mimeType ?? "application/octet-stream",
    size: doc.size ?? 0,
    url: "",
    context: "tutor_profile" as const,
    tutorProfileId: doc.tutorId,
    uploadedById: doc.userId ?? doc.uploadedById ?? "",
    uploadedBy: doc.uploadedBy ?? { id: "", name: "Tutor" },
    createdAt: doc.uploadedAt ?? doc.createdAt ?? new Date().toISOString(),
    updatedAt: doc.updatedAt ?? doc.uploadedAt ?? doc.createdAt ?? new Date().toISOString(),
  }));
}

/**
 * Normalize backend tutor profile into the frontend TutorProfile shape.
 */
function mapProfileResponse(profile: any): TutorProfile {
  const qualifications = parseQualifications(profile.qualifications);
  const experiences = parseExperiences(profile.experiences);
  const documents = mapProfileDocuments(profile.documents);

  return {
    ...profile,
    user: profile.user ?? { id: profile.userId, email: "Unknown Email", name: profile.displayName },
    bio: profile.bio ?? undefined,
    qualifications,
    experiences,
    documents,
    isComplete:
      !!profile.displayName &&
      qualifications.length > 0 &&
      experiences.length > 0,
  };
}

export const tutorService = {
  /**
   * List all tutor profiles.
   */
  async list(filters: TutorProfileFilters): Promise<PaginatedResponse<TutorProfile>> {
    const params = {
      ...filters,
      limit: filters.pageSize,
    };
    delete params.pageSize;

    const response = await axiosInstance.get("/tutors", { params });
    const data = response.data;

    return {
      data: (data.items || []).map(mapProfileResponse),
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.limit || 10,
      totalPages: data.totalPages || 1,
    };
  },

  /**
   * Get a specific tutor profile by ID.
   */
  async getProfile(id: string): Promise<TutorProfile> {
    const response = await axiosInstance.get(`/tutors/${id}`);
    return mapProfileResponse(response.data);
  },

  /**
   * Get the logged-in tutor's own profile.
   */
  async getMyProfile(userId: string): Promise<TutorProfile | null> {
    try {
      const response = await axiosInstance.get("/tutors/me");
      return mapProfileResponse(response.data);
    } catch (error: any) {
      if (error.statusCode === 404) return null;
      throw error;
    }
  },

  /**
   * Create a tutor profile.
   */
  async createProfile(
    userId: string,
    userName: string,
    userEmail: string,
    payload: TutorProfileFormValues
  ): Promise<TutorProfile> {
    // stringify the arrays to match backend DTO
    const data = {
      displayName: payload.displayName,
      bio: payload.bio,
      qualifications: JSON.stringify(payload.qualifications),
      experiences: JSON.stringify(payload.experiences),
    };

    const response = await axiosInstance.post("/tutors/profile", data);
    return mapProfileResponse(response.data);
  },

  /**
   * Update the logged-in tutor's profile.
   */
  async updateProfile(
    userId: string,
    payload: Partial<TutorProfileFormValues>
  ): Promise<TutorProfile> {
    const data: any = {
      displayName: payload.displayName,
      bio: payload.bio,
    };

    if (payload.qualifications) {
      data.qualifications = JSON.stringify(payload.qualifications);
    }
    if (payload.experiences) {
      data.experiences = JSON.stringify(payload.experiences);
    }

    const response = await axiosInstance.patch("/tutors/profile", data);
    return mapProfileResponse(response.data);
  },

  /**
   * Get all invitations for the logged-in tutor.
   * Uses the dedicated GET /cases/my-invitations endpoint.
   */
  async getMyInvitations(tutorId: string): Promise<Invitation[]> {
    try {
      const response = await axiosInstance.get("/cases/my-invitations");
      // Backend returns array of CaseInvitation with case details included
      return (response.data || []).map((inv: any) => ({
        id: inv.id,
        caseId: inv.caseId,
        tutorId: inv.tutorId,
        invitedById: inv.invitedById,
        status: inv.status ? inv.status.toLowerCase() : "pending",
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt ?? inv.createdAt,
        case: inv.case,
      }));
    } catch (e: any) {
      if (e.statusCode === 404) return [];
      throw e;
    }
  },
};
