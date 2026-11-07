import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { alerts, auditLogs, users } from "@/db/schema";
import { ActionError } from "@/lib/errors";
import { createId, slugify } from "@/lib/identifiers";
import type { CreateAlertInput } from "@/lib/validators";
import { getResponderForAction, requireResponder } from "@/lib/dal/session";

export async function listPublishedAlerts(limit = 20) {
  return db
    .select({
      id: alerts.id,
      title: alerts.title,
      slug: alerts.slug,
      summary: alerts.summary,
      content: alerts.content,
      severity: alerts.severity,
      tlp: alerts.tlp,
      publishedAt: alerts.publishedAt,
      createdAt: alerts.createdAt,
    })
    .from(alerts)
    .where(eq(alerts.status, "PUBLISHED"))
    .orderBy(desc(alerts.publishedAt), desc(alerts.createdAt))
    .limit(limit);
}

export async function listAllAlerts() {
  await requireResponder();
  return db
    .select({
      id: alerts.id,
      title: alerts.title,
      slug: alerts.slug,
      summary: alerts.summary,
      severity: alerts.severity,
      tlp: alerts.tlp,
      status: alerts.status,
      authorName: users.fullName,
      publishedAt: alerts.publishedAt,
      createdAt: alerts.createdAt,
      updatedAt: alerts.updatedAt,
    })
    .from(alerts)
    .leftJoin(users, eq(alerts.createdById, users.id))
    .orderBy(desc(alerts.createdAt));
}

export async function createAlert(input: CreateAlertInput) {
  const actor = await getResponderForAction();

  if (!actor) {
    throw new ActionError("Your session has expired. Sign in again.");
  }

  const baseSlug = slugify(input.title) || `alert-${Date.now()}`;
  const id = createId();
  const now = new Date();

  return db.transaction(async (transaction) => {
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const created = await transaction
        .insert(alerts)
        .values({
          id,
          title: input.title,
          slug,
          summary: input.summary,
          content: input.content,
          severity: input.severity,
          tlp: input.tlp,
          status: input.status,
          createdById: actor.id,
          publishedAt: input.status === "PUBLISHED" ? now : null,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing({ target: alerts.slug })
        .returning({ id: alerts.id });

      if (created.length) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    await transaction.insert(auditLogs).values({
      id: createId(),
      actorId: actor.id,
      action: input.status === "PUBLISHED" ? "alert.published" : "alert.created",
      entityType: "alert",
      entityId: id,
      metadata: { slug, severity: input.severity, tlp: input.tlp },
      createdAt: now,
    });

    return { success: true, slug };
  });
}
