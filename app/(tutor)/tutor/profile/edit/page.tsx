"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Trash2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TutorProfileForm } from "@/components/forms/TutorProfileForm";
import {
  useMyTutorProfile,
  useCreateTutorProfile,
  useUpdateTutorProfile,
} from "@/features/tutors/hooks";
import { documentService } from "@/services/document.service";
import { useCurrentUser } from "@/features/auth/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES, QUERY_KEYS } from "@/constants";
import { formatFileSize } from "@/utils";
import type { TutorProfileFormValues } from "@/schemas";
import { toast } from "sonner";

export default function EditTutorProfilePage() {
  const router = useRouter();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useMyTutorProfile();
  const createMutation = useCreateTutorProfile();
  const updateMutation = useUpdateTutorProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onSubmit = async (values: TutorProfileFormValues) => {
    if (profile) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
    router.push(ROUTES.TUTOR_PROFILE);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      setUploadProgress(0);
      await documentService.uploadToProfile(
        profile.id,
        file,
        user.id,
        user.name,
        (pct) => setUploadProgress(pct)
      );
      toast.success("Document uploaded successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tutors.myProfile });
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (docId: string) => {
    setDeletingId(docId);
    try {
      await documentService.delete(docId, user.id);
      toast.success("Document removed");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tutors.myProfile });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const documents = (profile as any)?.documents ?? [];

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "My Profile", href: ROUTES.TUTOR_PROFILE },
          { label: profile ? "Edit Profile" : "Set Up Profile" },
        ]}
      />
      <PageHeader
        title={profile ? "Edit Profile" : "Set Up Your Profile"}
        description={
          profile
            ? "Update your qualifications and experience."
            : "Complete your profile to be visible in the tutor directory."
        }
      />
      <Card>
        <CardContent className="pt-6">
          <TutorProfileForm
            defaultValues={
              profile
                ? {
                    displayName: profile.displayName,
                    bio: profile.bio,
                    qualifications: profile.qualifications,
                    experiences: profile.experiences,
                  }
                : undefined
            }
            onSubmit={onSubmit}
            isLoading={isSubmitting}
            submitLabel={profile ? "Save Changes" : "Create Profile"}
          />
        </CardContent>
      </Card>

      {/* Document Upload Section — only when profile exists */}
      {profile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              Profile Documents
            </CardTitle>
            <p className="text-sm text-slate-500">
              Upload certificates or credentials that parents can view on your profile.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing documents */}
            {documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                No documents uploaded yet
              </div>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc: any) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {doc.filename || doc.originalName || "Document"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {doc.size ? formatFileSize(doc.size) : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      disabled={deletingId === doc.id}
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-slate-900 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={uploadProgress !== null}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={uploadProgress !== null}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
            <p className="text-xs text-slate-400 text-center">
              Accepted: PDF, Word, JPG, PNG · Max 10MB
            </p>
          </CardContent>
        </Card>
      )}

      {!profile && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">
            Create your profile first, then you can upload documents.
          </p>
        </div>
      )}
    </div>
  );
}


