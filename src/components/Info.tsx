"use client";
import { useEffect, useState } from "react";
import type { GameState } from "@/game/types";
import { CHARACTERS, PAYDAY_EVERY, RANKS, rankOf } from "@/game/data";
import { Portrait, PlayerToon } from "./Toon";
import { IS_STATIC } from "@/lib/paths";

export function CareerView({ s }: { s: GameState }) {
  const r = rankOf(s.xp);
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_2fr]">
      <div className="toon-card flex flex-col items-center bg-gradient-to-b from-amber-100 to-amber-200 p-4">
        <div className="toon-chip bg-white">Ваше звание</div>
        <PlayerToon s={s} className="breathe h-64 w-52" />
        <div className="caption-text text-center text-2xl">{RANKS[r].name.toUpperCase()}</div>
        <div className="mt-1 text-sm font-bold">Опыт: {s.xp} XP</div>
        <div className="mt-2 text-xs text-center text-slate-600">Звания присваиваются автоматически за опыт: раскрывайте дела и принимайте вызовы 102. Зарплата начисляется каждые {PAYDAY_EVERY} дня службы.</div>
      </div>
      <div className="flex flex-col-reverse gap-2">
        {RANKS.map((rk, i) => {
          const cur = i === r;
          const done = i < r;
          return (
            <div key={rk.name} className={`toon-card flex gap-3 p-3 ${cur ? "bg-yellow-200" : done ? "bg-emerald-50" : "bg-white opacity-90"}`}>
              <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg border-[3px] border-black bg-blue-900 py-2">
                {rk.stars === 0 ? <span className="text-xs font-black text-white">—</span> : (
                  <div className={`flex ${rk.big ? "flex-col" : "flex-wrap justify-center"} gap-0.5`}>
                    {Array.from({ length: rk.stars }).map((_, k) => <span key={k} className={rk.big ? "text-lg leading-none" : "text-xs leading-none"}>⭐</span>)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black">{rk.name}</span>
                  {cur && <span className="toon-chip bg-white py-0 text-xs">ВЫ ЗДЕСЬ</span>}
                  {done && <span className="text-xs font-bold text-emerald-700">✓ пройдено</span>}
                </div>
                <div className="text-xs font-bold text-slate-600">от {rk.xp} XP · оклад {rk.salary} BYN</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {rk.perms.map((p) => <span key={p} className="rounded-md border-2 border-black bg-white px-1.5 text-[11px] font-semibold">{i <= r ? "🔓" : "🔒"} {p}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DossierView({ s }: { s: GameState }) {
  const [open, setOpen] = useState<string | null>(null);
  const groups: { kind: "colleague" | "criminal" | "citizen"; title: string }[] = [
    { kind: "colleague", title: "👮 Коллеги" },
    { kind: "criminal", title: "🦹 Преступники" },
    { kind: "citizen", title: "🧑‍🤝‍🧑 Граждане" },
  ];
  const sel = open ? CHARACTERS[open] : null;
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g.kind}>
          <div className="caption-text mb-2 text-xl">{g.title}</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {Object.values(CHARACTERS).filter((c) => c.kind === g.kind).map((c) => {
              const known = s.dossier.includes(c.id);
              return (
                <button key={c.id} disabled={!known} onClick={() => setOpen(c.id)} className="toon-card group overflow-hidden bg-white text-left disabled:cursor-not-allowed">
                  <div className="relative h-28 overflow-hidden" style={{ background: known ? c.color + "33" : "#1e293b" }}>
                    {known ? <Portrait id={c.id} s={s} className="absolute inset-x-0 -bottom-2 mx-auto h-32 w-full transition group-hover:scale-110" /> : <div className="grid h-full place-items-center text-4xl text-white">❓</div>}
                    {g.kind === "criminal" && known && <div className="absolute right-1 top-1 rotate-12 rounded border-2 border-red-700 bg-white px-1 text-[9px] font-black text-red-700">ЗАДЕРЖАН</div>}
                  </div>
                  <div className="border-t-[3px] border-black p-1.5 text-xs font-black leading-tight">{known ? c.name : "???"}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {sel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setOpen(null)}>
          <div className="toon-card pop-in grid w-full max-w-2xl gap-4 bg-amber-50 p-5 sm:grid-cols-[200px_1fr]" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-xl border-[3px] border-black" style={{ background: sel.color + "33" }}>
              <Portrait id={sel.id} s={s} className="h-64 w-full" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-slate-500">Досье</div>
              <div className="text-2xl font-black">{sel.name}</div>
              <div className="text-sm font-bold" style={{ color: sel.color }}>{sel.role}</div>
              <p className="mt-2 text-sm">{sel.bio}</p>
              <div className="bubble mt-3 text-sm font-semibold italic">«{sel.quote}»</div>
              <button onClick={() => setOpen(null)} className="toon-btn mt-4 bg-white">Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MemoView({ s }: { s: GameState }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="toon-card bg-rose-100 p-4">
        <div className="caption-text text-2xl">🚨 ЕСЛИ ВАС ОБМАНУЛИ</div>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-semibold">
          <li>Заблокируйте карту в приложении банка или по номеру с обратной стороны карты.</li>
          <li>Позвоните в милицию: <b>102</b> (с мобильного тоже 102).</li>
          <li>Сохраните скриншоты, номера, ссылки, чеки переводов.</li>
          <li>Смените пароли, включите двухфакторную аутентификацию.</li>
          <li>Предупредите близких — мошенники часто пишут им от вашего имени.</li>
        </ol>
        <div className="mt-3 rounded-xl border-[3px] border-black bg-white p-3 text-sm">
          <b>Золотое правило Петровича:</b> никому не называйте коды из SMS, CVV, пароли. Ни «банку», ни «милиции», ни «Нацбанку». Настоящие сотрудники их никогда не спрашивают.
        </div>
      </div>
      <div className="toon-card bg-white p-4">
        <div className="caption-text text-2xl">📌 ЧЕМУ ВЫ НАУЧИЛИСЬ</div>
        {s.lessons.length === 0 ? (
          <div className="mt-2 text-sm text-slate-500">Раскройте первое дело — здесь появятся правила кибербезопасности.</div>
        ) : (
          <ul className="mt-2 space-y-1">
            {s.lessons.map((l) => <li key={l} className="rounded-lg border-2 border-black bg-yellow-50 px-2 py-1 text-sm font-semibold">✅ {l}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

interface Row { id: string; name: string; xp: number; rank: string; solved: number }

export function LeaderboardView({ s, onReset }: { s: GameState; onReset: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      if (IS_STATIC) return setRows([]);
      fetch("/api/leaderboard").then((r) => r.json()).then((d: { rows: Row[] }) => setRows(d.rows)).catch(() => setRows([]));
    }, 900);
    return () => clearTimeout(t);
  }, []);
  if (IS_STATIC)
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-3">
        <div className="toon-card bg-white p-5">
          <div className="caption-text text-2xl text-slate-900">⚙️ НАСТРОЙКИ</div>
          <div className="mt-2 text-sm">💾 Прогресс автоматически сохраняется в этом браузере. Если очистить данные браузера или открыть игру на другом устройстве — карьера начнётся заново.</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border-2 border-black bg-slate-50 p-2"><div className="text-[10px] font-black uppercase text-slate-500">Сотрудник</div><div className="font-black">{s.name}</div></div>
            <div className="rounded-lg border-2 border-black bg-slate-50 p-2"><div className="text-[10px] font-black uppercase text-slate-500">Опыт</div><div className="font-black">{s.xp} XP</div></div>
          </div>
        </div>
        <button onClick={onReset} className="toon-btn mx-auto bg-rose-200 text-sm">🔄 Начать карьеру заново</button>
      </div>
    );
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      <div className="toon-card bg-slate-900 p-4 text-white">
        <div className="caption-text text-2xl">🏆 ЛУЧШИЕ ОПЕРА БЕЛАРУСИ</div>
        <div className="text-sm text-slate-300">{IS_STATIC ? "Рейтинг доступен только в онлайн-версии с сервером" : "Рейтинг сотрудников по опыту (сохраняется на сервере)"}</div>
      </div>
      <div className="toon-card overflow-hidden bg-white">
        {rows === null && <div className="p-4 text-center font-bold">Загрузка…</div>}
        {rows?.length === 0 && <div className="p-4 text-center font-bold">Пока пусто. Будь первым!</div>}
        {rows?.map((r, i) => (
          <div key={r.id} className={`flex items-center gap-3 border-b-2 border-black/10 px-4 py-2 ${r.id === s.id ? "bg-yellow-200" : ""}`}>
            <div className="w-8 text-center text-xl font-black">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</div>
            <div className="flex-1">
              <div className="font-black">{r.name} {r.id === s.id && "(вы)"}</div>
              <div className="text-xs font-bold text-slate-500">{r.rank} · дел раскрыто: {r.solved}</div>
            </div>
            <div className="font-black text-indigo-700">{r.xp} XP</div>
          </div>
        ))}
      </div>
      <button onClick={onReset} className="toon-btn mx-auto bg-rose-200 text-sm">🔄 Начать карьеру заново</button>
    </div>
  );
}
