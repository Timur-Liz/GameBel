// Общие правила регистрации — используются и на сервере, и в браузере

export const LOGIN_RE = /^[a-zA-Z0-9_а-яА-ЯёЁ.-]{3,24}$/;
export const PASSWORD_MIN = 8;

const BANNED = ["хуй", "хуе", "хуё", "пизд", "ебат", "ебан", "ёбан", "бляд", "блят", "сука", "мудак", "гандон", "пидор", "шлюх", "fuck", "shit", "bitch", "nigger", "admin", "админ", "модератор", "moderator", "мвд", "support"];

export function hasBannedWord(text: string) {
  const t = text.toLowerCase().replace(/[^a-zа-яё]/g, "").replace(/ё/g, "е");
  return BANNED.some((b) => t.includes(b.replace(/ё/g, "е")));
}

export function loginIssue(login: string): string | null {
  const l = login.trim();
  if (l.length < 3) return "Логин: минимум 3 символа";
  if (l.length > 24) return "Логин: максимум 24 символа";
  if (!LOGIN_RE.test(l)) return "Логин: только буквы, цифры и знаки _ . -";
  if (hasBannedWord(l)) return "Такой логин использовать нельзя";
  return null;
}

export function nameIssue(name: string): string | null {
  const n = name.trim();
  if (n.length < 2) return "Имя: минимум 2 символа";
  if (n.length > 24) return "Имя: максимум 24 символа";
  if (hasBannedWord(n)) return "Выберите другое имя";
  return null;
}

export interface PwCheck {
  ok: boolean;
  t: string;
  e: string;
}

export function passwordChecks(pw: string, login = ""): PwCheck[] {
  const l = login.trim().toLowerCase();
  return [
    { ok: pw.length >= PASSWORD_MIN, t: `Не короче ${PASSWORD_MIN} символов`, e: `Пароль должен быть не короче ${PASSWORD_MIN} символов` },
    { ok: /[a-zа-яё]/i.test(pw), t: "Есть буквы", e: "Пароль должен содержать буквы" },
    { ok: /\d/.test(pw), t: "Есть цифры", e: "Пароль должен содержать цифры" },
    { ok: pw.length > 0 && (!l || !pw.toLowerCase().includes(l)), t: "Не содержит логин", e: "Пароль не должен содержать логин" },
    { ok: pw.length > 0 && !/^(12345678|password|qwerty123|11111111|00000000|йцукенгш)/i.test(pw), t: "Не из списка самых популярных", e: "Этот пароль слишком популярен — его подберут за секунды" },
  ];
}

export function passwordIssue(pw: string, login = ""): string | null {
  if (pw.length > 128) return "Слишком длинный пароль";
  const bad = passwordChecks(pw, login).find((c) => !c.ok);
  return bad ? bad.e : null;
}

/** 0..4 — оценка силы пароля для индикатора */
export function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= PASSWORD_MIN) s++;
  if (pw.length >= 12) s++;
  if (/[A-ZА-ЯЁ]/.test(pw) && /[a-zа-яё]/.test(pw)) s++;
  if (/[^a-zA-Zа-яА-ЯёЁ0-9]/.test(pw)) s++;
  if (!/\d/.test(pw)) s = Math.min(s, 1);
  return Math.min(4, s);
}

export const normalizeCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");
