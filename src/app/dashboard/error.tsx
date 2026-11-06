"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="grid min-h-[65vh] place-items-center">
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-rose-50 text-rose-700">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#0a1d58]">
          The responder workspace hit an error.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          No update should be treated as saved unless a success message was shown. Retry or return
          to the queue.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="button-primary">
            Try again
          </button>
          <Link href="/dashboard/incidents" className="button-secondary">
            Incident queue
          </Link>
        </div>
      </div>
    </div>
  );
}
