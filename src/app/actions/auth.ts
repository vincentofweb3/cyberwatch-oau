"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/auth/session";
import { verifyCredentials } from "@/lib/dal/auth";
import { takeRateLimit } from "@/lib/rate-limit";
import { getRequestFingerprint } from "@/lib/request-context";
import { loginSchema } from "@/lib/validators";

export type LoginState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const fingerprint = await getRequestFingerprint("responder-login");
  let rateLimit;
  try {
    rateLimit = await takeRateLimit(fingerprint, 10, 15 * 60 * 1000);
  } catch {
    return { success: false, message: "Sign-in is temporarily unavailable. Try again shortly." };
  }

  if (!rateLimit.allowed) {
    return {
      success: false,
      message: "Too many sign-in attempts. Wait a few minutes and try again.",
    };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      message: "Enter a valid email address and password.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);

  if (!user) {
    return {
      success: false,
      message: "The email address or password is incorrect.",
    };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
