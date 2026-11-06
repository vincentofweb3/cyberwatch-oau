import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SeverityBadge, StatusBadge } from "@/components/status-badge";
import { INCIDENT_CATEGORY_LABELS } from "@/lib/domain";
import { formatDate, formatRelativeTime } from "@/lib/format";
import type { listIncidents } from "@/lib/dal/incidents";

type IncidentListItem = Awaited<ReturnType<typeof listIncidents>>[number];

export function IncidentTable({
  incidents,
  compact = false,
}: {
  incidents: IncidentListItem[];
  compact?: boolean;
}) {
  if (!incidents.length) {
    return (
      <EmptyState
        icon={Inbox}
        title="No incidents found"
        description="No incidents match the current filters. Adjust the queue filters or wait for a new report."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 text-[0.7rem] font-extrabold tracking-[0.08em] text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3">Incident</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.map((incident) => (
              <tr key={incident.id} className="transition hover:bg-blue-50/35">
                <td className="px-5 py-4">
                  <Link href={`/dashboard/incidents/${incident.id}`} className="block">
                    <span className="font-mono text-[0.68rem] font-bold tracking-wide text-slate-500">
                      {incident.referenceCode}
                    </span>
                    <span className="mt-1 block max-w-md truncate text-sm font-extrabold text-[#0a1d58]">
                      {incident.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {INCIDENT_CATEGORY_LABELS[incident.category]}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={incident.status} />
                </td>
                <td className="px-4 py-4">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {incident.assigneeName ?? (
                    <span className="font-semibold text-amber-700">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="block text-sm font-semibold text-slate-700">
                    {formatRelativeTime(incident.createdAt)}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {formatDate(incident.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/dashboard/incidents/${incident.id}`}
                    className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-[#1739a8]"
                    aria-label={`Open ${incident.referenceCode}`}
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {incidents.map((incident) => (
          <Link
            key={incident.id}
            href={`/dashboard/incidents/${incident.id}`}
            className="block p-4 transition hover:bg-blue-50/35"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[0.68rem] font-bold text-slate-500">
                  {incident.referenceCode}
                </p>
                <h3 className="mt-1 truncate text-sm font-extrabold text-[#0a1d58]">
                  {incident.title}
                </h3>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-slate-400" aria-hidden="true" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={incident.status} />
              <SeverityBadge severity={incident.severity} />
            </div>
            {!compact && (
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{incident.assigneeName ?? "Unassigned"}</span>
                <span>{formatRelativeTime(incident.createdAt)}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
