import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/domain";

const SESSION_COOKIE = "cyberwatch_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

export type SessionPayload = {
  userId: string;
  role: UserRole;
};

function getEncodedSecret() {
  const configured = process.env.SESSION_SECRET;

  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }

  const secret = configured || "cyberwatch-local-development-secret-change-before-deploy";
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .setIssuer("cyberwatch-oau")
    .setAudience("cyberwatch-responders")
    .sign(getEncodedSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
      algorithms: ["HS256"],
      issuer: "cyberwatch-oau",
      audience: "cyberwatch-responders",
    });

    if (typeof payload.userId !== "string") {
      return null;
    }

    if (payload.role !== "ANALYST" && payload.role !== "ADMIN") {
      return null;
    }

    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
