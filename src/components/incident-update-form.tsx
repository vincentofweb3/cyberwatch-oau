"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateIncidentAction, type IncidentUpdateState } from "@/app/actions/incidents";
import { FieldError } from "@/components/field-error";
import {
  INCIDENT_STATUSES,
  NEXT_INCIDENT_STATUSES,
  SEVERITY_LEVELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  type IncidentStatus,
  type Severity,
} from "@/lib/domain";

export function IncidentUpdateForm({
  incidentId,
  status,
  severity,
  assignedToCurrentUser,
}: {
  incidentId: string;
  status: IncidentStatus;
  severity: Severity;
  assignedToCurrentUser: boolean;
}) {
  const initialState: IncidentUpdateState = { success: false };
  const [state, formAction, pending] = useActionState(updateIncidentAction, initialState);
  const allowedStatuses = new Set<IncidentStatus>([status, ...NEXT_INCIDENT_STATUSES[status]]);

  return (
    <form
      action={formAction}
      className="card-shadow rounded-2xl border border-slate-200 bg-white p-5"
      noValidate
    >
      <input type="hidden" name="incidentId" value={incidentId} />
      <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#0a1d58]">Update incident</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Every change is recorded in the audit trail.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="form-control"
            defaultValue={status}
            aria-invalid={Boolean(state.errors?.status)}
          >
            {INCIDENT_STATUSES.filter((item) => allowedStatuses.has(item)).map((item) => (
              <option key={item} value={item}>
                {STATUS_LABELS[item]}
              </option>
            ))}
          </select>
          <FieldError errors={state.errors?.status} />
        </div>
        <div>
          <label htmlFor="severity" className="field-label">
            Severity
          </label>
          <select
            id="severity"
            name="severity"
            className="form-control"
            defaultValue={severity}
            aria-invalid={Boolean(state.errors?.severity)}
          >
            {SEVERITY_LEVELS.map((item) => (
              <option key={item} value={item}>
                {SEVERITY_LABELS[item]}
              </option>
            ))}
          </select>
          <FieldError errors={state.errors?.severity} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="assignment" className="field-label">
            Assignment
          </label>
          <select id="assignment" name="assignment" className="form-control" defaultValue="KEEP">
            <option value="KEEP">Keep current assignment</option>
            {!assignedToCurrentUser && <option value="SELF">Assign to me</option>}
            <option value="UNASSIGN">Return to unassigned queue</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="note" className="field-label">
            Update note
          </label>
          <textarea
            id="note"
            name="note"
            className="form-control min-h-28 resize-y"
            maxLength={2000}
            placeholder="Record analysis, containment, or clear next steps…"
            aria-invalid={Boolean(state.errors?.note)}
          />
          <FieldError errors={state.errors?.note} />
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
        <input type="checkbox" name="visibleToReporter" className="mt-1 size-4 accent-[#1739a8]" />
        <span>
          <strong className="block text-slate-900">Share this note with the reporter</strong>Use
          plain language and do not include internal analysis, responder identities, or sensitive
          indicators.
        </span>
      </label>

      {state.message && (
        <p
          className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}
          role="status"
        >
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="button-primary mt-5 w-full">
        <Save className="size-4" aria-hidden="true" />
        {pending ? "Saving update…" : "Save incident update"}
      </button>
    </form>
  );
}
