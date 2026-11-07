"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { retryReportNotification } from "@/lib/dal/notifications";
import { ActionError } from "@/lib/errors";

export type NotificationActionState = { message?: string };

export async function retryNotificationAction(
  _state: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  const parsed = z.uuid().safeParse(formData.get("incidentId"));
  if (!parsed.success) return { message: "Invalid report." };
  try {
    const result = await retryReportNotification(parsed.data);
    revalidatePath(`/dashboard/incidents/${parsed.data}`);
    return {
      message:
        "disabled" in result
          ? "Email delivery is disabled in this environment."
          : result.accepted
            ? "Resend accepted the notification. Check the receiving inbox."
            : "Delivery status checked. Pending emails retry when their waiting period ends.",
    };
  } catch (error) {
    return {
      message:
        error instanceof ActionError
          ? error.message
          : "Email delivery is unavailable. The report is still saved.",
    };
  }
}
