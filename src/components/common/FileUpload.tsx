"use client";

import { useRef, type ChangeEvent } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/utils";
import { FILE_CONSTRAINTS } from "@/constants";

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  uploadingFiles?: UploadingFile[];
  onRemoveUploading?: (index: number) => void;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}

/**
 * FileUpload — drag-and-drop file upload component.
 * Validates file type and size client-side before calling onFilesSelected.
 */
export function FileUpload({
  onFilesSelected,
  uploadingFiles = [],
  onRemoveUploading,
  disabled = false,
  multiple = false,
  className,
}: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled,
    multiple,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: FILE_CONSTRAINTS.MAX_SIZE_BYTES,
    onDropAccepted: onFilesSelected,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        const errors = rejection.errors.map((e) => e.message).join(", ");
        console.warn("File rejected:", rejection.file.name, errors);
      });
    },
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-slate-400 bg-slate-50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
        id="file-drop-zone"
        aria-label="File upload drop zone"
      >
        <input {...getInputProps()} aria-label="File input" />
        <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-3" aria-hidden="true" />
        {isDragActive ? (
          <p className="text-sm text-slate-600 font-medium">Drop the file here</p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {FILE_CONSTRAINTS.ALLOWED_LABEL} — max {FILE_CONSTRAINTS.MAX_SIZE_LABEL}
            </p>
          </>
        )}
      </div>

      {/* In-progress uploads */}
      {uploadingFiles.length > 0 && (
        <ul className="space-y-2" aria-label="Uploading files">
          {uploadingFiles.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <File className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {item.file.name}
                </p>
                <p className="text-xs text-slate-500">{formatFileSize(item.file.size)}</p>
                {item.error ? (
                  <p className="text-xs text-red-500 mt-1">{item.error}</p>
                ) : item.progress < 100 ? (
                  <Progress value={item.progress} className="mt-2 h-1" aria-label={`Upload progress: ${item.progress}%`} />
                ) : (
                  <p className="text-xs text-emerald-600 mt-1">Upload complete</p>
                )}
              </div>
              {onRemoveUploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => onRemoveUploading(i)}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
