"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, KeyRound, LockKeyhole, Send, ShieldCheck } from "lucide-react";
import { submitIncidentAction, type ReportFormState } from "@/app/actions/public";
import { CopyButton } from "@/components/copy-button";
import { FieldError } from "@/components/field-error";
import {
  INCIDENT_CATEGORIES,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_CHANNELS,
  INCIDENT_CHANNEL_LABELS,
} from "@/lib/domain";

export function ReportForm() {
  const initialState: ReportFormState = { success: false };
  const [state, formAction, pending] = useActionState(submitIncidentAction, initialState);
  const [anonymous, setAnonymous] = useState(true);

  if (state.success && state.receipt) {
    return (
      <section
        className="card-shadow overflow-hidden rounded-3xl border border-emerald-200 bg-white"
        aria-labelledby="report-received"
      >
        <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-6 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-extrabold tracking-[0.14em] text-emerald-700 uppercase">
                Report received
              </p>
              <h2
                id="report-received"
                className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#0a1d58]"
              >
                Save your private tracking details
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                The tracking key is shown once. Store it somewhere safe; CyberWatch cannot recover
                it later.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-7 sm:px-8 lg:grid-cols-2">
          <Credential label="Reference" value={state.receipt.referenceCode} />
          <Credential label="Tracking key" value={state.receipt.trackingKey} secret />
        </div>

        <div className="mx-6 mb-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:mx-8">
          <h3 className="font-extrabold text-amber-950">Take these safe steps now</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-amber-950/80">
            {state.receipt.guidance.map((item) => (
              <li key={item} className="flex gap-2">
                <ShieldCheck className="mt-1 size-4 shrink-0 text-amber-700" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs leading-5 text-slate-500">
            This prototype does not promise an official response or emergency support.
          </p>
          <Link href="/track" className="button-primary">
            Track this report <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form
      action={formAction}
      className="card-shadow rounded-3xl border border-slate-200 bg-white p-5 sm:p-8"
      noValidate
    >
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#1739a8]" aria-hidden="true" />
        <p>
          <strong>Do not include</strong> passwords, OTPs, recovery codes, financial PINs, full
          identity documents, or active malware. Describe what happened without sharing secrets.
        </p>
      </div>

      <fieldset className="mt-8">
        <legend className="text-lg font-extrabold tracking-[-0.02em] text-[#0a1d58]">
          1. What did you notice?
        </legend>
        <p className="mt-1 text-sm text-slate-500">
          Choose the closest options. You can explain uncertainty in the description.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Incident type" name="category" errors={state.errors?.category}>
            <select
              id="category"
              name="category"
              className="form-control"
              defaultValue=""
              required
              aria-invalid={Boolean(state.errors?.category)}
            >
              <option value="" disabled>
                Select a type
              </option>
              {INCIDENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {INCIDENT_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Where did it happen?" name="channel" errors={state.errors?.channel}>
            <select
              id="channel"
              name="channel"
              className="form-control"
              defaultValue=""
              required
              aria-invalid={Boolean(state.errors?.channel)}
            >
              <option value="" disabled>
                Select a channel
              </option>
              {INCIDENT_CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {INCIDENT_CHANNEL_LABELS[channel]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-5 grid gap-5">
          <Field
            label="Short summary"
            name="title"
            hint="Example: Fake bursary refund message requesting my password"
            errors={state.errors?.title}
          >
            <input
              id="title"
              name="title"
              className="form-control"
              minLength={8}
              maxLength={120}
              required
              placeholder="Summarise the concern"
              aria-invalid={Boolean(state.errors?.title)}
            />
          </Field>
          <Field
            label="What happened?"
            name="description"
            hint="Include what you saw, what you clicked or entered, and any immediate impact. Do not revisit a suspicious link to collect more details."
            errors={state.errors?.description}
          >
            <textarea
              id="description"
              name="description"
              className="form-control min-h-40 resize-y"
              minLength={30}
              maxLength={5000}
              required
              placeholder="Describe the event in your own words…"
              aria-invalid={Boolean(state.errors?.description)}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-9 border-t border-slate-100 pt-8">
        <legend className="text-lg font-extrabold tracking-[-0.02em] text-[#0a1d58]">
          2. Add safe indicators
        </legend>
        <p className="mt-1 text-sm text-slate-500">
          Optional details can help connect related reports. Do not test a link before submitting
          it.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label="Suspicious URL"
            name="suspiciousUrl"
            hint="Only paste it if you already have it."
            errors={state.errors?.suspiciousUrl}
          >
            <input
              id="suspiciousUrl"
              name="suspiciousUrl"
              type="url"
              inputMode="url"
              className="form-control"
              placeholder="https://example.test/path"
              aria-invalid={Boolean(state.errors?.suspiciousUrl)}
            />
          </Field>
          <Field
            label="Sender, account, or device"
            name="senderIdentifier"
            hint="For example, an email address, phone number, username, or lab workstation."
            errors={state.errors?.senderIdentifier}
          >
            <input
              id="senderIdentifier"
              name="senderIdentifier"
              className="form-control"
              maxLength={180}
              placeholder="Optional identifier"
              aria-invalid={Boolean(state.errors?.senderIdentifier)}
            />
          </Field>
          <Field label="When did it happen?" name="occurredAt" errors={state.errors?.occurredAt}>
            <input
              id="occurredAt"
              name="occurredAt"
              type="datetime-local"
              className="form-control"
              aria-invalid={Boolean(state.errors?.occurredAt)}
            />
          </Field>
          <Field label="Potential impact" name="impact" errors={state.errors?.impact}>
            <select
              id="impact"
              name="impact"
              className="form-control"
              defaultValue=""
              required
              aria-invalid={Boolean(state.errors?.impact)}
            >
              <option value="" disabled>
                Select impact
              </option>
              <option value="LOW">Low — suspicious, no action taken</option>
              <option value="MODERATE">Moderate — clicked or limited exposure</option>
              <option value="HIGH">High — account, device, or money at risk</option>
              <option value="CRITICAL">Critical — active widespread or sensitive impact</option>
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-9 border-t border-slate-100 pt-8">
        <legend className="text-lg font-extrabold tracking-[-0.02em] text-[#0a1d58]">
          3. Choose how to report
        </legend>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/40">
          <input
            type="checkbox"
            name="anonymous"
            defaultChecked
            onChange={(event) => setAnonymous(event.target.checked)}
            className="mt-1 size-4 accent-[#1739a8]"
          />
          <span>
            <span className="block font-bold text-slate-900">Report anonymously</span>
            <span className="mt-1 block text-sm leading-6 text-slate-500">
              No name, email, or phone number will be stored. Use the reference and tracking key for
              updates.
            </span>
          </span>
        </label>

        {!anonymous && (
          <div className="mt-5 grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
            <Field label="Name (optional)" name="reporterName" errors={state.errors?.reporterName}>
              <input
                id="reporterName"
                name="reporterName"
                autoComplete="name"
                className="form-control"
                maxLength={100}
              />
            </Field>
            <Field label="Email" name="reporterEmail" errors={state.errors?.reporterEmail}>
              <input
                id="reporterEmail"
                name="reporterEmail"
                type="email"
                autoComplete="email"
                className="form-control"
                maxLength={180}
                aria-invalid={Boolean(state.errors?.reporterEmail)}
              />
            </Field>
            <Field
              label="Phone number"
              name="reporterPhone"
              hint="Provide either an email or phone number."
              errors={state.errors?.reporterPhone}
            >
              <input
                id="reporterPhone"
                name="reporterPhone"
                type="tel"
                autoComplete="tel"
                className="form-control"
                maxLength={30}
              />
            </Field>
          </div>
        )}
      </fieldset>

      <div
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <input type="checkbox" name="consent" required className="mt-1 size-4 accent-[#1739a8]" />
        <span>
          I understand this is an independent academic prototype, not an official emergency or OAU
          response channel, and I have removed secrets from my report.
        </span>
      </label>
      <FieldError errors={state.errors?.consent} />

      {state.message && !state.success && (
        <p
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <KeyRound className="size-4" aria-hidden="true" />A private tracking key will be
          generated.
        </p>
        <button type="submit" disabled={pending} className="button-primary min-w-44">
          <Send className="size-4" aria-hidden="true" />
          {pending ? "Submitting safely…" : "Submit report"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  hint,
  errors,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
      <FieldError errors={errors} id={errorId} />
    </div>
  );
}

function Credential({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">{label}</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <code className="break-all text-base font-extrabold tracking-wide text-[#0a1d58]">
          {value}
        </code>
        <CopyButton value={value} label={secret ? "Copy key" : "Copy reference"} />
      </div>
    </div>
  );
}
