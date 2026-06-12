import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState — displayed when a list or content area has no items.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
      role="status"
      aria-label={title}
    >
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-xs mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
