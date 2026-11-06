"use server";

import { revalidatePath } from "next/cache";
import { createAlert } from "@/lib/dal/alerts";
import { ActionError } from "@/lib/errors";
import { createAlertSchema } from "@/lib/validators";

export type AlertFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createAlertAction(
  _previousState: AlertFormState,
  formData: FormData,
): Promise<AlertFormState> {
  const parsed = createAlertSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      message: "Review the alert details and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await createAlert(parsed.data);
    revalidatePath("/");
    revalidatePath("/alerts");
    revalidatePath("/dashboard/alerts");
    return {
      success: true,
      message: `Alert saved as ${result.slug}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof ActionError ? error.message : "The alert could not be saved.",
    };
  }
}
