"use client";

import { useActionState } from "react";
import { RadioTower } from "lucide-react";
import { createAlertAction, type AlertFormState } from "@/app/actions/alerts";
import { FieldError } from "@/components/field-error";
import { SEVERITY_LEVELS, SEVERITY_LABELS, TLP_LEVELS } from "@/lib/domain";

export function AlertForm() {
  const initialState: AlertFormState = { success: false };
  const [state, formAction, pending] = useActionState(createAlertAction, initialState);

  return (
    <form
      action={formAction}
      className="card-shadow rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
      noValidate
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#1739a8]">
          <RadioTower className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-[#0a1d58]">Create an advisory</h2>
          <p className="text-xs text-slate-500">Publish only verified, actionable guidance.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-5">
        <div>
          <label htmlFor="title" className="field-label">
            Title
          </label>
          <input
            id="title"
            name="title"
            className="form-control"
            minLength={8}
            maxLength={140}
            required
            aria-invalid={Boolean(state.errors?.title)}
          />
          <FieldError errors={state.errors?.title} />
        </div>
        <div>
          <label htmlFor="summary" className="field-label">
            Short summary
          </label>
          <textarea
            id="summary"
            name="summary"
            className="form-control min-h-24 resize-y"
            minLength={20}
            maxLength={280}
            required
            aria-invalid={Boolean(state.errors?.summary)}
          />
          <FieldError errors={state.errors?.summary} />
        </div>
        <div>
          <label htmlFor="content" className="field-label">
            Public guidance
          </label>
          <textarea
            id="content"
            name="content"
            className="form-control min-h-40 resize-y"
            minLength={40}
            maxLength={5000}
            required
            aria-invalid={Boolean(state.errors?.content)}
          />
          <FieldError errors={state.errors?.content} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="severity" className="field-label">
              Severity
            </label>
            <select id="severity" name="severity" className="form-control" defaultValue="MEDIUM">
              {SEVERITY_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {SEVERITY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tlp" className="field-label">
              Sharing label
            </label>
            <select id="tlp" name="tlp" className="form-control" defaultValue="CLEAR">
              {TLP_LEVELS.map((item) => (
                <option key={item} value={item}>
                  TLP:{item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="alert-status" className="field-label">
              Publication
            </label>
            <select id="alert-status" name="status" className="form-control" defaultValue="DRAFT">
              <option value="DRAFT">Save draft</option>
              <option value="PUBLISHED">Publish now</option>
            </select>
          </div>
        </div>
      </div>
      {state.message && (
        <p
          className={`mt-5 rounded-xl border p-3 text-sm font-semibold ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}
          role="status"
        >
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="button-primary mt-5 w-full">
        {pending ? "Saving advisory…" : "Save advisory"}
      </button>
    </form>
  );
}
