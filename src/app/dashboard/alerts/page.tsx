import type { Metadata } from "next";
import { BellRing, FileText } from "lucide-react";
import { AlertForm } from "@/components/alert-form";
import { EmptyState } from "@/components/empty-state";
import { SeverityBadge, TlpBadge } from "@/components/status-badge";
import { listAllAlerts } from "@/lib/dal/alerts";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Alert manager",
  robots: { index: false, follow: false },
};

export default async function AlertManagerPage() {
  const alerts = await listAllAlerts();
  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-xs font-extrabold tracking-[0.12em] text-[#1739a8] uppercase">
          Community communications
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-[#0a1d58]">
          Alert manager
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Draft or publish concise guidance based on verified incident patterns.
        </p>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
        <AlertForm />
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#0a1d58]">Advisory library</h2>
              <p className="mt-1 text-xs text-slate-500">
                Published alerts appear on the public site immediately.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
              {alerts.length} total
            </span>
          </div>
          {alerts.length ? (
            <div className="grid gap-3">
              {alerts.map((alert) => (
                <article
                  key={alert.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[0.65rem] font-extrabold ${alert.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {alert.status}
                        </span>
                        <span className="font-mono text-[0.65rem] text-slate-400">
                          /{alert.slug}
                        </span>
                      </div>
                      <h3 className="mt-3 font-extrabold text-[#0a1d58]">{alert.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{alert.summary}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <SeverityBadge severity={alert.severity} />
                      <TlpBadge tlp={alert.tlp} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
                    <span>By {alert.authorName ?? "Unknown responder"}</span>
                    <span>
                      {alert.status === "PUBLISHED"
                        ? `Published ${formatDate(alert.publishedAt)}`
                        : `Updated ${formatDate(alert.updatedAt)}`}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No advisories yet"
              description="Create a draft or publish the first verified community alert."
            />
          )}
        </section>
      </div>
      <div className="mt-6 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-950">
        <BellRing className="mt-0.5 size-4 shrink-0 text-[#1739a8]" aria-hidden="true" />
        TLP:CLEAR is appropriate for public web publication. Review the sharing label and remove
        sensitive indicators before publishing.
      </div>
    </div>
  );
}
