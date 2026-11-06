import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ContactRound,
  Eye,
  EyeOff,
  Fingerprint,
  Link2Off,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import { IncidentUpdateForm } from "@/components/incident-update-form";
import { SeverityBadge, StatusBadge, TlpBadge } from "@/components/status-badge";
import { INCIDENT_CATEGORY_LABELS, INCIDENT_CHANNEL_LABELS, STATUS_LABELS } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { getIncidentDetail } from "@/lib/dal/incidents";
import { requireResponder } from "@/lib/dal/session";

export const metadata: Metadata = {
  title: "Incident detail",
  robots: { index: false, follow: false },
};

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [responder, incident] = await Promise.all([requireResponder(), getIncidentDetail(id)]);
  if (!incident) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/dashboard/incidents"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1739a8]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to incident queue
      </Link>
      <div className="mt-5 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold tracking-widest text-slate-500">
            {incident.referenceCode}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#0a1d58] sm:text-3xl">
            {incident.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
            <span>{INCIDENT_CATEGORY_LABELS[incident.category]}</span>
            <span>{INCIDENT_CHANNEL_LABELS[incident.channel]}</span>
            <span>Received {formatDate(incident.createdAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <StatusBadge status={incident.status} />
          <SeverityBadge severity={incident.severity} />
          <TlpBadge tlp={incident.tlp} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)] xl:items-start">
        <div className="grid gap-6">
          <section className="card-shadow rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-[#0a1d58]">Report narrative</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {incident.description}
            </p>
            <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <Detail
                icon={CalendarClock}
                term="Occurred"
                value={formatDate(incident.occurredAt)}
              />
              <Detail
                icon={Fingerprint}
                term="Reported impact"
                value={incident.impact.toLowerCase()}
                capitalize
              />
              <Detail
                icon={MessageSquareText}
                term="Sender or device"
                value={incident.senderIdentifier ?? "Not provided"}
              />
              <Detail
                icon={Link2Off}
                term="Suspicious URL"
                value={incident.suspiciousUrl ?? "Not provided"}
                mono
              />
            </dl>
          </section>

          <section className="card-shadow rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#0a1d58]">Incident timeline</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Newest activity first. Reporter visibility is explicit.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                {incident.events.length} events
              </span>
            </div>
            <ol className="mt-6 grid gap-0">
              {incident.events.map((event, index) => (
                <li
                  key={event.id}
                  className="relative grid grid-cols-[2.25rem_1fr] gap-3 pb-6 last:pb-0"
                >
                  {index < incident.events.length - 1 && (
                    <span
                      className="absolute top-9 bottom-0 left-[1.08rem] w-px bg-slate-200"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 grid size-9 place-items-center rounded-full border ${event.visibleToReporter ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}
                  >
                    {event.visibleToReporter ? (
                      <Eye className="size-4" aria-hidden="true" />
                    ) : (
                      <EyeOff className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-extrabold text-slate-900">
                        {event.toStatus
                          ? `${STATUS_LABELS[event.toStatus]} update`
                          : event.eventType.replaceAll("_", " ").toLowerCase()}
                      </p>
                      <time className="text-xs text-slate-400">{formatDate(event.createdAt)}</time>
                    </div>
                    {event.note && (
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {event.note}
                      </p>
                    )}
                    <p className="mt-2 text-[0.7rem] font-semibold text-slate-400">
                      {event.actorName ?? "Public submission"} ·{" "}
                      {event.visibleToReporter ? "Visible to reporter" : "Internal only"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="grid gap-6 xl:sticky xl:top-8">
          <IncidentUpdateForm
            incidentId={incident.id}
            status={incident.status}
            severity={incident.severity}
            assignedToCurrentUser={incident.assignedToId === responder.id}
          />
          <section className="card-shadow rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="flex items-center gap-2 font-extrabold text-[#0a1d58]">
              <ContactRound className="size-4" aria-hidden="true" />
              Reporter and ownership
            </h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <Meta
                term="Reporter"
                value={
                  incident.anonymous ? "Anonymous" : (incident.reporterName ?? "Name not supplied")
                }
              />
              <Meta term="Email" value={incident.reporterEmail ?? "Not supplied"} />
              <Meta term="Phone" value={incident.reporterPhone ?? "Not supplied"} />
              <Meta term="Assigned to" value={incident.assigneeName ?? "Unassigned"} />
              <Meta term="Acknowledged" value={formatDate(incident.acknowledgedAt)} />
              <Meta term="Resolved" value={formatDate(incident.resolvedAt)} />
            </dl>
          </section>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">
            <strong>Handle untrusted content carefully.</strong> Do not open a suspicious URL or
            copy a command from the report on a normal workstation. This prototype performs no
            automated reputation or malware analysis.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  term,
  value,
  mono = false,
  capitalize = false,
}: {
  icon: typeof UserRound;
  term: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#1739a8]" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-bold text-slate-500">{term}</dt>
        <dd
          className={`mt-1 break-words text-sm text-slate-700 ${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

function Meta({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{term}</dt>
      <dd className="max-w-[60%] break-words text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
