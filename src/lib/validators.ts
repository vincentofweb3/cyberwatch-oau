import { z } from "zod";
import {
  ALERT_STATUSES,
  IMPACT_LEVELS,
  INCIDENT_CATEGORIES,
  INCIDENT_CHANNELS,
  INCIDENT_STATUSES,
  SEVERITY_LEVELS,
  TLP_LEVELS,
} from "@/lib/domain";

const optionalTrimmedString = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );

const formBoolean = z.preprocess(
  (value) => value === true || value === "true" || value === "on" || value === "1",
  z.boolean(),
);

export const reportIncidentSchema = z
  .object({
    category: z.enum(INCIDENT_CATEGORIES),
    channel: z.enum(INCIDENT_CHANNELS),
    title: z.string().trim().min(8, "Use at least 8 characters.").max(120),
    description: z
      .string()
      .trim()
      .min(30, "Describe what happened in at least 30 characters.")
      .max(5000),
    suspiciousUrl: optionalTrimmedString(500).pipe(z.url().optional()),
    senderIdentifier: optionalTrimmedString(180),
    occurredAt: optionalTrimmedString(40),
    impact: z.enum(IMPACT_LEVELS),
    anonymous: formBoolean,
    reporterName: optionalTrimmedString(100),
    reporterEmail: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.email("Enter a valid email address.").max(180).optional(),
    ),
    reporterPhone: optionalTrimmedString(30),
    consent: formBoolean.refine((value) => value, "Confirm the safe-use notice to continue."),
    website: optionalTrimmedString(120),
  })
  .superRefine((value, context) => {
    if (!value.anonymous && !value.reporterEmail && !value.reporterPhone) {
      context.addIssue({
        code: "custom",
        path: ["reporterEmail"],
        message: "Provide an email or phone number, or choose anonymous reporting.",
      });
    }

    if (value.website) {
      context.addIssue({
        code: "custom",
        path: ["website"],
        message: "Unable to accept this submission.",
      });
    }
  });

export const trackIncidentSchema = z.object({
  referenceCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^CW-\d{4}-[A-HJ-NP-Z2-9]{7}$/, "Enter a valid CyberWatch reference."),
  trackingKey: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){3}$/, "Enter the 16-character tracking key."),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase().max(180),
  password: z.string().min(8).max(128),
});

export const incidentUpdateSchema = z.object({
  incidentId: z.uuid(),
  status: z.enum(INCIDENT_STATUSES),
  severity: z.enum(SEVERITY_LEVELS),
  assignment: z.enum(["KEEP", "SELF", "UNASSIGN"]),
  note: z.string().trim().max(2000).optional().default(""),
  visibleToReporter: formBoolean,
});

export const createAlertSchema = z.object({
  title: z.string().trim().min(8).max(140),
  summary: z.string().trim().min(20).max(280),
  content: z.string().trim().min(40).max(5000),
  severity: z.enum(SEVERITY_LEVELS),
  tlp: z.enum(TLP_LEVELS),
  status: z.enum(ALERT_STATUSES),
});

export type ReportIncidentInput = z.infer<typeof reportIncidentSchema>;
export type IncidentUpdateInput = z.infer<typeof incidentUpdateSchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
