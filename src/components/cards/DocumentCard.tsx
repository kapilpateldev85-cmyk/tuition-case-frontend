"use client";

import { useState } from "react";
import { FileText, Image, Download, Trash2, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { cn, formatFileSize, formatDate, isImageFile, isPdfFile } from "@/utils";
import type { Document } from "@/types";

interface DocumentCardProps {
  document: Document;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

/**
 * DocumentCard — displays a single document with download and delete actions.
 */
export function DocumentCard({
  document: doc,
  canDelete = false,
  onDelete,
  isDeleting = false,
}: DocumentCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const FileIcon = isImageFile(doc.mimeType)
    ? Image
    : isPdfFile(doc.mimeType)
    ? FileText
    : File;

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      // In real app: fetch presigned URL then trigger download
      // Since we don't have presigned URLs from backend, we fetch the blob via axios
      const { documentService } = await import("@/services/document.service");
      const url = await documentService.getDownloadUrl(doc.id, "current-user");
      const link = window.document.createElement("a");
      link.href = url;
      link.download = doc.originalName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors group">
        <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <FileIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{doc.originalName}</p>
          <p className="text-xs text-slate-500">
            {formatFileSize(doc.size)} · {formatDate(doc.createdAt)}{doc.uploadedBy?.name ? ` · ${doc.uploadedBy.name}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", isDownloading && "opacity-50 cursor-not-allowed")}
            disabled={isDownloading}
            onClick={handleDownload}
            aria-label={`Download ${doc.originalName}`}
          >
            {isDownloading ? (
              <span className="h-3.5 w-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 text-slate-500" />
            )}
          </Button>
          {canDelete && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-red-600"
              onClick={() => setConfirmOpen(true)}
              aria-label={`Delete ${doc.originalName}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete document?"
        description={`"${doc.originalName}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          onDelete?.(doc.id);
          setConfirmOpen(false);
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
