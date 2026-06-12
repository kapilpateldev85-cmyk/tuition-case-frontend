"use client";

import Link from "next/link";
import { Edit, GraduationCap, Briefcase, FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { FileUpload } from "@/components/common/FileUpload";
import { EmptyState } from "@/components/common/EmptyState";
import { useMyTutorProfile } from "@/features/tutors/hooks";
import { useUploadToProfile, useDeleteDocument } from "@/features/documents/hooks";
import { ROUTES } from "@/constants";
import { getInitials } from "@/utils";

export default function TutorProfilePage() {
  const { data: profile, isLoading } = useMyTutorProfile();
  const profileId = profile?.id ?? "";
  const { upload, uploadingFiles, removeUploading } = useUploadToProfile(profileId);
  const deleteDoc = useDeleteDocument({ profileId });

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="My Profile" />
        <EmptyState
          icon={GraduationCap}
          title="No profile set up yet"
          description="Create your tutor profile so parents can find and invite you to cases."
          action={
            <Button asChild id="setup-profile-button">
              <Link href={ROUTES.TUTOR_PROFILE_EDIT}>
                <Plus className="h-4 w-4 mr-1.5" />
                Set Up Profile
              </Link>
            </Button>
          }
          className="py-20"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumbs items={[{ label: "My Profile" }]} />
      <PageHeader
        title="My Profile"
        actions={
          <Button asChild variant="outline" size="sm" id="edit-profile-link">
            <Link href={ROUTES.TUTOR_PROFILE_EDIT}>
              <Edit className="h-4 w-4 mr-1.5" />
              Edit Profile
            </Link>
          </Button>
        }
      />

      {/* Header */}
      <div className="flex items-start gap-4 mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg bg-slate-900 text-white font-semibold">
            {getInitials(profile.displayName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{profile.displayName}</h2>
          <p className="text-sm text-slate-500">{(profile as any).user?.email ?? ""}</p>
          {profile.bio && (
            <p className="mt-2 text-sm text-slate-600">{profile.bio}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="qualifications">
        <TabsList>
          <TabsTrigger value="qualifications">Qualifications ({profile.qualifications?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="experience">Experience ({profile.experiences?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({profile.documents?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="qualifications" className="mt-4">
          {profile.qualifications.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No qualifications" />
          ) : (
            <ul className="space-y-3">
              {profile.qualifications.map((q, index) => (
                <li key={q.id ?? `qual-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-2.5">
                  <GraduationCap className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{q.degree}</p>
                    {(q.institution && q.institution !== "Not specified") && (
                      <p className="text-sm text-slate-500">{q.institution} · {q.year}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="experience" className="mt-4">
          {profile.experiences.length === 0 ? (
            <EmptyState icon={Briefcase} title="No experience" />
          ) : (
            <ul className="space-y-3">
              {profile.experiences.map((e, index) => (
                <li key={e.id ?? `exp-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-2.5">
                  <Briefcase className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-900">{e.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{e.yearsOfExperience} years</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <FileUpload
            onFilesSelected={upload}
            uploadingFiles={uploadingFiles}
            onRemoveUploading={removeUploading}
            multiple
          />
          {(profile.documents?.length ?? 0) > 0 && (
            <div className="mt-4 space-y-2">
              {(profile.documents ?? []).map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  canDelete={true}
                  onDelete={(docId) => deleteDoc.mutate(docId)}
                  isDeleting={deleteDoc.isPending}
                />
              ))}
            </div>
          )}
          {(profile.documents?.length ?? 0) === 0 && uploadingFiles.length === 0 && (
            <EmptyState icon={FileText} title="No documents" description="Upload certificates or credentials here." className="py-4" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
