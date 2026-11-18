import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { accounts, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createSession,
  deleteAllSessions,
  errorResponse,
  generateRecoveryCode,
  hashPassword,
  hashRecovery,
  ipOf,
  rateLimited,
  registerFail,
  sessionCookie,
  tooManyAttempts,
  verifyRecovery,
} from "@/lib/auth";
import { passwordIssue } from "@/lib/authRules";

export const dynamic = "force-dynamic";

// Сброс пароля по коду восстановления. Код одноразовый — выдаётся новый.
export async function POST(req: Request) {
  try {
    await ensureSchema();
    const body = (await req.json()) as { login?: string; code?: string; password?: string };
    const login = String(body.login ?? "").trim().toLowerCase();
    const code = String(body.code ?? "");
    const password = String(body.password ?? "");
    if (!login || !code) return Response.json({ error: "Введите логин и код восстановления" }, { status: 400 });
    if (tooManyAttempts("rec:" + login) || rateLimited("rec:" + ipOf(req), 10, 15 * 60_000)) {
      return Response.json({ error: "Слишком много попыток. Подождите 15 минут." }, { status: 429 });
    }
    const pErr = passwordIssue(password, login);
    if (pErr) return Response.json({ error: pErr }, { status: 400 });
    const acc = await db.select().from(accounts).where(eq(accounts.login, login)).limit(1);
    if (!acc.length || !acc[0].recoveryHash || !(await verifyRecovery(code, acc[0].recoveryHash))) {
      registerFail("rec:" + login);
      return Response.json({ error: "Неверный логин или код восстановления" }, { status: 401 });
    }
    const recoveryCode = generateRecoveryCode();
    await db
      .update(accounts)
      .set({ passwordHash: await hashPassword(password), recoveryHash: await hashRecovery(recoveryCode), passwordChangedAt: new Date(), lastLoginAt: new Date() })
      .where(eq(accounts.playerId, acc[0].playerId));
    await deleteAllSessions(acc[0].playerId);
    const p = await db.select().from(players).where(eq(players.id, acc[0].playerId)).limit(1);
    const { token, expiresAt } = await createSession(acc[0].playerId);
    return Response.json(
      { ok: true, login: acc[0].displayLogin, recoveryCode, state: p[0]?.state ?? null },
      { headers: { "Set-Cookie": sessionCookie(req, token, expiresAt) } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
