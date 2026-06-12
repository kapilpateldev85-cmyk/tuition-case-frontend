"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  BookOpen,
  DollarSign,
  Calendar,
  Users,
  Edit,
  Trash2,
  UserPlus,
  Upload,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { FileUpload } from "@/components/common/FileUpload";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { InviteTutorDialog } from "@/components/dialogs/InviteTutorDialog";
import { useCaseDetail, useDeleteCase, useRevokeInvitation, useUpdateCase } from "@/features/cases/hooks";
import { useUploadToCase, useDeleteDocument } from "@/features/documents/hooks";
import { ROUTES, CASE_STATUS_COLORS, CASE_STATUSES } from "@/constants";
import { formatDate, formatCurrency, formatRelativeTime } from "@/utils";

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: caseData, isLoading, isError, refetch } = useCaseDetail(id);
  const deleteMutation = useDeleteCase();
  const updateMutation = useUpdateCase(id);
  const revokeInvitation = useRevokeInvitation(id);
  const { upload, uploadingFiles, removeUploading } = useUploadToCase(id);
  const deleteDoc = useDeleteDocument({ caseId: id });

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError || !caseData) {
    return <ErrorState onRetry={() => refetch()} title="Could not load case" />;
  }

  const c = caseData;

  return (
    <div className="max-w-4xl">
      <Breadcrumbs items={[{ label: "Cases", href: ROUTES.PARENT_CASES }, { label: c.title }]} />

      <PageHeader
        title={c.title}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.PARENT_CASE_EDIT(id)}>
                <Edit className="h-4 w-4 mr-1.5" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInviteOpen(true)}
              id="invite-tutor-button"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Invite Tutor
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:border-red-200"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Badge className={CASE_STATUS_COLORS[c.status]} variant="outline">
          {c.status}
        </Badge>
        <span className="text-sm text-slate-400">
          Created {formatRelativeTime(c.createdAt)}
        </span>
        {/* Quick status update */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">Update status:</span>
          <select
            className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            value={c.status}
            disabled={updateMutation.isPending}
            onChange={(e) => updateMutation.mutate({ status: e.target.value as any })}
          >
            {CASE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {updateMutation.isPending && (
            <span className="h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Case Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <BookOpen className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Subject · Level</p>
                  <p className="text-sm font-medium text-slate-900">{c.subject} · {c.level}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <DollarSign className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Budget</p>
                  <p className="text-sm font-medium text-slate-900">{formatCurrency(c.budgetPerHour)}/hr</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Location</p>
                  <p className="text-sm font-medium text-slate-900">{c.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Updated</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(c.updatedAt)}</p>
                </div>
              </div>
            </div>
            {c.description && (
              <>
                <Separator className="my-4" />
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.description}</p>
              </>
            )}
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Documents</h2>
            <FileUpload
              onFilesSelected={upload}
              uploadingFiles={uploadingFiles}
              onRemoveUploading={removeUploading}
              multiple
            />
            {c.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {c.documents.map((doc) => (
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
            {c.documents.length === 0 && uploadingFiles.length === 0 && (
              <EmptyState
                icon={FileText}
                title="No documents"
                description="Upload relevant files like past papers or homework briefs."
                className="py-6"
              />
            )}
          </div>
        </div>

        {/* Sidebar — Invited Tutors */}
        <aside>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Invited Tutors</h2>
              <Badge variant="secondary">{c.invitedTutors.length}</Badge>
            </div>
            {c.invitedTutors.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No tutors invited"
                description="Invite tutors from the directory."
                className="py-4"
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setInviteOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Invite
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {c.invitedTutors.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-2">
                   { <div>
                      <p className="text-sm font-medium text-slate-900">{inv.tutor.name}</p>
                    {inv.status &&  <Badge
                        variant={
                          inv.status === "accepted"
                            ? "success"
                            : inv.status === "declined"
                            ? "destructive"
                            : "warning"
                        }
                        className="mt-1 text-xs"
                      >
                        {inv.status}
                      </Badge>}
                    </div>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-red-500 shrink-0"
                      onClick={() => revokeInvitation.mutate(inv.tutorId)}
                      aria-label={`Remove ${inv.tutor.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this case?"
        description="All data including documents and invitations will be permanently removed."
        confirmLabel="Delete Case"
        onConfirm={async () => {
          await deleteMutation.mutateAsync(id);
          router.push(ROUTES.PARENT_CASES);
        }}
        isLoading={deleteMutation.isPending}
      />

      {/* Invite tutor dialog */}
      <InviteTutorDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        caseId={id}
        alreadyInvitedIds={c.invitedTutors.map((i) => i.tutorId)}
      />
    </div>
  );
}
