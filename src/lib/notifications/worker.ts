import { randomUUID } from "node:crypto";
import { and, asc, eq, lte, lt, or } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { incidents, rateLimits, reportNotifications, schema } from "../../db/schema";
import { reportEmail, type NotificationConfig } from "./message";
import { sendResendEmail } from "./resend";

const MAX_ATTEMPTS = 6;
const RETRY_DELAYS = [60_000, 300_000, 900_000, 3_600_000, 14_400_000];
// Resend retains keys for 24 hours. Stop before expiry if an earlier outcome is uncertain.
const SAFE_RETRY_WINDOW = 23 * 60 * 60 * 1000;

export async function processNotificationBatch<T extends PgQueryResultHKT>(
  db: PgDatabase<T, typeof schema>,
  config: NotificationConfig,
  options: {
    limit?: number;
    incidentId?: string;
    now?: () => Date;
    send?: typeof sendResendEmail;
  } = {},
) {
  const now = options.now ?? (() => new Date());
  const send = options.send ?? sendResendEmail;
  const result = { accepted: 0, retrying: 0, failed: 0, review: 0 };
  const limit = Math.min(Math.max(options.limit ?? 3, 1), 3);
  await db.delete(rateLimits).where(lt(rateLimits.resetAt, new Date(now().getTime() - 86_400_000)));
  for (let index = 0; index < limit; index++) {
    const job = await db.transaction(async (transaction) => {
      const time = now();
      const [candidate] = await transaction
        .select()
        .from(reportNotifications)
        .where(
          and(
            options.incidentId ? eq(reportNotifications.incidentId, options.incidentId) : undefined,
            or(
              and(
                eq(reportNotifications.status, "PENDING"),
                lte(reportNotifications.nextAttemptAt, time),
              ),
              and(
                eq(reportNotifications.status, "PROCESSING"),
                lte(reportNotifications.lockedUntil, time),
              ),
            ),
          ),
        )
        .orderBy(asc(reportNotifications.createdAt))
        .limit(1)
        .for("update", { skipLocked: true });
      if (!candidate) return null;
      if (
        candidate.attempts >= MAX_ATTEMPTS ||
        (candidate.firstAttemptAt &&
          time.getTime() - candidate.firstAttemptAt.getTime() >= SAFE_RETRY_WINDOW)
      ) {
        await transaction
          .update(reportNotifications)
          .set({
            status: "NEEDS_REVIEW",
            lockedUntil: null,
            lockToken: null,
            lastError: "retry_safety_limit",
            updatedAt: time,
          })
          .where(eq(reportNotifications.id, candidate.id));
        return { review: true as const };
      }
      const [report] = await transaction
        .select({
          id: incidents.id,
          referenceCode: incidents.referenceCode,
          category: incidents.category,
          severity: incidents.severity,
          createdAt: incidents.createdAt,
        })
        .from(incidents)
        .where(eq(incidents.id, candidate.incidentId));
      if (!report) throw new Error("Notification report is missing.");
      const token = randomUUID();
      const payload = candidate.payload ?? reportEmail(config, report);
      await transaction
        .update(reportNotifications)
        .set({
          status: "PROCESSING",
          payload,
          attempts: candidate.attempts + 1,
          firstAttemptAt: candidate.firstAttemptAt ?? time,
          lockedUntil: new Date(time.getTime() + 60_000),
          lockToken: token,
          updatedAt: time,
        })
        .where(eq(reportNotifications.id, candidate.id));
      return {
        review: false as const,
        id: candidate.id,
        token,
        payload,
        attempts: candidate.attempts + 1,
      };
    });
    if (!job) break;
    if (job.review) {
      result.review++;
      continue;
    }
    const response = await send(config.apiKey, job.payload, `report-notification/${job.id}`);
    const finishedAt = now();
    const status = response.ok
      ? "ACCEPTED"
      : !response.retryable
        ? "FAILED"
        : job.attempts >= MAX_ATTEMPTS
          ? "NEEDS_REVIEW"
          : "PENDING";
    // A late worker may not overwrite a newer worker's claim.
    const updated = await db
      .update(reportNotifications)
      .set({
        status,
        lockedUntil: null,
        lockToken: null,
        updatedAt: finishedAt,
        ...(response.ok
          ? { providerMessageId: response.id, acceptedAt: finishedAt, lastError: null }
          : {
              lastError: response.code,
              nextAttemptAt: new Date(
                finishedAt.getTime() + (RETRY_DELAYS[job.attempts - 1] ?? 14_400_000),
              ),
            }),
      })
      .where(and(eq(reportNotifications.id, job.id), eq(reportNotifications.lockToken, job.token)))
      .returning({ id: reportNotifications.id });
    if (!updated.length) continue;
    if (status === "ACCEPTED") result.accepted++;
    else if (status === "FAILED") result.failed++;
    else if (status === "NEEDS_REVIEW") result.review++;
    else result.retrying++;
  }
  return result;
}
