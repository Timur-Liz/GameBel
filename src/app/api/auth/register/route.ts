import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { accounts, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, errorResponse, generateRecoveryCode, hashPassword, hashRecovery, ipOf, rateLimited, sessionCookie, validateCredentials } from "@/lib/auth";
import { nameIssue } from "@/lib/authRules";

export const dynamic = "force-dynamic";

// Регистрация: новый аккаунт + привязка прогресса (нового или гостевого)
export async function POST(req: Request) {
  try {
    await ensureSchema();
    const body = (await req.json()) as { login?: string; password?: string; state?: Record<string, unknown>; consent?: boolean; website?: string };
    // ловушка для ботов: скрытое поле должно быть пустым
    if (body.website) return Response.json({ error: "Ошибка регистрации" }, { status: 400 });
    if (body.consent !== true) return Response.json({ error: "Нужно принять Правила и Политику конфиденциальности" }, { status: 400 });
    if (rateLimited("reg:" + ipOf(req), 6, 60 * 60_000)) return Response.json({ error: "Слишком много регистраций с вашего адреса. Попробуйте через час." }, { status: 429 });

    const err = validateCredentials(body.login, body.password);
    if (err) return Response.json({ error: err }, { status: 400 });
    const state = body.state;
    const playerId = typeof state?.id === "string" ? state.id : null;
    if (!state || !playerId || playerId.length > 64 || state.v !== 1) return Response.json({ error: "Нет данных прогресса" }, { status: 400 });
    const name = String(state.name ?? "").trim();
    const nErr = nameIssue(name);
    if (nErr) return Response.json({ error: nErr }, { status: 400 });

    const display = body.login!.trim();
    const login = display.toLowerCase();
    if ((await db.select({ id: accounts.playerId }).from(accounts).where(eq(accounts.login, login)).limit(1)).length) {
      return Response.json({ error: "Такой логин уже занят" }, { status: 409 });
    }
    const linked = await db.select().from(accounts).where(eq(accounts.playerId, playerId)).limit(1);
    if (linked.length) return Response.json({ error: `Этот прогресс уже привязан к аккаунту «${linked[0].displayLogin}». Войдите в него.` }, { status: 409 });

    const xp = Math.max(0, Math.floor(Number(state.xp) || 0));
    const completed = (state.completed ?? {}) as Record<string, unknown>;
    const values = { name: name.slice(0, 40), xp, solved: Object.keys(completed).length, state, updatedAt: new Date() };
    await db.insert(players).values({ id: playerId, ...values }).onConflictDoUpdate({ target: players.id, set: values });

    const recoveryCode = generateRecoveryCode();
    await db.insert(accounts).values({
      playerId,
      login,
      displayLogin: display,
      passwordHash: await hashPassword(body.password!),
      recoveryHash: await hashRecovery(recoveryCode),
      lastLoginAt: new Date(),
    });
    const { token, expiresAt } = await createSession(playerId);
    return Response.json({ ok: true, login: display, recoveryCode }, { headers: { "Set-Cookie": sessionCookie(req, token, expiresAt) } });
  } catch (e) {
    return errorResponse(e);
  }
}
