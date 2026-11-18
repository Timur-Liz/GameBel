import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { accounts, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { hasBannedWord } from "@/lib/authRules";

/** Если профиль привязан к аккаунту — доступ только владельцу с активной сессией */
async function allowed(req: Request, id: string) {
  const acc = await db.select({ id: accounts.playerId }).from(accounts).where(eq(accounts.playerId, id)).limit(1);
  if (!acc.length) return true;
  const s = await getSession(req);
  return s?.playerId === id;
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  try {
    await ensureSchema();
    if (!(await allowed(req, id))) return Response.json({ error: "auth required" }, { status: 401 });
    const rows = await db.select().from(players).where(eq(players.id, id)).limit(1);
    if (!rows.length) return Response.json({ state: null });
    return Response.json({ state: rows[0].state });
  } catch {
    return Response.json({ state: null, offline: true });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const body = (await req.json()) as {
      id?: string;
      name?: string;
      xp?: number;
      rank?: string;
      solved?: number;
      achievements?: number;
      classCode?: string | null;
      state?: unknown;
    };
    if (!body.id || typeof body.id !== "string" || body.id.length > 64 || !body.state) {
      return Response.json({ error: "bad payload" }, { status: 400 });
    }
    if (!(await allowed(req, body.id))) return Response.json({ error: "auth required" }, { status: 401 });
    const rawName = String(body.name ?? "Стажёр").slice(0, 40);
    const name = hasBannedWord(rawName) ? "Стажёр" : rawName;
    const xp = Math.max(0, Math.min(1_000_000, Math.floor(Number(body.xp) || 0)));
    const rank = String(body.rank ?? "Стажёр").slice(0, 60);
    const solved = Math.max(0, Math.floor(Number(body.solved) || 0));
    const achievements = Math.max(0, Math.floor(Number(body.achievements) || 0));
    const classCode = body.classCode ? String(body.classCode).toUpperCase().slice(0, 12) : null;
    const values = { name, xp, rank, solved, achievements, classCode, state: body.state, updatedAt: new Date() };
    await db
      .insert(players)
      .values({ id: body.id, ...values })
      .onConflictDoUpdate({ target: players.id, set: values });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
