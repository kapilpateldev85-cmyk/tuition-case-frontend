"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  LayoutList,
  LayoutGrid,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBox } from "@/components/common/SearchBox";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { useCases, useDeleteCase } from "@/features/cases/hooks";
import { usePagination } from "@/hooks/usePagination";
import { ROUTES, CASE_SUBJECTS, CASE_LEVELS, CASE_STATUS_COLORS } from "@/constants";
import { formatDate, formatCurrency } from "@/utils";
import type { CaseStatus, CaseSubject, CaseLevel } from "@/types";

export default function ParentCasesPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<CaseSubject | "">("");
  const [level, setLevel] = useState<CaseLevel | "">("");
  const [status, setStatus] = useState<CaseStatus | "">("");
  const [view, setView] = useState<"table" | "card">("table");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { page, goToPage, reset } = usePagination({ pageSize: 10 });

  const { data, isLoading, isError, refetch } = useCases({
    search,
    subject: subject || undefined,
    level: level || undefined,
    status: status || undefined,
    page,
    pageSize: 10,
  });

  const deleteMutation = useDeleteCase();

  const handleFilterChange = (fn: () => void) => {
    reset();
    fn();
  };

  const cases = data?.data ?? [];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Cases" }]} />
      <PageHeader
        title="My Cases"
        description={`${data?.total ?? 0} cases total`}
        actions={
          <Button asChild size="sm" id="new-case-button">
            <Link href={ROUTES.PARENT_CASES_NEW}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Case
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchBox
          value={search}
          onChange={(v) => handleFilterChange(() => setSearch(v))}
          placeholder="Search cases..."
          className="w-full sm:w-60"
        />
        <Select value={subject || "all"} onValueChange={(v) => handleFilterChange(() => setSubject(v === "all" ? "" : v as CaseSubject))}>
          <SelectTrigger className="w-32 h-9" id="filter-subject">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {CASE_SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={level || "all"} onValueChange={(v) => handleFilterChange(() => setLevel(v === "all" ? "" : v as CaseLevel))}>
          <SelectTrigger className="w-28 h-9" id="filter-level">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {CASE_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status || "all"} onValueChange={(v) => handleFilterChange(() => setStatus(v === "all" ? "" : v as CaseStatus))}>
          <SelectTrigger className="w-28 h-9" id="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setView("table")}
            aria-label="Table view"
            id="view-table"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "card" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setView("card")}
            aria-label="Card view"
            id="view-card"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : cases.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No cases found"
          description={search || subject || level || status ? "Try adjusting your filters." : "Create your first case to find a tutor."}
          action={
            !search && !subject && !level && !status ? (
              <Button asChild size="sm">
                <Link href={ROUTES.PARENT_CASES_NEW}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Post a Case
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : view === "table" ? (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm" aria-label="Cases table">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Case</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 hidden md:table-cell">Subject / Level</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 hidden lg:table-cell">Budget</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 hidden sm:table-cell">Date</th>
                <th className="py-3 px-4 w-20" />
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={ROUTES.PARENT_CASE_DETAIL(c.id)}
                      className="font-medium text-slate-900 hover:text-slate-700 transition-colors line-clamp-1"
                    >
                      {c.title}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5 md:hidden">{c.subject} · {c.level}</p>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-slate-600">
                    {c.subject} · {c.level}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-slate-600">
                    {formatCurrency(c.budgetPerHour)}/hr
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={CASE_STATUS_COLORS[c.status]} variant="outline">
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500 hidden sm:table-cell whitespace-nowrap">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <Link href={ROUTES.PARENT_CASE_EDIT(c.id)}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-red-500"
                        onClick={() => setDeleteId(c.id)}
                        aria-label={`Delete ${c.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={ROUTES.PARENT_CASE_DETAIL(c.id)}
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-slate-900 line-clamp-2">{c.title}</p>
                <Badge className={CASE_STATUS_COLORS[c.status]} variant="outline">
                  {c.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">{c.subject} · {c.level}</p>
              <p className="text-xs text-slate-500">{c.location}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(c.budgetPerHour)}/hr
                </span>
                <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title="Delete case?"
        description="This will permanently delete the case and all associated documents. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleteId) {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
