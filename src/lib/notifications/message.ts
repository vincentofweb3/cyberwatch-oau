import { z } from "zod";
import {
  INCIDENT_CATEGORY_LABELS,
  SEVERITY_LABELS,
  type IncidentCategory,
  type Severity,
} from "../domain";

export type EmailMessage = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
};
export type NotificationConfig = { apiKey: string; from: string; to: string; origin: string };

// Callers supply environment settings only on the server or in maintenance scripts.
export function readNotificationConfig(
  environment: Record<string, string | undefined>,
): NotificationConfig | null {
  if (environment.REPORT_NOTIFICATIONS_ENABLED !== "true") return null;
  const apiKey = environment.RESEND_API_KEY?.trim();
  const to = environment.REPORT_NOTIFICATION_TO?.trim();
  const from =
    environment.REPORT_NOTIFICATION_FROM?.trim() || "CyberWatch OAU <onboarding@resend.dev>";
  const senderAddress = from.match(/^[^<>\r\n]+ <([^<>\r\n]+)>$/)?.[1] ?? from;
  if (!apiKey || !z.email().safeParse(to).success || !z.email().safeParse(senderAddress).success)
    throw new Error("Email delivery settings are incomplete or invalid.");
  let origin: URL;
  try {
    origin = new URL(environment.APP_ORIGIN ?? "");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    if (
      (origin.protocol !== "https:" && !(local && origin.protocol === "http:")) ||
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash
    )
      throw new Error("Invalid origin");
  } catch {
    throw new Error("APP_ORIGIN must be an HTTPS origin, or localhost during development.");
  }
  return { apiKey, from, to: to!, origin: origin.origin };
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!,
  );

export function reportEmail(
  config: NotificationConfig,
  report: {
    id: string;
    referenceCode: string;
    category: IncidentCategory;
    severity: Severity;
    createdAt: Date;
  },
): EmailMessage {
  const link = new URL(
    `/dashboard/incidents/${encodeURIComponent(report.id)}`,
    config.origin,
  ).toString();
  const details = [
    ["Reference", report.referenceCode],
    ["Category", INCIDENT_CATEGORY_LABELS[report.category]],
    ["Severity", SEVERITY_LABELS[report.severity]],
    ["Received (UTC)", report.createdAt.toISOString()],
  ];
  const footer =
    "Sign in to the analyst workspace to review the report. Private tracking keys, contact details, report narratives, and internal notes are excluded from this email.";
  const disclaimer =
    "CyberWatch OAU is an independent academic prototype, not an official university reporting channel. This mailbox is not monitored for replies.";
  return {
    from: config.from,
    to: [config.to],
    subject: `CyberWatch OAU: new report ${report.referenceCode}`,
    text: [
      "A new cyber incident report has been recorded.",
      ...details.map(([label, value]) => `${label}: ${value}`),
      `Review report: ${link}`,
      footer,
      disclaimer,
    ].join("\n\n"),
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172554;line-height:1.6"><h1 style="font-size:24px">New incident report</h1><p>A report has been saved in CyberWatch OAU.</p><dl>${details.map(([label, value]) => `<dt><strong>${escapeHtml(label)}</strong></dt><dd style="margin:0 0 12px">${escapeHtml(value)}</dd>`).join("")}</dl><p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 20px;background:#1739a8;color:white;text-decoration:none;border-radius:8px">Review report securely</a></p><p>${escapeHtml(footer)}</p><hr><p style="font-size:12px;color:#64748b">${escapeHtml(disclaimer)}</p></div>`,
  };
}
