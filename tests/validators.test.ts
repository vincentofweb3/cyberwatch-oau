import { describe, expect, it } from "vitest";
import {
  createAlertSchema,
  incidentUpdateSchema,
  reportIncidentSchema,
  trackIncidentSchema,
} from "@/lib/validators";

const validReport = {
  category: "PHISHING",
  channel: "EMAIL",
  title: "Suspicious scholarship login request",
  description:
    "A message asked me to sign in through an unfamiliar link and requested an OTP. I did not enter any details.",
  impact: "LOW",
  anonymous: "on",
  consent: "on",
  website: "",
};

describe("untrusted input validation", () => {
  it("accepts a minimized anonymous report", () => {
    const result = reportIncidentSchema.safeParse(validReport);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.anonymous).toBe(true);
  });

  it("requires contact information for a non-anonymous report", () => {
    const result = reportIncidentSchema.safeParse({ ...validReport, anonymous: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.reporterEmail).toBeDefined();
  });

  it("rejects honeypot submissions and malformed tracking credentials", () => {
    expect(
      reportIncidentSchema.safeParse({ ...validReport, website: "spam.example" }).success,
    ).toBe(false);
    expect(
      trackIncidentSchema.safeParse({ referenceCode: "CW-1", trackingKey: "secret" }).success,
    ).toBe(false);
  });

  it("accepts constrained responder mutations", () => {
    expect(
      incidentUpdateSchema.safeParse({
        incidentId: "10000000-0000-4000-8000-000000000001",
        status: "TRIAGED",
        severity: "HIGH",
        assignment: "SELF",
        note: "Validated the suspicious sender.",
        visibleToReporter: "on",
      }).success,
    ).toBe(true);
    expect(
      createAlertSchema.safeParse({
        title: "Watch for fake payment requests",
        summary:
          "Verify payment instructions through a known official channel before sending money.",
        content:
          "Pause when a message creates urgency. Verify the request using contact information you already trust and never share an OTP.",
        severity: "HIGH",
        tlp: "CLEAR",
        status: "PUBLISHED",
      }).success,
    ).toBe(true);
  });
});
