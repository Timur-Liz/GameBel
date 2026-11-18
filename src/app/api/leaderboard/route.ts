import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { players } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const rows = await db
      .select({ id: players.id, name: players.name, xp: players.xp, rank: players.rank, solved: players.solved })
      .from(players)
      .orderBy(desc(players.xp))
      .limit(20);
    return Response.json({ rows });
  } catch {
    return Response.json({ rows: [] });
  }
}
