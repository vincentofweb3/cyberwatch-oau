import type { Metadata } from "next";
import { BookOpenCheck, ExternalLink } from "lucide-react";
import { AwarenessQuiz } from "@/components/awareness-quiz";
import { awarenessGuides } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cyber awareness centre",
  description:
    "Learn practical steps for phishing, impersonation, compromised accounts, suspicious links, and evidence preservation.",
};

export default function LearnPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-slate-200 bg-white">
        <div className="page-shell py-14 sm:py-18">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-[#1739a8] uppercase">
              <BookOpenCheck className="size-4" aria-hidden="true" />
              Awareness centre
            </div>
            <h1 className="font-display mt-4 text-4xl font-bold tracking-[-0.04em] text-[#0a1d58] sm:text-5xl">
              Small pauses prevent expensive mistakes.
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Use these practical checks before you trust a message, open a link, send money, or
              share account information.
            </p>
          </div>
        </div>
      </section>
      <section className="paper-grid py-12 sm:py-16">
        <div className="page-shell">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {awarenessGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <article
                  id={guide.slug}
                  key={guide.slug}
                  className="card-shadow scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-[#1739a8]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 text-lg font-extrabold text-[#0a1d58]">{guide.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{guide.summary}</p>
                  <ul className="mt-4 grid gap-2 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
                    {guide.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#0b8f79]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
          <div className="mt-10">
            <AwarenessQuiz />
          </div>
          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-7 text-blue-950">
            <strong>Use official references too.</strong> OAU publishes its own cybersecurity tips
            and scam notices.{" "}
            <a
              href="https://oauife.edu.ng/cybersecurity-tips/"
              target="_blank"
              rel="noreferrer"
              className="ml-1 inline-flex items-center gap-1 font-extrabold text-[#1739a8]"
            >
              Read OAU cybersecurity tips <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
