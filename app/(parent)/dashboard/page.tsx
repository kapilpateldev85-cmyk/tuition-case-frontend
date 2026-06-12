"use client";

import Link from "next/link";
import {
  FolderOpen,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Users,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/cards/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useCases } from "@/features/cases/hooks";
import { useCurrentUser } from "@/features/auth/AuthProvider";
import { ROUTES, CASE_STATUS_COLORS } from "@/constants";
import { formatDate, formatCurrency } from "@/utils";
import type { Metadata } from "next";

export default function ParentDashboardPage() {
  const user = useCurrentUser();
  const { data, isLoading, isError, refetch } = useCases({ pageSize: 5, sortBy: "createdAt", sortOrder: "desc" });

  const cases = data?.data ?? [];
  const total = data?.total ?? 0;

  const stats = {
    total,
    open: cases.filter((c) => c.status === "open").length,
    matched: cases.filter((c) => c.status === "matched").length,
    closed: cases.filter((c) => c.status === "closed").length,
  };

  return (
    <div>
      <PageHeader
        title={`Good morning, ${user.name.split(" ")[0]} 👋`}
        description="Here's an overview of your tuition cases."
        actions={
          <Button asChild size="sm" id="create-case-button">
            <Link href={ROUTES.PARENT_CASES_NEW}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Case
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Cases"
              value={data?.total ?? 0}
              icon={FolderOpen}
              description="All cases you've created"
            />
            <StatCard
              title="Open"
              value={data?.data?.filter(c => c.status === "open").length ?? 0}
              icon={Clock}
              iconClassName="bg-emerald-50"
              description="Accepting applications"
            />
            <StatCard
              title="Matched"
              value={data?.data?.filter(c => c.status === "matched").length ?? 0}
              icon={CheckCircle2}
              iconClassName="bg-blue-50"
              description="Tutor found"
            />
            <StatCard
              title="Closed"
              value={data?.data?.filter(c => c.status === "closed").length ?? 0}
              icon={XCircle}
              iconClassName="bg-slate-50"
              description="Completed or cancelled"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.PARENT_CASES_NEW}>
            <Plus className="h-4 w-4 mr-1.5" />
            Post a Case
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.PARENT_TUTORS}>
            <Users className="h-4 w-4 mr-1.5" />
            Browse Tutors
          </Link>
        </Button>
      </div>

      {/* Recent Cases */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent Cases</h2>
          <Button asChild variant="ghost" size="sm" className="text-slate-500 gap-1">
            <Link href={ROUTES.PARENT_CASES}>
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : cases.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No cases yet"
            description="Create your first tuition case to find a tutor."
            action={
              <Button asChild size="sm">
                <Link href={ROUTES.PARENT_CASES_NEW}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Post a Case
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {cases.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={ROUTES.PARENT_CASE_DETAIL(c.id)}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-slate-700">
                    {c.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.subject} · {c.level} · {formatCurrency(c.budgetPerHour)}/hr · {c.location}
                  </p>
                </div>
                <Badge className={CASE_STATUS_COLORS[c.status]} variant="outline">
                  {c.status}
                </Badge>
                <span className="text-xs text-slate-400 shrink-0">{formatDate(c.createdAt)}</span>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
