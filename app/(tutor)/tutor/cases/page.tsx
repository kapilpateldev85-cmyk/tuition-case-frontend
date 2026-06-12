"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBox } from "@/components/common/SearchBox";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { useCases } from "@/features/cases/hooks";
import { usePagination } from "@/hooks/usePagination";
import { ROUTES, CASE_STATUS_COLORS } from "@/constants";
import { formatDate, formatCurrency } from "@/utils";

export default function TutorCasesPage() {
  const [search, setSearch] = useState("");
  const { page, goToPage, reset } = usePagination({ pageSize: 10 });

  const { data, isLoading, isError, refetch } = useCases({ search, page, pageSize: 10 });
  const cases = data?.data ?? [];

  return (
    <div>
      <Breadcrumbs items={[{ label: "My Cases" }]} />
      <PageHeader
        title="My Cases"
        description="Cases you have been invited to."
      />

      <div className="mb-4">
        <SearchBox
          value={search}
          onChange={(v) => { setSearch(v); reset(); }}
          placeholder="Search cases..."
          className="w-full sm:w-64"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : cases.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={search ? "No cases match your search" : "No cases yet"}
          description={search ? "Try a different search term." : "You will see cases here once a parent invites you."}
        />
      ) : (
        <div className="space-y-2">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={ROUTES.TUTOR_CASE_DETAIL(c.id)}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{c.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {c.subject} · {c.level} · {formatCurrency(c.budgetPerHour)}/hr · {c.location}
                </p>
              </div>
              <Badge className={CASE_STATUS_COLORS[c.status]} variant="outline">
                {c.status}
              </Badge>
              <span className="text-xs text-slate-400 shrink-0 hidden sm:inline">
                {formatDate(c.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={goToPage} />
        </div>
      )}
    </div>
  );
}
