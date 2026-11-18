import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { loginIssue, normalizeCode, passwordIssue } from "./authRules";
import { db } from "@/db";
import { accounts, sessions } from "@/db/schema";

const scrypt = promisify(scryptCb) as (pw: string, salt: string, len: number) => Promise<Buffer>;

export const COOKIE = "cs_session";
const SESSION_DAYS = 30;

export function validateCredentials(login: unknown, password: unknown): string | null {
  if (typeof login !== "string") return "Введите логин";
  if (typeof password !== "string") return "Введите пароль";
  return loginIssue(login) ?? passwordIssue(password, login);
}

/** Код восстановления вида ABCD-EFGH-JKLM-NPQR (без похожих символов) */
export function generateRecoveryCode() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(16);
  let out = "";
  for (let i = 0; i < 16; i++) {
    out += A[bytes[i] % A.length];
    if (i % 4 === 3 && i < 15) out += "-";
  }
  return out;
}
export const hashRecovery = (code: string) => hashPassword(normalizeCode(code));
export const verifyRecovery = (code: string, stored: string) => verifyPassword(normalizeCode(code), stored);

export function ipOf(req: Request) {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

/** Удалить сессии игрока (кроме текущей, если указана) и просроченные */
export async function deleteAllSessions(playerId: string, exceptReq?: Request) {
  const keep = exceptReq ? readCookie(exceptReq, COOKIE) : null;
  if (keep) await db.delete(sessions).where(and(eq(sessions.playerId, playerId), ne(sessions.tokenHash, sha(keep))));
  else await db.delete(sessions).where(eq(sessions.playerId, playerId));
}
export async function cleanupExpired() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

/** Понятный ответ, если база недоступна */
export function errorResponse(e: unknown) {
  const msg = String(e);
  const noDb = /ECONNREFUSED|connect|database|does not exist|ENOTFOUND/i.test(msg);
  return Response.json(
    { error: noDb ? "База данных недоступна. Аккаунты работают только с запущенной базой (см. README). Играть можно и гостем." : "Ошибка сервера. Попробуйте позже." },
    { status: noDb ? 503 : 500 },
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, salt, hex] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hex) return false;
  const hash = await scrypt(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  return expected.length === hash.length && timingSafeEqual(expected, hash);
}

const sha = (t: string) => createHash("sha256").update(t).digest("hex");

export async function createSession(playerId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.insert(sessions).values({ tokenHash: sha(token), playerId, expiresAt });
  return { token, expiresAt };
}

function readCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

/** Возвращает id игрока и логин по cookie сессии */
export async function getSession(req: Request): Promise<{ playerId: string; login: string } | null> {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  const rows = await db
    .select({ playerId: sessions.playerId, login: accounts.displayLogin })
    .from(sessions)
    .innerJoin(accounts, eq(accounts.playerId, sessions.playerId))
    .where(and(eq(sessions.tokenHash, sha(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function deleteSession(req: Request) {
  const token = readCookie(req, COOKIE);
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, sha(token)));
}

function isHttps(req: Request) {
  const proto = req.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return new URL(req.url).protocol === "https:";
}

export function sessionCookie(req: Request, token: string, expiresAt: Date) {
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${isHttps(req) ? "; Secure" : ""}`;
}

export function clearCookie(req: Request) {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isHttps(req) ? "; Secure" : ""}`;
}

// Ограничение частоты: не более max действий за окно (в памяти процесса)
const buckets = new Map<string, { n: number; until: number }>();
export function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.until < now) {
    buckets.set(key, { n: 1, until: now + windowMs });
    return false;
  }
  b.n += 1;
  return b.n > max;
}

// Простая защита от перебора паролей (в памяти процесса)
const attempts = new Map<string, { n: number; until: number }>();
export function tooManyAttempts(key: string) {
  const a = attempts.get(key);
  return !!a && a.n >= 8 && a.until > Date.now();
}
export function registerFail(key: string) {
  const a = attempts.get(key);
  const now = Date.now();
  if (!a || a.until < now) attempts.set(key, { n: 1, until: now + 10 * 60_000 });
  else a.n += 1;
}
export function clearFails(key: string) {
  attempts.delete(key);
}
