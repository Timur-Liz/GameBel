import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureSchema();
    const s = await getSession(req);
    if (!s) return Response.json({ login: null });
    const p = await db.select().from(players).where(eq(players.id, s.playerId)).limit(1);
    return Response.json({ login: s.login, playerId: s.playerId, state: p[0]?.state ?? null });
  } catch {
    return Response.json({ login: null, offline: true });
  }
}
