"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
          <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-extrabold tracking-[0.14em] text-rose-600 uppercase">
              Unexpected error
            </p>
            <h1 className="mt-3 text-2xl font-extrabold text-[#0a1d58]">
              CyberWatch could not load this page.
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              No action was confirmed. Try again, and keep any evidence or tracking details safe.
            </p>
            <button type="button" onClick={reset} className="button-primary mt-6">
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
