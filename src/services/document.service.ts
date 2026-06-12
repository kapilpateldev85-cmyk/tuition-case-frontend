import type { Document } from "@/types";
import { axiosInstance } from "@/lib/axios";

/**
 * Helper to normalize backend document to frontend Document interface
 */
function mapDocument(doc: any, context: "case" | "tutor_profile"): Document {
  return {
    id: doc.id,
    filename: doc.filename ?? doc.originalName ?? "document",
    originalName: doc.filename ?? doc.originalName ?? "Document",
    mimeType: doc.mimeType ?? "application/octet-stream",
    size: doc.size ?? 0,
    url: "",
    context,
    caseId: doc.caseId,
    tutorProfileId: doc.tutorId ?? doc.tutorProfileId,
    uploadedById: doc.uploadedById ?? doc.userId ?? "",
    uploadedBy: doc.uploadedBy
      ? {
          id: doc.uploadedBy.id ?? "",
          name: doc.uploadedBy.name ?? doc.uploadedBy.email ?? "Unknown User",
        }
      : { id: "", name: "Unknown User" },
    createdAt: doc.uploadedAt ?? doc.createdAt ?? new Date().toISOString(),
    updatedAt: doc.updatedAt ?? doc.uploadedAt ?? doc.createdAt ?? new Date().toISOString(),
  };
}

export const documentService = {
  /**
   * List all documents for a specific case.
   */
  async listForCase(caseId: string): Promise<Document[]> {
    const response = await axiosInstance.get(`/documents/cases/${caseId}`);
    return (response.data?.documents || []).map((d: any) => mapDocument(d, "case"));
  },

  /**
   * List all documents for a tutor profile.
   */
  async listForProfile(profileId: string): Promise<Document[]> {
    try {
      const response = await axiosInstance.get(`/tutors/${profileId}`);
      return (response.data?.documents || []).map((d: any) => mapDocument(d, "tutor_profile"));
    } catch (e: any) {
      if (e.statusCode === 404) return [];
      throw e;
    }
  },

  /**
   * Upload a document to a case.
   */
  async uploadToCase(
    caseId: string,
    file: File,
    uploaderId: string,
    uploaderName: string,
    onProgress?: (percent: number) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `/documents/cases/${caseId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return mapDocument(response.data?.document, "case");
  },

  /**
   * Upload a document to a tutor profile.
   */
  async uploadToProfile(
    profileId: string,
    file: File,
    uploaderId: string,
    uploaderName: string,
    onProgress?: (percent: number) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/documents/tutors/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return mapDocument(response.data?.document, "tutor_profile");
  },

  /**
   * Delete a document by ID.
   */
  async delete(docId: string, requesterId: string): Promise<void> {
    await axiosInstance.delete(`/documents/${docId}`);
  },

  /**
   * Get a download URL for a document by creating a Blob URL.
   */
  async getDownloadUrl(docId: string, requesterId: string): Promise<string> {
    const response = await axiosInstance.get(`/documents/${docId}/download`, {
      responseType: "blob",
    });
    
    // axios interceptor might unwrap response.data if it parses as JSON with {success:true}
    const blob = new Blob([response.data], { type: response.headers["content-type"] as string });
    return URL.createObjectURL(blob);
  },
};
