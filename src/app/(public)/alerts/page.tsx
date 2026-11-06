import type { Metadata } from "next";
import { RadioTower } from "lucide-react";
import { SeverityBadge, TlpBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { listPublishedAlerts } from "@/lib/dal/alerts";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Security alerts",
  description: "Read public cyber safety advisories and practical response guidance.",
};
export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await listPublishedAlerts();
  return (
    <main id="main-content" className="flex-1">
      <section className="security-grid bg-[#07133b] text-white">
        <div className="page-shell py-14 sm:py-18">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-blue-200 uppercase">
              <RadioTower className="size-4" aria-hidden="true" />
              Public advisories
            </div>
            <h1 className="font-display mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              Security alerts you can act on.
            </h1>
            <p className="mt-4 text-base leading-8 text-blue-100/75">
              Verified, plain-language guidance for common threats affecting students, staff,
              applicants, and other members of the university community.
            </p>
          </div>
        </div>
      </section>
      <section className="paper-grid py-12 sm:py-16">
        <div className="page-shell max-w-4xl">
          {alerts.length ? (
            <div className="grid gap-6">
              {alerts.map((alert) => (
                <article
                  id={alert.slug}
                  key={alert.id}
                  className="card-shadow scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500">
                        Published{" "}
                        {formatDate(alert.publishedAt ?? alert.createdAt, { dateStyle: "long" })}
                      </p>
                      <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#0a1d58]">
                        {alert.title}
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <SeverityBadge severity={alert.severity} />
                      <TlpBadge tlp={alert.tlp} />
                    </div>
                  </div>
                  <p className="mt-4 border-l-4 border-blue-500 pl-4 text-base font-semibold leading-7 text-slate-700">
                    {alert.summary}
                  </p>
                  <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {alert.content}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={RadioTower}
              title="No alerts published"
              description="Verified public advisories will appear here when responders publish them."
            />
          )}
        </div>
      </section>
    </main>
  );
}
