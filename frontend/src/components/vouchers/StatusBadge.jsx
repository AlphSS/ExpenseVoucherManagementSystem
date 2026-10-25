import { Clock, CheckCircle2, XCircle, FileEdit } from "lucide-react";

const statusConfig = {
  DRAFT: {
    label: "Draft",
    icon: FileEdit,
    bg: "bg-slate-100 text-slate-700 border-slate-200/80",
    dot: "bg-slate-400",
  },
  PENDING_APPROVAL: {
    label: "Pending Review",
    icon: Clock,
    bg: "bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs",
    dot: "bg-amber-500 animate-pulse",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-2xs",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    bg: "bg-rose-50 text-rose-800 border-rose-200/80 shadow-2xs",
    dot: "bg-rose-500",
  },
};

export default function StatusBadge({ status, size = "md" }) {
  const config = statusConfig[status] ?? {
    label: status || "Unknown",
    icon: Clock,
    bg: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };

  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] gap-1.5"
      : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <Icon size={size === "sm" ? 11 : 13} />
      <span>{config.label}</span>
    </span>
  );
}
