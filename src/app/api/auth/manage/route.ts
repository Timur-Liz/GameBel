import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { accounts, players, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  clearCookie,
  deleteAllSessions,
  errorResponse,
  generateRecoveryCode,
  getSession,
  hashPassword,
  hashRecovery,
  rateLimited,
  verifyPassword,
} from "@/lib/auth";
import { passwordIssue } from "@/lib/authRules";

export const dynamic = "force-dynamic";

type Action = "password" | "recovery" | "logout-all" | "delete";

// Управление аккаунтом (только для вошедших). Опасные действия требуют пароль.
export async function POST(req: Request) {
  try {
    await ensureSchema();
    const s = await getSession(req);
    if (!s) return Response.json({ error: "Войдите в аккаунт" }, { status: 401 });
    const body = (await req.json()) as { action?: Action; password?: string; next?: string };
    if (rateLimited("manage:" + s.playerId, 20, 10 * 60_000)) return Response.json({ error: "Слишком много запросов. Подождите." }, { status: 429 });

    const acc = (await db.select().from(accounts).where(eq(accounts.playerId, s.playerId)).limit(1))[0];
    if (!acc) return Response.json({ error: "Аккаунт не найден" }, { status: 404 });

    if (body.action === "logout-all") {
      await deleteAllSessions(s.playerId, req);
      return Response.json({ ok: true });
    }

    if (!body.password || !(await verifyPassword(body.password, acc.passwordHash))) {
      return Response.json({ error: "Неверный текущий пароль" }, { status: 403 });
    }

    if (body.action === "password") {
      const next = String(body.next ?? "");
      const err = passwordIssue(next, acc.login);
      if (err) return Response.json({ error: err }, { status: 400 });
      if (next === body.password) return Response.json({ error: "Новый пароль совпадает со старым" }, { status: 400 });
      await db.update(accounts).set({ passwordHash: await hashPassword(next), passwordChangedAt: new Date() }).where(eq(accounts.playerId, s.playerId));
      await deleteAllSessions(s.playerId, req); // выйти на других устройствах
      return Response.json({ ok: true });
    }

    if (body.action === "recovery") {
      const recoveryCode = generateRecoveryCode();
      await db.update(accounts).set({ recoveryHash: await hashRecovery(recoveryCode) }).where(eq(accounts.playerId, s.playerId));
      return Response.json({ ok: true, recoveryCode });
    }

    if (body.action === "delete") {
      await db.delete(sessions).where(eq(sessions.playerId, s.playerId));
      await db.delete(accounts).where(eq(accounts.playerId, s.playerId));
      await db.delete(players).where(eq(players.id, s.playerId));
      return Response.json({ ok: true }, { headers: { "Set-Cookie": clearCookie(req) } });
    }

    return Response.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (e) {
    return errorResponse(e);
  }
}
