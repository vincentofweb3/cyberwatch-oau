import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { readSession } from "@/lib/auth/session";
import type { UserRole } from "@/lib/domain";
import { AuthorizationError } from "@/lib/errors";

export type Responder = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export const getCurrentResponder = cache(async (): Promise<Responder | null> => {
  const session = await readSession();

  if (!session) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user?.isActive) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
});

export async function requireResponder(roles: UserRole[] = ["ANALYST", "ADMIN"]) {
  const responder = await getCurrentResponder();

  if (!responder) {
    redirect("/login");
  }

  if (!roles.includes(responder.role)) {
    throw new AuthorizationError();
  }

  return responder;
}

export async function getResponderForAction(roles: UserRole[] = ["ANALYST", "ADMIN"]) {
  const responder = await getCurrentResponder();

  if (!responder || !roles.includes(responder.role)) {
    return null;
  }

  return responder;
}
