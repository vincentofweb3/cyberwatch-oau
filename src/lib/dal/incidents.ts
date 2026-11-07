import "server-only";

import { and, count, desc, eq, isNull, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { auditLogs, incidentEvents, incidents, users } from "@/db/schema";
import {
  isValidStatusTransition,
  severityFromImpact,
  type IncidentCategory,
  type IncidentStatus,
  type Severity,
} from "@/lib/domain";
import { ActionError } from "@/lib/errors";
import {
  createId,
  createReferenceCode,
  createTrackingKey,
  hashTrackingKey,
  verifyTrackingKey,
} from "@/lib/identifiers";
import type { IncidentUpdateInput, ReportIncidentInput } from "@/lib/validators";
import { getResponderForAction, requireResponder } from "@/lib/dal/session";

export type ReportReceipt = {
  referenceCode: string;
  trackingKey: string;
  status: "NEW";
  guidance: string[];
};

function parseOccurredAt(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function guidanceForCategory(category: IncidentCategory) {
  const universal = [
    "Do not delete the message or conversation until you have preserved the relevant details.",
    "Do not send passwords, OTPs, recovery codes, or money to anyone responding to the incident.",
  ];

  const specific: Record<IncidentCategory, string> = {
    PHISHING:
      "Do not open more links or attachments from the message. If you entered a password, change it from a trusted device.",
    IMPERSONATION_SCAM:
      "Stop communicating with the impersonator and verify the claimed identity through a known official channel.",
    ACCOUNT_COMPROMISE:
      "Change the affected password from a trusted device, enable multi-factor authentication, and sign out other sessions.",
    MALWARE:
      "Disconnect the affected device from networks, avoid copying files to other devices, and seek qualified technical assistance.",
    SUSPICIOUS_WEBSITE:
      "Close the site. If you entered credentials or payment details, contact the relevant account provider immediately.",
    DATA_EXPOSURE:
      "Do not redistribute the exposed information. Record where it appeared and limit further access where possible.",
    OTHER:
      "Avoid taking destructive action. Preserve what you observed and wait for qualified guidance.",
  };

  return [specific[category], ...universal];
}

export async function createPublicIncident(input: ReportIncidentInput): Promise<ReportReceipt> {
  const id = createId();
  const referenceCode = createReferenceCode();
  const trackingKey = createTrackingKey();
  const now = new Date();
  const severity = severityFromImpact(input.impact);

  await db.transaction(async (transaction) => {
    await transaction.insert(incidents).values({
      id,
      referenceCode,
      trackingKeyHash: hashTrackingKey(trackingKey),
      anonymous: input.anonymous,
      reporterName: input.anonymous ? null : (input.reporterName ?? null),
      reporterEmail: input.anonymous ? null : (input.reporterEmail ?? null),
      reporterPhone: input.anonymous ? null : (input.reporterPhone ?? null),
      category: input.category,
      channel: input.channel,
      title: input.title,
      description: input.description,
      suspiciousUrl: input.suspiciousUrl ?? null,
      senderIdentifier: input.senderIdentifier ?? null,
      occurredAt: parseOccurredAt(input.occurredAt),
      impact: input.impact,
      severity,
      status: "NEW",
      tlp: "AMBER",
      createdAt: now,
      updatedAt: now,
    });

    await transaction.insert(incidentEvents).values({
      id: createId(),
      incidentId: id,
      actorId: null,
      eventType: "SUBMITTED",
      toStatus: "NEW",
      note: "Your report was received and is awaiting triage.",
      visibleToReporter: true,
      createdAt: now,
    });
  });

  return {
    referenceCode,
    trackingKey,
    status: "NEW",
    guidance: guidanceForCategory(input.category),
  };
}

export async function trackPublicIncident(referenceCode: string, trackingKey: string) {
  const [incident] = await db
    .select({
      id: incidents.id,
      referenceCode: incidents.referenceCode,
      trackingKeyHash: incidents.trackingKeyHash,
      category: incidents.category,
      title: incidents.title,
      status: incidents.status,
      severity: incidents.severity,
      createdAt: incidents.createdAt,
      updatedAt: incidents.updatedAt,
      resolvedAt: incidents.resolvedAt,
    })
    .from(incidents)
    .where(eq(incidents.referenceCode, referenceCode))
    .limit(1);

  if (!incident || !verifyTrackingKey(trackingKey, incident.trackingKeyHash)) {
    return null;
  }

  const events = await db
    .select({
      id: incidentEvents.id,
      eventType: incidentEvents.eventType,
      fromStatus: incidentEvents.fromStatus,
      toStatus: incidentEvents.toStatus,
      note: incidentEvents.note,
      createdAt: incidentEvents.createdAt,
    })
    .from(incidentEvents)
    .where(
      and(eq(incidentEvents.incidentId, incident.id), eq(incidentEvents.visibleToReporter, true)),
    )
    .orderBy(incidentEvents.createdAt);

  return {
    referenceCode: incident.referenceCode,
    category: incident.category,
    title: incident.title,
    status: incident.status,
    severity: incident.severity,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
    resolvedAt: incident.resolvedAt,
    events,
  };
}

export type IncidentFilters = {
  query?: string;
  status?: IncidentStatus;
  severity?: Severity;
  category?: IncidentCategory;
  unassigned?: boolean;
};

export async function listIncidents(filters: IncidentFilters = {}) {
  await requireResponder();
  const conditions: SQL[] = [];

  if (filters.status) conditions.push(eq(incidents.status, filters.status));
  if (filters.severity) conditions.push(eq(incidents.severity, filters.severity));
  if (filters.category) conditions.push(eq(incidents.category, filters.category));
  if (filters.unassigned) conditions.push(isNull(incidents.assignedToId));
  if (filters.query) {
    const pattern = `%${filters.query.trim()}%`;
    conditions.push(
      or(
        ilike(incidents.referenceCode, pattern),
        ilike(incidents.title, pattern),
        ilike(incidents.senderIdentifier, pattern),
      )!,
    );
  }

  return db
    .select({
      id: incidents.id,
      referenceCode: incidents.referenceCode,
      title: incidents.title,
      category: incidents.category,
      channel: incidents.channel,
      severity: incidents.severity,
      status: incidents.status,
      anonymous: incidents.anonymous,
      assignedToId: incidents.assignedToId,
      assigneeName: users.fullName,
      createdAt: incidents.createdAt,
      updatedAt: incidents.updatedAt,
    })
    .from(incidents)
    .leftJoin(users, eq(incidents.assignedToId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      sql`case ${incidents.severity} when 'CRITICAL' then 1 when 'HIGH' then 2 when 'MEDIUM' then 3 else 4 end`,
      desc(incidents.createdAt),
    )
    .limit(100);
}

export async function getIncidentDetail(id: string) {
  await requireResponder();
  const [incident] = await db
    .select({
      id: incidents.id,
      referenceCode: incidents.referenceCode,
      anonymous: incidents.anonymous,
      reporterName: incidents.reporterName,
      reporterEmail: incidents.reporterEmail,
      reporterPhone: incidents.reporterPhone,
      category: incidents.category,
      channel: incidents.channel,
      title: incidents.title,
      description: incidents.description,
      suspiciousUrl: incidents.suspiciousUrl,
      senderIdentifier: incidents.senderIdentifier,
      occurredAt: incidents.occurredAt,
      impact: incidents.impact,
      severity: incidents.severity,
      status: incidents.status,
      tlp: incidents.tlp,
      assignedToId: incidents.assignedToId,
      assigneeName: users.fullName,
      acknowledgedAt: incidents.acknowledgedAt,
      resolvedAt: incidents.resolvedAt,
      createdAt: incidents.createdAt,
      updatedAt: incidents.updatedAt,
      version: incidents.version,
    })
    .from(incidents)
    .leftJoin(users, eq(incidents.assignedToId, users.id))
    .where(eq(incidents.id, id))
    .limit(1);

  if (!incident) return null;

  const events = await db
    .select({
      id: incidentEvents.id,
      eventType: incidentEvents.eventType,
      actorName: users.fullName,
      fromStatus: incidentEvents.fromStatus,
      toStatus: incidentEvents.toStatus,
      note: incidentEvents.note,
      visibleToReporter: incidentEvents.visibleToReporter,
      createdAt: incidentEvents.createdAt,
    })
    .from(incidentEvents)
    .leftJoin(users, eq(incidentEvents.actorId, users.id))
    .where(eq(incidentEvents.incidentId, id))
    .orderBy(desc(incidentEvents.createdAt));

  return { ...incident, events };
}

export async function getDashboardOverview() {
  await requireResponder();

  const [totals] = await db
    .select({
      total: count(),
      newCount: sql<number>`sum(case when ${incidents.status} = 'NEW' then 1 else 0 end)`,
      activeCount: sql<number>`sum(case when ${incidents.status} in ('TRIAGED','INVESTIGATING','CONTAINED') then 1 else 0 end)`,
      criticalCount: sql<number>`sum(case when ${incidents.severity} = 'CRITICAL' and ${incidents.status} not in ('CLOSED','REJECTED') then 1 else 0 end)`,
      unassignedCount: sql<number>`sum(case when ${incidents.assignedToId} is null and ${incidents.status} not in ('CLOSED','REJECTED') then 1 else 0 end)`,
      resolvedCount: sql<number>`sum(case when ${incidents.status} in ('RESOLVED','CLOSED') then 1 else 0 end)`,
    })
    .from(incidents);

  const recent = await listIncidents();

  return {
    totals: {
      total: Number(totals.total ?? 0),
      newCount: Number(totals.newCount ?? 0),
      activeCount: Number(totals.activeCount ?? 0),
      criticalCount: Number(totals.criticalCount ?? 0),
      unassignedCount: Number(totals.unassignedCount ?? 0),
      resolvedCount: Number(totals.resolvedCount ?? 0),
    },
    recent: recent.slice(0, 6),
  };
}

export async function updateIncident(input: IncidentUpdateInput) {
  const actor = await getResponderForAction();

  if (!actor) {
    throw new ActionError("Your session has expired. Sign in again.");
  }

  return db.transaction(async (transaction) => {
    const [existing] = await transaction
      .select()
      .from(incidents)
      .where(eq(incidents.id, input.incidentId))
      .limit(1);

    if (!existing) {
      throw new ActionError("Incident not found.");
    }

    if (!isValidStatusTransition(existing.status, input.status)) {
      throw new ActionError(`The incident cannot move from ${existing.status} to ${input.status}.`);
    }

    const assignedToId =
      input.assignment === "SELF"
        ? actor.id
        : input.assignment === "UNASSIGN"
          ? null
          : existing.assignedToId;
    const now = new Date();
    const statusChanged = existing.status !== input.status;
    const severityChanged = existing.severity !== input.severity;
    const assignmentChanged = assignedToId !== existing.assignedToId;
    const hasNote = Boolean(input.note.trim());

    if (!statusChanged && !severityChanged && !assignmentChanged && !hasNote) {
      throw new ActionError("No changes were provided.");
    }

    const updated = await transaction
      .update(incidents)
      .set({
        status: input.status,
        severity: input.severity,
        assignedToId,
        acknowledgedAt:
          existing.acknowledgedAt ?? (input.status !== "NEW" ? now : existing.acknowledgedAt),
        resolvedAt:
          input.status === "RESOLVED" || input.status === "CLOSED"
            ? (existing.resolvedAt ?? now)
            : null,
        version: existing.version + 1,
        updatedAt: now,
      })
      .where(and(eq(incidents.id, input.incidentId), eq(incidents.version, existing.version)))
      .returning({ id: incidents.id });

    if (!updated.length) {
      throw new ActionError(
        "Another responder updated this incident. Refresh the report and try again.",
      );
    }

    if (statusChanged) {
      await transaction.insert(incidentEvents).values({
        id: createId(),
        incidentId: existing.id,
        actorId: actor.id,
        eventType: "STATUS_CHANGED",
        fromStatus: existing.status,
        toStatus: input.status,
        note: input.visibleToReporter && input.note ? input.note : null,
        visibleToReporter: input.visibleToReporter,
        createdAt: now,
      });
    }

    if (severityChanged) {
      await transaction.insert(incidentEvents).values({
        id: createId(),
        incidentId: existing.id,
        actorId: actor.id,
        eventType: "SEVERITY_CHANGED",
        note: `Severity changed from ${existing.severity} to ${input.severity}.`,
        visibleToReporter: false,
        createdAt: now,
      });
    }

    if (assignmentChanged) {
      await transaction.insert(incidentEvents).values({
        id: createId(),
        incidentId: existing.id,
        actorId: actor.id,
        eventType: "ASSIGNED",
        note: assignedToId
          ? "Incident assigned to a responder."
          : "Incident returned to the unassigned queue.",
        visibleToReporter: false,
        createdAt: now,
      });
    }

    if (hasNote && !statusChanged) {
      await transaction.insert(incidentEvents).values({
        id: createId(),
        incidentId: existing.id,
        actorId: actor.id,
        eventType: input.visibleToReporter ? "REPORTER_UPDATE" : "NOTE_ADDED",
        note: input.note,
        visibleToReporter: input.visibleToReporter,
        createdAt: now,
      });
    } else if (hasNote && statusChanged && !input.visibleToReporter) {
      await transaction.insert(incidentEvents).values({
        id: createId(),
        incidentId: existing.id,
        actorId: actor.id,
        eventType: "NOTE_ADDED",
        note: input.note,
        visibleToReporter: false,
        createdAt: now,
      });
    }

    await transaction.insert(auditLogs).values({
      id: createId(),
      actorId: actor.id,
      action: "incident.updated",
      entityType: "incident",
      entityId: existing.id,
      metadata: {
        fromStatus: existing.status,
        toStatus: input.status,
        fromSeverity: existing.severity,
        toSeverity: input.severity,
        assignmentChanged,
        reporterVisibleUpdate: input.visibleToReporter && hasNote,
      },
      createdAt: now,
    });

    return { success: true, referenceCode: existing.referenceCode };
  });
}
