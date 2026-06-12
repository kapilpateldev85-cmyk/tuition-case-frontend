import { type LucideIcon } from "lucide-react";
import { cn } from "@/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; label: string };
  className?: string;
  iconClassName?: string;
}

/**
 * StatCard — used on dashboards to display key metrics.
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={cn("h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center", iconClassName)}>
          <Icon className="h-4 w-4 text-slate-600" aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}
