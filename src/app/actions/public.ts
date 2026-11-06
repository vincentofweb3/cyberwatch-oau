"use server";

import { createPublicIncident, trackPublicIncident, type ReportReceipt } from "@/lib/dal/incidents";
import { takeRateLimit } from "@/lib/rate-limit";
import { getRequestFingerprint } from "@/lib/request-context";
import { reportIncidentSchema, trackIncidentSchema } from "@/lib/validators";

export type ReportFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  receipt?: ReportReceipt;
};

export async function submitIncidentAction(
  _previousState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const fingerprint = await getRequestFingerprint("public-report");
  const rateLimit = takeRateLimit(fingerprint, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return {
      success: false,
      message:
        "Too many reports were submitted from this device. Wait a few minutes and try again.",
    };
  }

  const parsed = reportIncidentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      message: "Review the highlighted information and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const receipt = await createPublicIncident(parsed.data);
    return {
      success: true,
      message: "Your report was received.",
      receipt,
    };
  } catch {
    return {
      success: false,
      message: "We could not save the report. Keep your evidence safe and try again shortly.",
    };
  }
}

export type TrackFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  incident?: Awaited<ReturnType<typeof trackPublicIncident>>;
};

export async function trackIncidentAction(
  _previousState: TrackFormState,
  formData: FormData,
): Promise<TrackFormState> {
  const fingerprint = await getRequestFingerprint("public-track");
  const rateLimit = takeRateLimit(fingerprint, 20, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return {
      success: false,
      message: "Too many tracking attempts. Wait a few minutes and try again.",
    };
  }

  const parsed = trackIncidentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the reference and tracking key format.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const incident = await trackPublicIncident(parsed.data.referenceCode, parsed.data.trackingKey);

  if (!incident) {
    return {
      success: false,
      message: "The reference or tracking key is incorrect.",
    };
  }

  return { success: true, incident };
}
