"use client";

import { useActionState } from "react";
import { Clock3, FileSearch, KeyRound, ShieldCheck } from "lucide-react";
import { trackIncidentAction, type TrackFormState } from "@/app/actions/public";
import { FieldError } from "@/components/field-error";
import { SeverityBadge, StatusBadge } from "@/components/status-badge";
import { INCIDENT_CATEGORY_LABELS, STATUS_LABELS } from "@/lib/domain";
import { formatDate } from "@/lib/format";

export function TrackingForm() {
  const initialState: TrackFormState = { success: false };
  const [state, formAction, pending] = useActionState(trackIncidentAction, initialState);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <form
        action={formAction}
        className="card-shadow rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"
        noValidate
      >
        <span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-[#1739a8]">
          <KeyRound className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-[#0a1d58]">
          Enter your tracking details
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Both values are required. They are checked privately and never placed in the page URL.
        </p>

        <div className="mt-6">
          <label htmlFor="referenceCode" className="field-label">
            Report reference
          </label>
          <input
            id="referenceCode"
            name="referenceCode"
            className="form-control font-mono uppercase"
            placeholder="CW-2026-XXXXXXX"
            autoComplete="off"
            required
            aria-invalid={Boolean(state.errors?.referenceCode)}
          />
          <FieldError errors={state.errors?.referenceCode} />
        </div>
        <div className="mt-5">
          <label htmlFor="trackingKey" className="field-label">
            Private tracking key
          </label>
          <input
            id="trackingKey"
            name="trackingKey"
            className="form-control font-mono uppercase"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            autoComplete="off"
            required
            aria-invalid={Boolean(state.errors?.trackingKey)}
          />
          <FieldError errors={state.errors?.trackingKey} />
        </div>

        {state.message && !state.success && (
          <p
            className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800"
            role="alert"
          >
            {state.message}
          </p>
        )}

        <button type="submit" disabled={pending} className="button-primary mt-6 w-full">
          <FileSearch className="size-4" aria-hidden="true" />
          {pending ? "Checking securely…" : "Check report status"}
        </button>
        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          For privacy, the same message is shown when either value is incorrect.
        </p>
      </form>

      {state.success && state.incident ? (
        <TrackingResult incident={state.incident} />
      ) : (
        <TrackingEmpty />
      )}
    </div>
  );
}

function TrackingResult({ incident }: { incident: NonNullable<TrackFormState["incident"]> }) {
  return (
    <section
      className="card-shadow overflow-hidden rounded-3xl border border-slate-200 bg-white"
      aria-labelledby="tracking-result-title"
    >
      <div className="border-b border-slate-100 bg-[#07133b] px-6 py-6 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs font-bold tracking-widest text-blue-200">
              {incident.referenceCode}
            </p>
            <h2
              id="tracking-result-title"
              className="mt-2 text-2xl font-extrabold tracking-[-0.03em]"
            >
              {incident.title}
            </h2>
            <p className="mt-2 text-sm text-blue-100/75">
              {INCIDENT_CATEGORY_LABELS[incident.category]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={incident.status} />
            <SeverityBadge severity={incident.severity} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 text-xs text-slate-600 sm:grid-cols-2 sm:px-8">
        <span>
          <strong className="text-slate-800">Submitted:</strong> {formatDate(incident.createdAt)}
        </span>
        <span>
          <strong className="text-slate-800">Last updated:</strong> {formatDate(incident.updatedAt)}
        </span>
      </div>

      <div className="px-6 py-7 sm:px-8">
        <h3 className="text-sm font-extrabold tracking-[0.08em] text-slate-500 uppercase">
          Reporter-visible timeline
        </h3>
        <ol className="mt-5 grid gap-0">
          {[...incident.events].reverse().map((event, index) => (
            <li key={event.id} className="relative grid grid-cols-[2rem_1fr] gap-3 pb-6 last:pb-0">
              {index < incident.events.length - 1 && (
                <span
                  className="absolute top-8 bottom-0 left-[0.92rem] w-px bg-slate-200"
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10 mt-0.5 grid size-8 place-items-center rounded-full border border-blue-200 bg-blue-50 text-[#1739a8]">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-slate-900">
                    {event.toStatus ? STATUS_LABELS[event.toStatus] : "Update"}
                  </p>
                  <time className="text-xs text-slate-500">{formatDate(event.createdAt)}</time>
                </div>
                {event.note && (
                  <p className="mt-1 text-sm leading-6 text-slate-600">{event.note}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function TrackingEmpty() {
  return (
    <section className="grid min-h-96 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <Clock3 className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-extrabold text-[#0a1d58]">Your update will appear here</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Only the report status and updates deliberately shared with the reporter are displayed.
          Internal notes and responder identities stay private.
        </p>
      </div>
    </section>
  );
}
