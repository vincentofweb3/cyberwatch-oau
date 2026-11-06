import type { Metadata } from "next";
import { FileSearch } from "lucide-react";
import { TrackingForm } from "@/components/tracking-form";

export const metadata: Metadata = {
  title: "Track a report",
  description: "Privately check a CyberWatch report using its reference and one-time tracking key.",
};

export default function TrackPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-slate-200 bg-white">
        <div className="page-shell py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-[#1739a8] uppercase">
              <FileSearch className="size-4" aria-hidden="true" />
              Private status lookup
            </div>
            <h1 className="font-display mt-4 text-4xl font-bold tracking-[-0.04em] text-[#0a1d58] sm:text-5xl">
              Track your cyber report.
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Your reference identifies the case; the one-time key proves you are allowed to view
              reporter updates. Neither value is stored in the URL.
            </p>
          </div>
        </div>
      </section>
      <section className="paper-grid py-10 sm:py-14">
        <div className="page-shell">
          <TrackingForm />
        </div>
      </section>
    </main>
  );
}
