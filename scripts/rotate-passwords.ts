import "./env";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "../src/db/connection";
import { getMigrationUrl } from "../src/db/config";
import { users } from "../src/db/schema";

async function main() {
  const credentials: Array<[string, string | undefined]> = [
    ["admin@cyberwatch.local", process.env.NEW_ADMIN_PASSWORD],
    ["analyst@cyberwatch.local", process.env.NEW_ANALYST_PASSWORD],
  ];
  const pending = credentials.filter(([, password]) => password?.trim());
  if (pending.length === 0) {
    throw new Error(
      "Set NEW_ADMIN_PASSWORD and/or NEW_ANALYST_PASSWORD to rotate the local demo accounts.",
    );
  }
  const { db, pool } = createDatabaseConnection(getMigrationUrl(), { max: 1 });
  try {
    for (const [email, password] of pending) {
      const passwordHash = await hash(password!.trim(), 12);
      const updated = await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.email, email))
        .returning({ id: users.id });
      console.log(
        updated.length === 1
          ? `Rotated password for ${email}.`
          : `No account found for ${email}; nothing was changed.`,
      );
    }
  } finally {
    await pool.end();
  }
}

main().catch(() => {
  console.error(
    "Password rotation failed. Check the direct database URL and the NEW_* settings. Credentials were not logged.",
  );
  process.exitCode = 1;
});
