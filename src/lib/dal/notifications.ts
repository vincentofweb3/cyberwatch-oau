import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { reportNotifications } from "@/db/schema";
import { requireResponder, getResponderForAction } from "./session";
import { dispatchNotifications } from "../notifications/server";
import { ActionError } from "../errors";

export async function getReportNotification(incidentId: string) {
  await requireResponder();
  const [notification] = await db
    .select({
      status: reportNotifications.status,
      attempts: reportNotifications.attempts,
      acceptedAt: reportNotifications.acceptedAt,
      nextAttemptAt: reportNotifications.nextAttemptAt,
      lastError: reportNotifications.lastError,
    })
    .from(reportNotifications)
    .where(eq(reportNotifications.incidentId, incidentId))
    .limit(1);
  return {
    notification: notification ?? null,
    enabled: process.env.REPORT_NOTIFICATIONS_ENABLED === "true",
  };
}

export async function retryReportNotification(incidentId: string) {
  if (!(await getResponderForAction()))
    throw new ActionError("Your session has expired. Sign in again.");
  return dispatchNotifications(incidentId);
}
