import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { documentService } from "@/services/document.service";
import { useAuth } from "@/features/auth/AuthProvider";
import { QUERY_KEYS } from "@/constants";

interface UploadProgress {
  file: File;
  progress: number;
  error?: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useDocumentsForCase(caseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.cases.documents(caseId),
    queryFn: () => documentService.listForCase(caseId),
    enabled: !!caseId,
  });
}

export function useDocumentsForProfile(profileId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tutors.documents(profileId),
    queryFn: () => documentService.listForProfile(profileId),
    enabled: !!profileId,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * useUploadToCase — manages uploading one or more files to a case,
 * with per-file progress tracking.
 */
export function useUploadToCase(caseId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [uploadingFiles, setUploadingFiles] = useState<UploadProgress[]>([]);

  const upload = async (files: File[]) => {
    if (!user) return;
    const newEntries: UploadProgress[] = files.map((f) => ({ file: f, progress: 0 }));
    setUploadingFiles((prev) => [...prev, ...newEntries]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const startIndex = uploadingFiles.length + i;
      try {
        await documentService.uploadToCase(caseId, file, user.id, user.name ?? user.email, (p) => {
          setUploadingFiles((prev) => {
            const updated = [...prev];
            updated[startIndex] = { ...updated[startIndex], progress: p };
            return updated;
          });
        });
        toast.success(`${file.name} uploaded`);
        qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.documents(caseId) });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.detail(caseId) });
      } catch (err: unknown) {
        const msg = (err as { message?: string }).message ?? "Upload failed";
        setUploadingFiles((prev) => {
          const updated = [...prev];
          updated[startIndex] = { ...updated[startIndex], error: msg };
          return updated;
        });
        toast.error(`Failed to upload ${file.name}: ${msg}`);
      }
    }
  };

  const removeUploading = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return { upload, uploadingFiles, removeUploading };
}

/**
 * useUploadToProfile — upload to a tutor profile.
 */
export function useUploadToProfile(profileId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [uploadingFiles, setUploadingFiles] = useState<UploadProgress[]>([]);

  const upload = async (files: File[]) => {
    if (!user) return;
    const newEntries: UploadProgress[] = files.map((f) => ({ file: f, progress: 0 }));
    setUploadingFiles((prev) => [...prev, ...newEntries]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const startIndex = uploadingFiles.length + i;
      try {
        await documentService.uploadToProfile(profileId, file, user.id, user.name ?? user.email, (p) => {
          setUploadingFiles((prev) => {
            const updated = [...prev];
            updated[startIndex] = { ...updated[startIndex], progress: p };
            return updated;
          });
        });
        toast.success(`${file.name} uploaded`);
        qc.invalidateQueries({ queryKey: QUERY_KEYS.tutors.documents(profileId) });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.tutors.myProfile });
      } catch (err: unknown) {
        const msg = (err as { message?: string }).message ?? "Upload failed";
        setUploadingFiles((prev) => {
          const updated = [...prev];
          updated[startIndex] = { ...updated[startIndex], error: msg };
          return updated;
        });
        toast.error(`Failed to upload ${file.name}: ${msg}`);
      }
    }
  };

  const removeUploading = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return { upload, uploadingFiles, removeUploading };
}

/**
 * useDeleteDocument — delete a document with optimistic cache invalidation.
 */
export function useDeleteDocument(context: { caseId?: string; profileId?: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (docId: string) => documentService.delete(docId, user?.id ?? ""),
    onSuccess: () => {
      if (context.caseId) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.documents(context.caseId) });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.detail(context.caseId) });
      }
      if (context.profileId) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.tutors.documents(context.profileId) });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.tutors.myProfile });
      }
      toast.success("Document deleted");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message ?? "Failed to delete document");
    },
  });
}

