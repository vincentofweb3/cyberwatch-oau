import type { Metadata } from "next";
import Link from "next/link";
import { Filter, Search, X } from "lucide-react";
import { IncidentTable } from "@/components/incident-table";
import {
  INCIDENT_CATEGORIES,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_STATUSES,
  SEVERITY_LEVELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  type IncidentCategory,
  type IncidentStatus,
  type Severity,
} from "@/lib/domain";
import { listIncidents } from "@/lib/dal/incidents";

export const metadata: Metadata = {
  title: "Incident queue",
  robots: { index: false, follow: false },
};

type QueueSearchParams = {
  query?: string | string[];
  status?: string | string[];
  severity?: string | string[];
  category?: string | string[];
  unassigned?: string | string[];
};

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  const raw = await searchParams;
  const query = single(raw.query)?.slice(0, 120);
  const statusValue = single(raw.status);
  const severityValue = single(raw.severity);
  const categoryValue = single(raw.category);
  const status = INCIDENT_STATUSES.find((item) => item === statusValue) as
    IncidentStatus | undefined;
  const severity = SEVERITY_LEVELS.find((item) => item === severityValue) as Severity | undefined;
  const category = INCIDENT_CATEGORIES.find((item) => item === categoryValue) as
    IncidentCategory | undefined;
  const unassigned = single(raw.unassigned) === "true";
  const incidents = await listIncidents({ query, status, severity, category, unassigned });
  const hasFilters = Boolean(query || status || severity || category || unassigned);

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-xs font-extrabold tracking-[0.12em] text-[#1739a8] uppercase">
          Incident management
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-[#0a1d58]">
          Incident queue
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Search, filter, and open reports without exposing tracking credentials.
        </p>
      </div>

      <form
        className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        action="/dashboard/incidents"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(4,minmax(130px,0.4fr))_auto]">
          <label className="relative">
            <span className="sr-only">Search incidents</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              name="query"
              defaultValue={query}
              className="form-control pl-9"
              placeholder="Reference, title, or sender"
            />
          </label>
          <label>
            <span className="sr-only">Status</span>
            <select name="status" defaultValue={status ?? ""} className="form-control">
              <option value="">All statuses</option>
              {INCIDENT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Severity</span>
            <select name="severity" defaultValue={severity ?? ""} className="form-control">
              <option value="">All severities</option>
              {SEVERITY_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {SEVERITY_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Category</span>
            <select name="category" defaultValue={category ?? ""} className="form-control">
              <option value="">All categories</option>
              {INCIDENT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {INCIDENT_CATEGORY_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              name="unassigned"
              value="true"
              defaultChecked={unassigned}
              className="size-4 accent-[#1739a8]"
            />
            Unassigned
          </label>
          <button className="button-primary px-4">
            <Filter className="size-4" aria-hidden="true" />
            <span className="lg:sr-only">Apply filters</span>
          </button>
        </div>
        {hasFilters && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">
              {incidents.length} matching incident{incidents.length === 1 ? "" : "s"}
            </p>
            <Link
              href="/dashboard/incidents"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#1739a8]"
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear filters
            </Link>
          </div>
        )}
      </form>

      <section className="mt-5">
        <IncidentTable incidents={incidents} />
      </section>
    </div>
  );
}

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0];
}
