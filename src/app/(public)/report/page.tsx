import type { Metadata } from "next";
import { Clock3, LockKeyhole, ShieldAlert } from "lucide-react";
import { ReportForm } from "@/components/report-form";

export const metadata: Metadata = {
  title: "Report a cyber incident",
  description:
    "Submit a privacy-conscious cyber incident report and receive private tracking details.",
};

export default function ReportPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-slate-200 bg-white">
        <div className="page-shell py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-[#1739a8] uppercase">
              <ShieldAlert className="size-4" aria-hidden="true" />
              Secure incident intake
            </div>
            <h1 className="font-display mt-4 text-4xl font-bold tracking-[-0.04em] text-[#0a1d58] sm:text-5xl">
              Report what happened, without sharing secrets.
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              This form is for phishing, impersonation, compromised accounts, suspicious websites,
              malware symptoms, and possible data exposure affecting the university community.
            </p>
          </div>
          <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            <Info icon={Clock3} title="About 4 minutes" />
            <Info icon={LockKeyhole} title="Anonymous if preferred" />
            <Info icon={ShieldAlert} title="No file uploads" />
          </div>
        </div>
      </section>
      <section className="paper-grid py-10 sm:py-14">
        <div className="page-shell max-w-4xl">
          <ReportForm />
        </div>
      </section>
    </main>
  );
}

function Info({ icon: Icon, title }: { icon: typeof Clock3; title: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-600">
      <Icon className="size-4 text-[#1739a8]" aria-hidden="true" />
      {title}
    </div>
  );
}
