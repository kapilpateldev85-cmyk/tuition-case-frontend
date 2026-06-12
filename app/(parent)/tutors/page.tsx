"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBox } from "@/components/common/SearchBox";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { useTutors } from "@/features/tutors/hooks";
import { usePagination } from "@/hooks/usePagination";
import { ROUTES } from "@/constants";
import { getInitials, truncate } from "@/utils";

export default function TutorDirectoryPage() {
  const [search, setSearch] = useState("");
  const { page, goToPage, reset } = usePagination({ pageSize: 9 });

  const { data, isLoading, isError, refetch } = useTutors({ search, page, pageSize: 9 });
  const tutors = data?.data ?? [];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Tutors" }]} />
      <PageHeader
        title="Tutor Directory"
        description={`${data?.total ?? 0} tutors available`}
      />

      <div className="mb-6">
        <SearchBox
          value={search}
          onChange={(v) => { setSearch(v); reset(); }}
          placeholder="Search by name, qualification..."
          className="w-full sm:w-72"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : tutors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tutors found"
          description={search ? "Try a different search term." : "No tutor profiles available yet."}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutors.map((profile) => (
              <div
                key={profile.id}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-slate-900 text-white font-medium">
                      {getInitials(profile.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{profile.displayName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {profile.experiences[0]
                        ? `${profile.experiences[0].yearsOfExperience} yrs experience`
                        : "New tutor"}
                    </p>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {profile.bio}
                  </p>
                )}

                {profile.qualifications.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-500 truncate">
                      {profile.qualifications[0].degree}, {profile.qualifications[0].institution}
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-slate-100">
                  <Button asChild variant="outline" size="sm" className="w-full" id={`view-tutor-${profile.id}`}>
                    <Link href={ROUTES.PARENT_TUTOR_PROFILE(profile.id)}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
