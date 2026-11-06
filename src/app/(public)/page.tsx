import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FileSearch,
  LockKeyhole,
  RadioTower,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { AlertCard } from "@/components/alert-card";
import { RecoveryGuide, ReportingQuestions, ScamSpotlight } from "@/components/home-awareness";
import { listPublishedAlerts } from "@/lib/dal/alerts";

export const metadata: Metadata = {
  title: "Report. Track. Learn.",
  description:
    "Privately report a cyber concern, track its progress, and learn the next safe action.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const alerts = await listPublishedAlerts(3);

  return (
    <main id="main-content" className="flex-1">
      <section className="security-grid relative overflow-hidden bg-[#07133b] text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
        <div className="page-shell grid min-h-[640px] items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="reveal max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-100">
              <Sparkles className="size-3.5 text-[#f4c862]" aria-hidden="true" />
              Independent SIWES academic prototype
            </div>
            <h1 className="font-display mt-7 max-w-3xl text-5xl leading-[1.02] font-bold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
              A safer way to raise a cyber concern.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100/80">
              Report phishing, impersonation, account compromise, malware, suspicious websites, or
              possible data exposure—without creating an account or revealing more than necessary.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/report"
                className="button-primary border-blue-500 bg-blue-500 px-5 hover:border-white hover:bg-white hover:text-[#0a1d58]"
              >
                <ShieldAlert className="size-5" aria-hidden="true" />
                Report an incident
              </Link>
              <Link
                href="/track"
                className="button-secondary border-white/20 bg-white/10 px-5 text-white hover:border-white/30 hover:bg-white/15"
              >
                <FileSearch className="size-5" aria-hidden="true" />
                Track a report
              </Link>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-5 text-blue-100/55">
              Not an official OAU channel. Do not use this prototype for emergencies, passwords,
              OTPs, financial PINs, identity documents, or active malware.
            </p>
          </div>

          <div className="reveal-delay relative">
            <div
              className="absolute -inset-8 rounded-full bg-blue-500/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="panel-shadow relative overflow-hidden rounded-3xl border border-white/15 bg-white text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <p className="text-xs font-extrabold tracking-[0.12em] text-slate-500 uppercase">
                    Private workflow
                  </p>
                  <p className="mt-1 font-extrabold text-[#0a1d58]">
                    From concern to clear next step
                  </p>
                </div>
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <LockKeyhole className="size-5" aria-hidden="true" />
                </span>
              </div>
              <div className="grid gap-0 p-6">
                <WorkflowStep
                  number="01"
                  title="Describe only what matters"
                  text="Choose the incident type, explain what happened, and avoid sharing secrets."
                />
                <WorkflowStep
                  number="02"
                  title="Save your private key"
                  text="Receive a non-sequential reference and one-time tracking key."
                />
                <WorkflowStep
                  number="03"
                  title="Follow safe updates"
                  text="See only the status and notes deliberately shared with you."
                  last
                />
              </div>
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs leading-5 text-slate-500">
                Tracking keys are stored only as one-way hashes. Internal notes and responder
                identities are never shown publicly.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="page-shell grid divide-y divide-slate-200 py-3 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <TrustPoint
            icon={LockKeyhole}
            title="Privacy by default"
            text="Anonymous reporting is supported."
          />
          <TrustPoint
            icon={CheckCircle2}
            title="Structured response"
            text="A clear, auditable incident lifecycle."
          />
          <TrustPoint
            icon={BookOpenCheck}
            title="Actionable learning"
            text="Plain-language safety guidance."
          />
        </div>
      </section>

      <ScamSpotlight />

      <section className="paper-grid py-20">
        <div className="page-shell">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold tracking-[0.14em] text-[#1739a8] uppercase">
                Community advisories
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.03em] text-[#0a1d58] sm:text-4xl">
                Current security guidance
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Short, verified actions designed to reduce harm before an incident spreads.
              </p>
            </div>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-[#1739a8]"
            >
              View all alerts <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {alerts.length ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No public advisories have been published yet.
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-[#1739a8]">
              <RadioTower className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-display mt-6 text-3xl font-bold tracking-[-0.03em] text-[#0a1d58] sm:text-4xl">
              Awareness is part of incident response.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              CyberWatch connects prevention with reporting. Learn to verify identities, protect
              accounts, handle suspicious links, contain affected devices, and preserve useful
              evidence.
            </p>
            <Link href="/learn" className="button-secondary mt-6">
              Open awareness centre <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Feature
              title="Phishing and scams"
              text="Recognise urgency, unusual payment requests, and lookalike links."
            />
            <Feature
              title="Account recovery"
              text="Change exposed credentials safely and review active sessions."
            />
            <Feature
              title="Evidence safety"
              text="Preserve useful context without forwarding malicious content."
            />
            <Feature
              title="Device containment"
              text="Limit spread while avoiding destructive actions that remove evidence."
            />
          </div>
        </div>
      </section>

      <RecoveryGuide />
      <ReportingQuestions />

      <section className="bg-[#1739a8] py-14 text-white">
        <div className="page-shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-100">Seen something suspicious?</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">
              Report early. Share safely. Keep your tracking key private.
            </h2>
          </div>
          <Link
            href="/report"
            className="button-secondary shrink-0 border-white bg-white text-[#0a1d58]"
          >
            Start a report <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function WorkflowStep({
  number,
  title,
  text,
  last = false,
}: {
  number: string;
  title: string;
  text: string;
  last?: boolean;
}) {
  return (
    <div className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-7 last:pb-0">
      {!last && (
        <span
          className="absolute top-9 bottom-0 left-[1.2rem] w-px bg-blue-100"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 grid size-10 place-items-center rounded-xl bg-blue-50 font-mono text-xs font-extrabold text-[#1739a8]">
        {number}
      </span>
      <div>
        <h2 className="font-extrabold text-[#0a1d58]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function TrustPoint({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof LockKeyhole;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-5 first:pl-0 last:pr-0">
      <Icon className="size-5 shrink-0 text-[#1739a8]" aria-hidden="true" />
      <div>
        <p className="text-sm font-extrabold text-[#0a1d58]">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="card-shadow rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="font-extrabold text-[#0a1d58]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
