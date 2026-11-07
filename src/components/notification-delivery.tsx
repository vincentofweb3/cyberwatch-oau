"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { retryNotificationAction } from "@/app/actions/notifications";
import type { getReportNotification } from "@/lib/dal/notifications";
import { formatDate } from "@/lib/format";

export function NotificationDelivery({
  incidentId,
  delivery,
}: {
  incidentId: string;
  delivery: Awaited<ReturnType<typeof getReportNotification>>;
}) {
  const [state, action, pending] = useActionState(retryNotificationAction, {});
  const item = delivery.notification;
  const failureHint =
    item?.lastError === "resend_403"
      ? "The sender or receiving address is not permitted by the email service."
      : item?.lastError === "resend_401"
        ? "The email service credentials need to be checked."
        : item?.lastError === "resend_429"
          ? "The email service temporarily limited sending."
          : item?.lastError === "network_or_timeout"
            ? "The email service could not be reached. This notification remains saved."
            : null;
  const labels = {
    PENDING: "Queued for email",
    PROCESSING: "Sending notification",
    ACCEPTED: "Accepted by Resend",
    FAILED: "Email needs attention",
    NEEDS_REVIEW: "Delivery needs review",
  };
  return (
    <section
      className="card-shadow rounded-2xl border border-slate-200 bg-white p-5"
      aria-labelledby="email-delivery-heading"
    >
      <h2
        id="email-delivery-heading"
        className="flex items-center gap-2 font-extrabold text-[#0a1d58]"
      >
        <Mail className="size-4" aria-hidden="true" />
        Report email notification
      </h2>
      <p className="mt-3 text-sm font-semibold text-slate-800">
        {item ? labels[item.status] : "No email queued for this earlier report"}
      </p>
      <p className="mt-2 text-xs leading-6 text-slate-500">
        {!delivery.enabled
          ? "Email delivery is disabled in this environment. The report remains saved."
          : item?.status === "ACCEPTED"
            ? `Accepted ${formatDate(item.acceptedAt)}. Acceptance does not confirm inbox placement; check the receiving mailbox or Resend.`
            : item?.status === "FAILED" || item?.status === "NEEDS_REVIEW"
              ? "Review the message in Resend before sending again. The report remains available here."
              : "Notifications go to the configured analyst inbox. Report narratives, contact details, and private notes stay in the workspace."}
      </p>
      {failureHint && <p className="mt-2 text-xs text-slate-500">{failureHint}</p>}
      {item?.status === "PENDING" && item.attempts > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Next attempt eligible {formatDate(item.nextAttemptAt)}.
        </p>
      )}
      {delivery.enabled && item && ["PENDING", "PROCESSING"].includes(item.status) && (
        <form action={action} className="mt-4">
          <input type="hidden" name="incidentId" value={incidentId} />
          <button className="button-secondary w-full" disabled={pending}>
            {pending ? "Checking delivery…" : "Check pending email"}
          </button>
        </form>
      )}
      {state.message && (
        <p role="status" className="mt-3 text-xs leading-6 text-slate-600">
          {state.message}
        </p>
      )}
    </section>
  );
}
