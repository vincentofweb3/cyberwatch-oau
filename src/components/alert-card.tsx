import Link from "next/link";
import { ArrowRight, RadioTower } from "lucide-react";
import { SeverityBadge, TlpBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { Severity, TlpLevel } from "@/lib/domain";

type AlertCardProps = {
  alert: {
    title: string;
    slug: string;
    summary: string;
    severity: Severity;
    tlp: TlpLevel;
    publishedAt: Date | null;
    createdAt: Date;
  };
  compact?: boolean;
};

export function AlertCard({ alert, compact = false }: AlertCardProps) {
  return (
    <article className="card-shadow rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#1739a8]">
          <RadioTower className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-wrap justify-end gap-2">
          <SeverityBadge severity={alert.severity} />
          <TlpBadge tlp={alert.tlp} />
        </div>
      </div>
      <h3 className="mt-5 text-lg leading-6 font-extrabold tracking-[-0.02em] text-[#0a1d58]">
        {alert.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{alert.summary}</p>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <time className="text-xs font-semibold text-slate-500">
          {formatDate(alert.publishedAt ?? alert.createdAt, { dateStyle: "medium" })}
        </time>
        {!compact && (
          <Link
            href={`/alerts#${alert.slug}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#1739a8] hover:text-[#0a1d58]"
          >
            Read guidance <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}
