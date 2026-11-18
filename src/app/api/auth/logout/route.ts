import { ensureSchema } from "@/db/ensure";
import { clearCookie, deleteSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureSchema();
    await deleteSession(req);
  } catch {
    /* ignore */
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearCookie(req) } });
}
