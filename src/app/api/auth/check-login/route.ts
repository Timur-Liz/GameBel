import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ipOf, rateLimited } from "@/lib/auth";
import { loginIssue } from "@/lib/authRules";

export const dynamic = "force-dynamic";

// Проверка, свободен ли логин (для подсказки при регистрации)
export async function GET(req: Request) {
  const login = (new URL(req.url).searchParams.get("login") ?? "").trim();
  const issue = loginIssue(login);
  if (issue) return Response.json({ available: false, reason: issue });
  if (rateLimited("check:" + ipOf(req), 120, 60_000)) return Response.json({ available: null });
  try {
    await ensureSchema();
    const ex = await db.select({ id: accounts.playerId }).from(accounts).where(eq(accounts.login, login.toLowerCase())).limit(1);
    return Response.json({ available: ex.length === 0, reason: ex.length ? "Логин уже занят" : null });
  } catch {
    return Response.json({ available: null });
  }
}
