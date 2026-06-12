"use client";

import { useParams } from "next/navigation";
import { GraduationCap, Briefcase, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useTutorProfile } from "@/features/tutors/hooks";
import { ROUTES } from "@/constants";
import { getInitials } from "@/utils";

export default function TutorPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading, isError, refetch } = useTutorProfile(id);

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

  if (isError || !profile) {
    return <ErrorState onRetry={() => refetch()} title="Tutor profile not found" />;
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Tutors", href: ROUTES.PARENT_TUTORS },
          { label: profile.displayName },
        ]}
      />

      {/* Profile header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-xl bg-slate-900 text-white font-semibold">
            {getInitials(profile.displayName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{profile.displayName}</h1>
          <p className="text-sm text-slate-500">{profile.user.email}</p>
          {profile.bio && (
            <p className="mt-2 text-sm text-slate-700 max-w-lg">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="qualifications">
        <TabsList>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="qualifications" className="mt-4">
          {profile.qualifications.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No qualifications listed" />
          ) : (
            <ul className="space-y-3">
              {profile.qualifications.map((q) => (
                <li key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-2.5">
                    <GraduationCap className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{q.degree}</p>
                      <p className="text-sm text-slate-500">
                        {q.institution} · {q.year}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="experience" className="mt-4">
          {profile.experiences.length === 0 ? (
            <EmptyState icon={Briefcase} title="No experience listed" />
          ) : (
            <ul className="space-y-3">
              {profile.experiences.map((e) => (
                <li key={e.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-2.5">
                    <Briefcase className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-900">{e.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {e.yearsOfExperience} year{e.yearsOfExperience !== 1 ? "s" : ""} of experience
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          {profile.documents.length === 0 ? (
            <EmptyState icon={FileText} title="No documents uploaded" />
          ) : (
            <div className="space-y-2">
              {profile.documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} canDelete={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
