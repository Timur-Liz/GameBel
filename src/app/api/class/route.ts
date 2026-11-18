import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { classes, players } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPH[Math.floor(Math.random() * ALPH.length)];
  return s;
}

// Информация о классе + рейтинг учеников
export async function GET(req: Request) {
  const code = (new URL(req.url).searchParams.get("code") ?? "").toUpperCase().trim();
  if (!code) return Response.json({ error: "code required" }, { status: 400 });
  try {
    await ensureSchema();
    const cls = await db.select().from(classes).where(eq(classes.code, code)).limit(1);
    if (!cls.length) return Response.json({ error: "Класс не найден" }, { status: 404 });
    const rows = await db
      .select({ id: players.id, name: players.name, xp: players.xp, rank: players.rank, solved: players.solved, achievements: players.achievements, updatedAt: players.updatedAt })
      .from(players)
      .where(eq(players.classCode, code))
      .orderBy(desc(players.xp))
      .limit(200);
    return Response.json({ class: cls[0], rows });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// Создание класса учителем
export async function POST(req: Request) {
  try {
    await ensureSchema();
    const body = (await req.json()) as { name?: string; teacher?: string };
    const name = String(body.name ?? "").trim().slice(0, 60);
    const teacher = String(body.teacher ?? "").trim().slice(0, 60);
    if (!name || !teacher) return Response.json({ error: "Укажите название класса и имя учителя" }, { status: 400 });
    for (let i = 0; i < 6; i++) {
      const code = genCode();
      const ex = await db.select().from(classes).where(eq(classes.code, code)).limit(1);
      if (ex.length) continue;
      await db.insert(classes).values({ code, name, teacher });
      return Response.json({ code, name, teacher });
    }
    return Response.json({ error: "Не удалось создать код" }, { status: 500 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
