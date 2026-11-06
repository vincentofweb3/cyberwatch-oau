"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function PublicError({
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
    <main id="main-content" className="grid flex-1 place-items-center bg-slate-50 p-6">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-700">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#0a1d58]">
          This page could not be loaded.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Refresh the page or return home. If you were submitting a report, do not assume it was
          received unless you saw a reference and tracking key.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="button-primary">
            Try again
          </button>
          <Link href="/" className="button-secondary">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
