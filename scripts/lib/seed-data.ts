import { hash } from "bcryptjs";
import { sql } from "drizzle-orm";
import { alerts, incidentEvents, incidents, users } from "../../src/db/schema";
import { hashTrackingKey } from "../../src/lib/identifiers";
import type { AppDatabase } from "../../src/db/connection";

const adminId = "00000000-0000-4000-8000-000000000001";
const analystId = "00000000-0000-4000-8000-000000000002";

export async function seedDemo(db: AppDatabase, adminPassword: string, analystPassword: string) {
  const now = new Date();
  await db.transaction(async (database) => {
    const adminHash = await hash(adminPassword, 12);
    const analystHash = await hash(analystPassword, 12);

    await database
      .insert(users)
      .values([
        {
          id: adminId,
          fullName: "Dr. Kemi Adebayo",
          email: "admin@cyberwatch.local",
          passwordHash: adminHash,
          role: "ADMIN",
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: analystId,
          fullName: "Victor Ibiloju",
          email: "analyst@cyberwatch.local",
          passwordHash: analystHash,
          role: "ANALYST",
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .onConflictDoUpdate({
        target: users.email,
        set: { fullName: sql`excluded.full_name`, updatedAt: now },
      });

    const sampleIncidents = [
      {
        id: "10000000-0000-4000-8000-000000000001",
        referenceCode: "CW-2026-DEMA247",
        trackingKeyHash: hashTrackingKey("SAFE-DEMA-TRAC-K2X6"),
        anonymous: false,
        reporterName: "Ayo Student",
        reporterEmail: "ayo.student@example.test",
        reporterPhone: null,
        category: "PHISHING" as const,
        channel: "EMAIL" as const,
        title: "Fake bursary refund message requesting portal password",
        description:
          "A message claiming to be from the bursary offered a refund and linked to a page that requested an email address, password and OTP. I did not enter the information.",
        suspiciousUrl: "https://example.test/oau-refund",
        senderIdentifier: "refund-office@example.test",
        impact: "MODERATE" as const,
        severity: "HIGH" as const,
        status: "INVESTIGATING" as const,
        tlp: "AMBER" as const,
        assignedToId: analystId,
        acknowledgedAt: new Date(now.getTime() - 55 * 60 * 1000),
        resolvedAt: null,
        version: 3,
        occurredAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        id: "10000000-0000-4000-8000-000000000002",
        referenceCode: "CW-2026-SOCIAL9",
        trackingKeyHash: hashTrackingKey("SOCIAL-SAFE-DEMO-27X"),
        anonymous: true,
        reporterName: null,
        reporterEmail: null,
        reporterPhone: null,
        category: "IMPERSONATION_SCAM" as const,
        channel: "WHATSAPP" as const,
        title: "WhatsApp account impersonating a department officer",
        description:
          "The account uses a staff photograph and asks finalists to pay an urgent clearance processing fee into a personal account.",
        suspiciousUrl: null,
        senderIdentifier: "+234 800 000 0101",
        impact: "HIGH" as const,
        severity: "CRITICAL" as const,
        status: "NEW" as const,
        tlp: "AMBER" as const,
        assignedToId: null,
        acknowledgedAt: null,
        resolvedAt: null,
        version: 1,
        occurredAt: new Date(now.getTime() - 80 * 60 * 1000),
        createdAt: new Date(now.getTime() - 70 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 70 * 60 * 1000),
      },
      {
        id: "10000000-0000-4000-8000-000000000003",
        referenceCode: "CW-2026-DEVICE8",
        trackingKeyHash: hashTrackingKey("DEVICE-DEMO-SAFE-8K2"),
        anonymous: true,
        reporterName: null,
        reporterEmail: null,
        reporterPhone: null,
        category: "MALWARE" as const,
        channel: "DEVICE" as const,
        title: "Lab computer displaying repeated browser redirects",
        description:
          "A shared computer began opening advertising pages and disabled the browser security warning after a downloaded archive was opened.",
        suspiciousUrl: null,
        senderIdentifier: "Computing laboratory workstation C-14",
        impact: "HIGH" as const,
        severity: "HIGH" as const,
        status: "CONTAINED" as const,
        tlp: "AMBER" as const,
        assignedToId: analystId,
        acknowledgedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        resolvedAt: null,
        version: 4,
        occurredAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 29 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        id: "10000000-0000-4000-8000-000000000004",
        referenceCode: "CW-2026-PORTAL4",
        trackingKeyHash: hashTrackingKey("PORTAL-DEMO-SAFE-4QZ"),
        anonymous: false,
        reporterName: "Bola Demo",
        reporterEmail: "bola.demo@example.test",
        reporterPhone: null,
        category: "SUSPICIOUS_WEBSITE" as const,
        channel: "WEBSITE" as const,
        title: "Lookalike student portal found in a sponsored advert",
        description:
          "The advert points to a domain that copies a university login page and asks for a matriculation number and password.",
        suspiciousUrl: "https://example.test/student-login",
        senderIdentifier: "Sponsored social media advert",
        impact: "MODERATE" as const,
        severity: "MEDIUM" as const,
        status: "RESOLVED" as const,
        tlp: "GREEN" as const,
        assignedToId: analystId,
        acknowledgedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        version: 5,
        occurredAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    await database.insert(incidents).values(sampleIncidents).onConflictDoNothing();

    await database
      .insert(incidentEvents)
      .values([
        {
          id: "20000000-0000-4000-8000-000000000001",
          incidentId: sampleIncidents[0].id,
          actorId: null,
          eventType: "SUBMITTED",
          toStatus: "NEW",
          note: "Your report was received and is awaiting triage.",
          visibleToReporter: true,
          createdAt: sampleIncidents[0].createdAt,
        },
        {
          id: "20000000-0000-4000-8000-000000000002",
          incidentId: sampleIncidents[0].id,
          actorId: analystId,
          eventType: "STATUS_CHANGED",
          fromStatus: "NEW",
          toStatus: "TRIAGED",
          note: "The message has been confirmed as suspicious. Do not interact with it.",
          visibleToReporter: true,
          createdAt: new Date(now.getTime() - 55 * 60 * 1000),
        },
        {
          id: "20000000-0000-4000-8000-000000000003",
          incidentId: sampleIncidents[0].id,
          actorId: analystId,
          eventType: "STATUS_CHANGED",
          fromStatus: "TRIAGED",
          toStatus: "INVESTIGATING",
          note: "The indicator is being compared with other reports.",
          visibleToReporter: true,
          createdAt: new Date(now.getTime() - 30 * 60 * 1000),
        },
        ...sampleIncidents.slice(1).map((incident, index) => ({
          id: `20000000-0000-4000-8000-00000000000${index + 4}`,
          incidentId: incident.id,
          actorId: null,
          eventType: "SUBMITTED" as const,
          toStatus: "NEW" as const,
          note: "Your report was received and is awaiting triage.",
          visibleToReporter: true,
          createdAt: incident.createdAt,
        })),
      ])
      .onConflictDoNothing();

    await database
      .insert(alerts)
      .values([
        {
          id: "30000000-0000-4000-8000-000000000001",
          title: "Watch for fake clearance and fee-payment messages",
          slug: "fake-clearance-fee-payment-messages",
          summary:
            "Messages using urgency, personal bank accounts, or unofficial links should be treated as suspicious.",
          content:
            "Verify every clearance, fee, recruitment, or contract instruction through a known official channel. University officers should never request your password, OTP, recovery code, or payment into an unrelated personal account. Preserve the sender details and report the message before deleting it.",
          severity: "HIGH",
          tlp: "CLEAR",
          status: "PUBLISHED",
          createdById: adminId,
          publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: "30000000-0000-4000-8000-000000000002",
          title: "Protect accounts with unique passwords and MFA",
          slug: "protect-accounts-with-unique-passwords-and-mfa",
          summary:
            "Password reuse turns one compromised service into several compromised accounts.",
          content:
            "Use a unique password for each important account and enable multi-factor authentication where available. If you entered a password on a suspicious page, change it immediately from a trusted device and sign out other sessions.",
          severity: "MEDIUM",
          tlp: "CLEAR",
          status: "PUBLISHED",
          createdById: adminId,
          publishedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        },
      ])
      .onConflictDoNothing();
  });
}
