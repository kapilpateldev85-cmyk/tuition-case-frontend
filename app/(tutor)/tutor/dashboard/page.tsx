"use client";

import Link from "next/link";
import {
  FolderOpen,
  UserCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";
import { StatCard } from "@/components/cards/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useMyInvitations, useMyTutorProfile, useRespondToInvitation } from "@/features/tutors/hooks";
import { useCurrentUser } from "@/features/auth/AuthProvider";
import { ROUTES } from "@/constants";
import { formatRelativeTime } from "@/utils";

export default function TutorDashboardPage() {
  const user = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useMyTutorProfile();
  const { data: invitations, isLoading: invLoading, isError: invError, refetch } = useMyInvitations();
  const respondToInvitation = useRespondToInvitation();

  const profileComplete = !!profile;
  const pendingInvitations = invitations?.filter((i) => i.status === "pending") ?? [];
  const acceptedInvitations = invitations?.filter((i) => i.status === "accepted") ?? [];

  const handleRespond = async (
    invitationId: string,
    status: "accepted" | "declined"
  ) => {
    await respondToInvitation.mutateAsync({ invitationId, status });
  };

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name.split(" ")[0]} 👋`}
        description="Your tutor dashboard — manage your cases and profile."
        actions={
          <Button asChild size="sm" variant="outline" id="edit-profile-button">
            <Link href={ROUTES.TUTOR_PROFILE_EDIT}>
              <UserCircle className="h-4 w-4 mr-1.5" />
              {profileComplete ? "Edit Profile" : "Set Up Profile"}
            </Link>
          </Button>
        }
      />

      {!profileLoading && !profileComplete && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">Complete your profile</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Parents can only find you once you have a profile set up.
            </p>
            <Button asChild size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700 text-white">
              <Link href={ROUTES.TUTOR_PROFILE_EDIT}>Set Up Now</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {invLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Invitations"
              value={invitations?.length ?? 0}
              icon={FolderOpen}
            />
            <StatCard
              title="Pending"
              value={pendingInvitations.length}
              icon={Clock}
              iconClassName="bg-amber-50"
            />
            <StatCard
              title="Accepted"
              value={acceptedInvitations.length}
              icon={CheckCircle2}
              iconClassName="bg-emerald-50"
            />
            <StatCard
              title="Profile Docs"
              value={profile?.documents.length ?? 0}
              icon={UserCircle}
              iconClassName="bg-blue-50"
            />
          </>
        )}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Pending Invitations
            {pendingInvitations.length > 0 && (
              <Badge variant="warning" className="ml-2">{pendingInvitations.length}</Badge>
            )}
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-slate-500 gap-1">
            <Link href={ROUTES.TUTOR_CASES}>
              View all cases
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {invLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : invError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : pendingInvitations.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No pending invitations"
            description="When a parent invites you to a case, it will appear here."
          />
        ) : (
          <div className="space-y-2">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {(inv as any).case?.title ?? "Case invitation"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Invited {formatRelativeTime(inv.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="warning">pending</Badge>
                  <Button
                    size="sm"
                    disabled={respondToInvitation.isPending}
                    onClick={() => handleRespond(inv.id, "accepted")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={respondToInvitation.isPending}
                    onClick={() => handleRespond(inv.id, "declined")}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Decline
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={ROUTES.TUTOR_CASE_DETAIL(inv.caseId)}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
