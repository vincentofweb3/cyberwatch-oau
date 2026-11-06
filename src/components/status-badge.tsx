import type { IncidentStatus, Severity, TlpLevel } from "@/lib/domain";
import { SEVERITY_LABELS, STATUS_LABELS } from "@/lib/domain";
import { cn } from "@/lib/cn";

const statusStyles: Record<IncidentStatus, string> = {
  NEW: "border-blue-200 bg-blue-50 text-blue-800",
  TRIAGED: "border-violet-200 bg-violet-50 text-violet-800",
  INVESTIGATING: "border-amber-200 bg-amber-50 text-amber-800",
  CONTAINED: "border-cyan-200 bg-cyan-50 text-cyan-800",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CLOSED: "border-slate-200 bg-slate-100 text-slate-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};
const severityStyles: Record<Severity, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  HIGH: "border-orange-200 bg-orange-50 text-orange-800",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-800",
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
        statusStyles[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
        severityStyles[severity],
      )}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

export function TlpBadge({ tlp }: { tlp: TlpLevel }) {
  const styles: Record<TlpLevel, string> = {
    CLEAR: "border-slate-300 bg-white text-slate-700",
    GREEN: "border-emerald-300 bg-emerald-50 text-emerald-800",
    AMBER: "border-amber-300 bg-amber-50 text-amber-900",
    RED: "border-rose-300 bg-rose-50 text-rose-900",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-[0.68rem] font-extrabold tracking-wide",
        styles[tlp],
      )}
    >
      TLP:{tlp}
    </span>
  );
}
