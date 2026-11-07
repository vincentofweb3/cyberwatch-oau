import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { incidents } from "@/db/schema";
import { readNotificationConfig } from "./message";
import { processNotificationBatch } from "./worker";

export async function dispatchNotifications(incidentId?: string) {
  const config = readNotificationConfig(process.env);
  if (!config) return { disabled: true as const };
  return processNotificationBatch(db, config, { incidentId, limit: incidentId ? 1 : 3 });
}

export async function dispatchAfterReport(referenceCode: string) {
  try {
    if (process.env.REPORT_NOTIFICATIONS_ENABLED !== "true") return;
    const [report] = await db
      .select({ id: incidents.id })
      .from(incidents)
      .where(eq(incidents.referenceCode, referenceCode));
    if (report) await dispatchNotifications(report.id);
    // Opportunistically process older due jobs too. Scheduled dispatch covers quiet periods.
    await dispatchNotifications();
  } catch {
    console.error("Report email dispatch could not finish; its saved notification can be retried.");
  }
}
