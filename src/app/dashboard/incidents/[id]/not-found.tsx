import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function IncidentNotFound() {
  return (
    <div className="grid min-h-[65vh] place-items-center">
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
          <FileQuestion className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#0a1d58]">Incident not found.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          The record may not exist. No incident data was exposed for this identifier.
        </p>
        <Link href="/dashboard/incidents" className="button-primary mt-6">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to queue
        </Link>
      </div>
    </div>
  );
}
