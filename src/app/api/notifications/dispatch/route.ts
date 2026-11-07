import { dispatchNotifications } from "@/lib/notifications/server";
import { validCronAuthorization } from "@/lib/notifications/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!validCronAuthorization(request.headers.get("authorization"), process.env.CRON_SECRET))
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    return Response.json(await dispatchNotifications(), { headers });
  } catch {
    return Response.json({ error: "Email dispatch unavailable" }, { status: 503, headers });
  }
}

// Vercel Cron invokes GET. Both methods require the same server-side secret.
export const GET = POST;
