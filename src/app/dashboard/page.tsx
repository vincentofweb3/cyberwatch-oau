import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Inbox,
  ShieldAlert,
  UserRoundX,
} from "lucide-react";
import { IncidentTable } from "@/components/incident-table";
import { getDashboardOverview } from "@/lib/dal/incidents";
import { requireResponder } from "@/lib/dal/session";

export const metadata: Metadata = {
  title: "Responder overview",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const [responder, overview] = await Promise.all([requireResponder(), getDashboardOverview()]);
  const { totals } = overview;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.12em] text-[#1739a8] uppercase">
            Operations overview
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-[#0a1d58]">
            Welcome back, {responder.fullName.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Prioritise critical, new, and unassigned incidents first.
          </p>
        </div>
        <Link href="/dashboard/incidents" className="button-secondary">
          Open full queue <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Incident summary"
      >
        <Metric
          icon={Inbox}
          label="New reports"
          value={totals.newCount}
          tone="blue"
          href="/dashboard/incidents?status=NEW"
        />
        <Metric
          icon={Activity}
          label="Active response"
          value={totals.activeCount}
          tone="violet"
          href="/dashboard/incidents"
        />
        <Metric
          icon={AlertTriangle}
          label="Critical open"
          value={totals.criticalCount}
          tone="rose"
          href="/dashboard/incidents?severity=CRITICAL"
        />
        <Metric
          icon={UserRoundX}
          label="Unassigned"
          value={totals.unassignedCount}
          tone="amber"
          href="/dashboard/incidents?unassigned=true"
        />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#0a1d58]">Priority queue</h2>
            <p className="mt-1 text-xs text-slate-500">Highest severity and most recent reports.</p>
          </div>
          <div className="hidden items-center gap-2 text-xs font-semibold text-emerald-700 sm:flex">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {totals.resolvedCount} resolved or closed
          </div>
        </div>
        <IncidentTable incidents={overview.recent} compact />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Link
          href="/dashboard/incidents?status=NEW"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#1739a8]">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-extrabold text-[#0a1d58]">Triage new reports</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Validate the report, set severity, assign ownership, and provide a clear reporter
            update.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#1739a8]">
            Open new reports{" "}
            <ArrowRight
              className="size-4 transition group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </Link>
        <Link
          href="/dashboard/alerts"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-extrabold text-[#0a1d58]">Publish community guidance</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Turn verified patterns into concise, shareable advisories with an appropriate TLP label.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#1739a8]">
            Manage alerts{" "}
            <ArrowRight
              className="size-4 transition group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </Link>
      </section>

      <section
        className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6"
        aria-labelledby="analyst-guide-title"
      >
        <p className="text-xs font-extrabold tracking-[0.12em] text-[#1739a8] uppercase">
          Analyst quick guide
        </p>
        <h2 id="analyst-guide-title" className="mt-2 text-lg font-extrabold text-[#0a1d58]">
          How to work a report
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          This is your response workspace. Use Overview to decide what needs attention, Incidents to
          handle individual reports, and Alerts to share verified community guidance. Updates are
          recorded in each report’s timeline.
        </p>
        <ol className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Review & triage",
              "Open a new report, check what happened, choose the severity, and move it to Triaged. Mark reports that cannot be acted on as Not actionable.",
            ],
            [
              "Take ownership",
              "Assign the report to yourself so other responders know who is handling it. Move it to Investigating as you examine the details.",
            ],
            [
              "Record & communicate",
              "Add internal notes for the team. Select the reporter-visible option only for updates that are safe for the reporter to read.",
            ],
            [
              "Resolve & share learning",
              "Record containment or recovery actions, then mark the incident Resolved and later Closed. Publish a separate alert if others need guidance.",
            ],
          ].map(([title, text], index) => (
            <li key={title}>
              <span className="font-mono text-xs font-extrabold text-[#1739a8]">0{index + 1}</span>
              <h3 className="mt-2 text-sm font-extrabold text-[#0a1d58]">{title}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t border-blue-100 pt-4 text-xs leading-6 text-slate-600">
          <strong>Before sharing:</strong> internal notes stay in this workspace. Reporter updates
          require the report reference and tracking key to read; published alerts are public. Remove
          personal details from advisories. This desk manages reports and does not automatically
          scan devices or block threats.
        </p>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
  href,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  tone: "blue" | "violet" | "rose" | "amber";
  href: string;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200"
    >
      <div className="flex items-center justify-between">
        <span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <ArrowRight className="size-4 text-slate-300" aria-hidden="true" />
      </div>
      <p className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-[#0a1d58]">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </Link>
  );
}
