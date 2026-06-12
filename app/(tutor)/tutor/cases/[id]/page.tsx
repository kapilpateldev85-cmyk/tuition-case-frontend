"use client";

import { useParams } from "next/navigation";
import { MapPin, BookOpen, DollarSign, Calendar, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { FileUpload } from "@/components/common/FileUpload";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useCaseDetail } from "@/features/cases/hooks";
import { useUploadToCase, useDeleteDocument } from "@/features/documents/hooks";
import { useAuth } from "@/features/auth/AuthProvider";
import { ROUTES, CASE_STATUS_COLORS } from "@/constants";
import { formatDate, formatCurrency, formatRelativeTime } from "@/utils";

export default function TutorCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: caseData, isLoading, isError, refetch } = useCaseDetail(id);
  const { upload, uploadingFiles, removeUploading } = useUploadToCase(id);
  const deleteDoc = useDeleteDocument({ caseId: id });

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError || !caseData) {
    return <ErrorState onRetry={() => refetch()} title="Case not found or access denied" />;
  }

  const c = caseData;

  return (
    <div className="max-w-3xl">
      <Breadcrumbs items={[{ label: "My Cases", href: ROUTES.TUTOR_CASES }, { label: c.title }]} />
      <PageHeader title={c.title} />

      <div className="flex items-center gap-3 mb-6">
        <Badge className={CASE_STATUS_COLORS[c.status]} variant="outline">{c.status}</Badge>
        <span className="text-sm text-slate-400">Created {formatRelativeTime(c.createdAt)}</span>
      </div>

      {/* Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
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
              <p className="text-xs text-slate-500 mb-0.5">Posted by</p>
              <p className="text-sm font-medium text-slate-900">{(c as any).owner?.name ?? (c as any).owner?.email ?? "Parent"}</p>
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
        <p className="text-xs text-slate-500 mb-3">
          You can upload sample worksheets or relevant materials for this case.
        </p>
        <FileUpload
          onFilesSelected={upload}
          uploadingFiles={uploadingFiles}
          onRemoveUploading={removeUploading}
          multiple
        />
        {(c.documents?.length ?? 0) > 0 && (
          <div className="mt-4 space-y-2">
            {(c.documents ?? []).map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                canDelete={(doc as any).uploadedById === user?.id}
                onDelete={(docId) => deleteDoc.mutate(docId)}
                isDeleting={deleteDoc.isPending}
              />
            ))}
          </div>
        )}
        {(c.documents?.length ?? 0) === 0 && uploadingFiles.length === 0 && (
          <EmptyState icon={FileText} title="No documents yet" className="py-4" />
        )}
      </div>
    </div>
  );
}

