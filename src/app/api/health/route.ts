import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
  } catch {
    return Response.json(
      { status: "unavailable", service: "cyberwatch-oau" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
  return Response.json(
    {
      status: "ok",
      service: "cyberwatch-oau",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
