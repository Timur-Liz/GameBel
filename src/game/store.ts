"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState } from "./types";
import { bonuses, PAYDAY_EVERY, RANKS, rankOf } from "./data";
import { ALL_CASES } from "./incidents";
import { IS_STATIC } from "@/lib/paths";

const KEY = "cybershield_by_save_v1";

export function newState(name: string, gender: "m" | "f"): GameState {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return {
    v: 1,
    id,
    name: name.trim().slice(0, 24) || "Стажёр",
    gender,
    xp: 0,
    money: 100,
    day: 1,
    completed: {},
    owned: [],
    uniform: "hoodie",
    stats: { cases: 0, incidents: 0, mistakes: 0, earned: 0, protectedPeople: 0 },
    lastPayday: 1,
    seenRank: 0,
    introDone: false,
    lessons: [],
    dossier: [],
  };
}

export interface Reward {
  xp: number;
  money: number;
  stars: number;
  pct: number;
  salary: number;
  rankUp: number | null;
  replay: boolean;
}

export function applyCaseResult(s: GameState, caseId: string, pct: number, mistakes: number, calls: { won: number; played: number } = { won: 0, played: 0 }): { next: GameState; reward: Reward } {
  const c = ALL_CASES.find((x) => x.id === caseId)!;
  const b = bonuses(s);
  const prev = s.completed[caseId];
  const replay = !!prev;
  const stars = pct >= 0.9 ? 3 : pct >= 0.65 ? 2 : 1;
  const mult = replay ? 0.25 : 1;
  const xp = Math.round(c.xp * (0.5 + 0.5 * pct) * (1 + b.xp) * mult);
  const money = Math.round(c.money * (0.5 + 0.5 * pct) * (1 + b.money) * mult);
  const before = rankOf(s.xp);
  const next: GameState = {
    ...s,
    xp: s.xp + xp,
    money: s.money + money,
    day: s.day + 1,
    completed: { ...s.completed, [caseId]: { stars: Math.max(stars, prev?.stars ?? 0), best: Math.max(pct, prev?.best ?? 0) } },
    stats: {
      ...s.stats,
      cases: s.stats.cases + (replay ? 0 : 1),
      mistakes: s.stats.mistakes + mistakes,
      earned: s.stats.earned + money,
      protectedPeople: s.stats.protectedPeople + (replay ? 0 : 50 + Math.round(pct * 150)),
      callsWon: (s.stats.callsWon ?? 0) + calls.won,
      callsPlayed: (s.stats.callsPlayed ?? 0) + calls.played,
    },
    lessons: Array.from(new Set([...s.lessons, ...c.lessons])),
    dossier: Array.from(new Set([...s.dossier, ...c.unlocks])),
  };
  const { state: paid, salary } = payday(next);
  const after = rankOf(paid.xp);
  return { next: paid, reward: { xp, money, stars, pct, salary, rankUp: after > before ? after : null, replay } };
}

export function applyIncident(s: GameState, ok: boolean): { next: GameState; xp: number; money: number; salary: number; rankUp: number | null } {
  const b = bonuses(s);
  const xp = ok ? Math.round(25 * (1 + b.xp)) : 5;
  const money = ok ? Math.round(30 * (1 + b.money)) : 0;
  const before = rankOf(s.xp);
  const next: GameState = {
    ...s,
    xp: s.xp + xp,
    money: s.money + money,
    stats: { ...s.stats, incidents: s.stats.incidents + 1, earned: s.stats.earned + money, protectedPeople: s.stats.protectedPeople + (ok ? 1 : 0), mistakes: s.stats.mistakes + (ok ? 0 : 1) },
  };
  // каждые 4 вызова — новый рабочий день
  const n2 = next.stats.incidents % 4 === 0 ? { ...next, day: next.day + 1 } : next;
  const { state, salary } = payday(n2);
  const after = rankOf(state.xp);
  return { next: state, xp, money, salary, rankUp: after > before ? after : null };
}

export function applyCall(s: GameState, mistakes: number): { next: GameState; xp: number; money: number; salary: number } {
  const b = bonuses(s);
  const ok = mistakes === 0;
  const xp = Math.round((ok ? 30 : mistakes <= 1 ? 15 : 5) * (1 + b.xp));
  const money = ok ? Math.round(25 * (1 + b.money)) : 0;
  const next: GameState = {
    ...s,
    xp: s.xp + xp,
    money: s.money + money,
    stats: {
      ...s.stats,
      callsWon: (s.stats.callsWon ?? 0) + (ok ? 1 : 0),
      callsPlayed: (s.stats.callsPlayed ?? 0) + 1,
      earned: s.stats.earned + money,
      protectedPeople: s.stats.protectedPeople + (ok ? 1 : 0),
    },
  };
  const { state, salary } = payday(next);
  return { next: state, xp, money, salary };
}

function payday(s: GameState): { state: GameState; salary: number } {
  if (s.day - s.lastPayday >= PAYDAY_EVERY) {
    const r = rankOf(s.xp);
    const b = bonuses(s);
    const salary = Math.round(RANKS[r].salary * (1 + b.money));
    return { state: { ...s, money: s.money + salary, lastPayday: s.day, stats: { ...s.stats, earned: s.stats.earned + salary } }, salary };
  }
  return { state: s, salary: 0 };
}

export interface AccountInfo {
  login: string | null;
  checked: boolean;
  lost: boolean; // сессия истекла — нужно войти снова
}

type Saved = GameState & { savedAt?: number };

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [account, setAccount] = useState<AccountInfo>({ login: null, checked: false, lost: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSave = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      let local: Saved | null = null;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Saved;
          if (parsed && parsed.v === 1) local = parsed;
        }
      } catch {
        /* ignore */
      }
      let chosen: GameState | null = local;
      let login: string | null = null;
      try {
        if (IS_STATIC) throw new Error("static");
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        const d = (await r.json()) as { login: string | null; playerId?: string; state?: Saved | null };
        if (d.login) {
          login = d.login;
          const server = d.state && d.state.v === 1 ? d.state : null;
          if (server) {
            // берём более свежее сохранение (локальное — только если это тот же профиль)
            const localNewer = local && local.id === server.id && (local.savedAt ?? 0) > (server.savedAt ?? 0);
            chosen = localNewer ? local : server;
          }
        }
      } catch {
        /* офлайн — играем локально */
      }
      if (cancelled) return;
      setState(chosen);
      setAccount({ login, checked: true, lost: false });
      setLoaded(true);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    const savedAt = Date.now();
    const toSave: Saved = { ...state, savedAt };
    try {
      localStorage.setItem(KEY, JSON.stringify(toSave));
    } catch {
      /* ignore */
    }
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    if (IS_STATIC) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: state.id,
          name: state.name,
          xp: state.xp,
          rank: RANKS[rankOf(state.xp)].short,
          solved: Object.keys(state.completed).length,
          achievements: (state.achievements ?? []).length,
          classCode: state.classCode ?? null,
          state: toSave,
        }),
      })
        .then((r) => {
          if (r.status === 401) setAccount((a) => ({ ...a, login: null, lost: true }));
        })
        .catch(() => {});
    }, 800);
  }, [state]);

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setState((s) => (s ? fn(s) : s));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    setState(null);
  }, []);

  /** Зарегистрировать аккаунт с указанным прогрессом (новым или гостевым). Состояние не меняет. */
  const registerState = useCallback(
    async (st: GameState, login: string, password: string, consent: boolean, website = ""): Promise<{ error?: string; recoveryCode?: string }> => {
      try {
        const r = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login, password, consent, website, state: { ...st, savedAt: Date.now() } }),
        });
        const d = await r.json();
        if (!r.ok) return { error: d.error ?? "Ошибка регистрации" };
        setAccount({ login: d.login, checked: true, lost: false });
        return { recoveryCode: d.recoveryCode };
      } catch {
        return { error: "Нет связи с сервером" };
      }
    },
    [],
  );

  /** Принять прогресс (после регистрации/восстановления) */
  const adopt = useCallback((st: GameState) => setState(st), []);

  /** Сброс пароля по коду восстановления */
  const recover = useCallback(async (login: string, code: string, password: string): Promise<{ error?: string; recoveryCode?: string; state?: GameState }> => {
    try {
      const r = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, code, password }),
      });
      const d = await r.json();
      if (!r.ok) return { error: d.error ?? "Ошибка" };
      setAccount({ login: d.login, checked: true, lost: false });
      return { recoveryCode: d.recoveryCode, state: d.state ?? undefined };
    } catch {
      return { error: "Нет связи с сервером" };
    }
  }, []);

  /** Управление аккаунтом: смена пароля, новый код, выход везде, удаление */
  const manage = useCallback(
    async (action: "password" | "recovery" | "logout-all" | "delete", password?: string, next?: string): Promise<{ error?: string; recoveryCode?: string }> => {
      try {
        const r = await fetch("/api/auth/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, password, next }),
        });
        const d = await r.json();
        if (!r.ok) return { error: d.error ?? "Ошибка" };
        if (action === "delete") {
          localStorage.removeItem(KEY);
          skipSave.current = true;
          setAccount({ login: null, checked: true, lost: false });
          setState(null);
        }
        return { recoveryCode: d.recoveryCode };
      } catch {
        return { error: "Нет связи с сервером" };
      }
    },
    [],
  );

  /** Войти в аккаунт и загрузить его прогресс */
  const signIn = useCallback(async (login: string, password: string): Promise<string | null> => {
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const d = await r.json();
      if (!r.ok) return d.error ?? "Ошибка входа";
      if (!d.state || d.state.v !== 1) return "В аккаунте нет сохранённого прогресса";
      skipSave.current = true;
      setState(d.state as GameState);
      setAccount({ login: d.login, checked: true, lost: false });
      return null;
    } catch {
      return "Нет связи с сервером";
    }
  }, []);

  /** Выйти: прогресс остаётся в аккаунте, локальная копия удаляется */
  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    localStorage.removeItem(KEY);
    setAccount({ login: null, checked: true, lost: false });
    setState(null);
  }, []);

  return { state, setState, update, loaded, reset, account, registerState, adopt, recover, manage, signIn, signOut };
}

export function fill(text: string, s: GameState) {
  return text.replaceAll("{name}", s.name).replaceAll("{rank}", RANKS[rankOf(s.xp)].short.toLowerCase());
}
