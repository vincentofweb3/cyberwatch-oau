"use server";

import { revalidatePath } from "next/cache";
import { updateIncident } from "@/lib/dal/incidents";
import { ActionError } from "@/lib/errors";
import { incidentUpdateSchema } from "@/lib/validators";

export type IncidentUpdateState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateIncidentAction(
  _previousState: IncidentUpdateState,
  formData: FormData,
): Promise<IncidentUpdateState> {
  const parsed = incidentUpdateSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      message: "Review the incident update and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await updateIncident(parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/incidents");
    revalidatePath(`/dashboard/incidents/${parsed.data.incidentId}`);
    revalidatePath("/track");
    return {
      success: result.success,
      message: `${result.referenceCode} was updated successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof ActionError
          ? error.message
          : "The incident could not be updated. Refresh and try again.",
    };
  }
}
