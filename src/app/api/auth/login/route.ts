import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { accounts, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cleanupExpired, clearFails, createSession, errorResponse, ipOf, rateLimited, registerFail, sessionCookie, tooManyAttempts, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const body = (await req.json()) as { login?: string; password?: string };
    const login = String(body.login ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!login || !password) return Response.json({ error: "Введите логин и пароль" }, { status: 400 });
    if (tooManyAttempts(login) || rateLimited("login:" + ipOf(req), 30, 10 * 60_000)) {
      return Response.json({ error: "Слишком много попыток. Подождите 10 минут." }, { status: 429 });
    }
    const acc = await db.select().from(accounts).where(eq(accounts.login, login)).limit(1);
    if (!acc.length || !(await verifyPassword(password, acc[0].passwordHash))) {
      registerFail(login);
      return Response.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }
    clearFails(login);
    await db.update(accounts).set({ lastLoginAt: new Date() }).where(eq(accounts.playerId, acc[0].playerId));
    cleanupExpired().catch(() => {});
    const p = await db.select().from(players).where(eq(players.id, acc[0].playerId)).limit(1);
    const { token, expiresAt } = await createSession(acc[0].playerId);
    return Response.json({ ok: true, login: acc[0].displayLogin, state: p[0]?.state ?? null }, { headers: { "Set-Cookie": sessionCookie(req, token, expiresAt) } });
  } catch (e) {
    return errorResponse(e);
  }
}
