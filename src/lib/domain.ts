export const USER_ROLES = ["ANALYST", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const INCIDENT_CATEGORIES = [
  "PHISHING",
  "IMPERSONATION_SCAM",
  "ACCOUNT_COMPROMISE",
  "MALWARE",
  "SUSPICIOUS_WEBSITE",
  "DATA_EXPOSURE",
  "OTHER",
] as const;
export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

export const INCIDENT_CHANNELS = [
  "EMAIL",
  "WHATSAPP",
  "SOCIAL_MEDIA",
  "WEBSITE",
  "DEVICE",
  "PHONE_SMS",
  "OTHER",
] as const;
export type IncidentChannel = (typeof INCIDENT_CHANNELS)[number];

export const IMPACT_LEVELS = ["LOW", "MODERATE", "HIGH", "CRITICAL"] as const;
export type ImpactLevel = (typeof IMPACT_LEVELS)[number];

export const SEVERITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Severity = (typeof SEVERITY_LEVELS)[number];

export const INCIDENT_STATUSES = [
  "NEW",
  "TRIAGED",
  "INVESTIGATING",
  "CONTAINED",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const TLP_LEVELS = ["CLEAR", "GREEN", "AMBER", "RED"] as const;
export type TlpLevel = (typeof TLP_LEVELS)[number];

export const ALERT_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export const EVENT_TYPES = [
  "SUBMITTED",
  "ASSIGNED",
  "STATUS_CHANGED",
  "SEVERITY_CHANGED",
  "NOTE_ADDED",
  "REPORTER_UPDATE",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  PHISHING: "Phishing message",
  IMPERSONATION_SCAM: "Impersonation or scam",
  ACCOUNT_COMPROMISE: "Account compromise",
  MALWARE: "Malware or infected device",
  SUSPICIOUS_WEBSITE: "Suspicious website",
  DATA_EXPOSURE: "Possible data exposure",
  OTHER: "Other cyber concern",
};

export const INCIDENT_CHANNEL_LABELS: Record<IncidentChannel, string> = {
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  SOCIAL_MEDIA: "Social media",
  WEBSITE: "Website or portal",
  DEVICE: "Computer or mobile device",
  PHONE_SMS: "Phone call or SMS",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  NEW: "New",
  TRIAGED: "Triaged",
  INVESTIGATING: "Investigating",
  CONTAINED: "Contained",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Not actionable",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const NEXT_INCIDENT_STATUSES: Record<IncidentStatus, IncidentStatus[]> = {
  NEW: ["TRIAGED", "REJECTED"],
  TRIAGED: ["INVESTIGATING", "REJECTED"],
  INVESTIGATING: ["CONTAINED", "RESOLVED", "REJECTED"],
  CONTAINED: ["RESOLVED"],
  RESOLVED: ["CLOSED", "INVESTIGATING"],
  CLOSED: ["INVESTIGATING"],
  REJECTED: ["TRIAGED"],
};

export function isValidStatusTransition(from: IncidentStatus, to: IncidentStatus) {
  return from === to || NEXT_INCIDENT_STATUSES[from].includes(to);
}

export function severityFromImpact(impact: ImpactLevel): Severity {
  const map: Record<ImpactLevel, Severity> = {
    LOW: "LOW",
    MODERATE: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
  };

  return map[impact];
}
