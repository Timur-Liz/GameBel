"use client";
import { useState } from "react";
import type { GameState } from "@/game/types";
import { bonuses, PAYDAY_EVERY, RANKS, SHOP, UNIFORMS, rankOf } from "@/game/data";
import { sfx } from "@/game/sound";
import { PlayerToon } from "./Toon";
import { ItemPreview, OfficeRoom, type Tier } from "./OfficeArt";

const TIERS: (Tier & { min: number })[] = [
  { min: 0, name: "Стол в углу общего зала", wall: "#e2e8f0", wall2: "#cbd5e1", floor: "#94a3b8", floor2: "#64748b" },
  { min: 2, name: "Кабинет на двоих (с Зубром)", wall: "#dbeafe", wall2: "#93c5fd", floor: "#b45309", floor2: "#92400e" },
  { min: 4, name: "Личный кабинет", wall: "#ede9fe", wall2: "#c4b5fd", floor: "#a16207", floor2: "#854d0e" },
  { min: 6, name: "Кабинет руководителя", wall: "#fef3c7", wall2: "#9a3412", floor: "#78350f", floor2: "#451a03" },
];

const CAT_LINES = [
  "Мур. Пароль «12345» — это не пароль, человек.",
  "Мяу! Я поймал мышь. Компьютерную.",
  "Байт смотрит на тебя с осуждением: ты опять не включил 2FA.",
  "Мрр… Петрович угостил меня драником.",
  "Байт уснул на клавиатуре и случайно написал отчёт лучше тебя.",
];

export function OfficeView({ s }: { s: GameState }) {
  const r = rankOf(s.xp);
  const tier = [...TIERS].reverse().find((t) => r >= t.min)!;
  const b = bonuses(s);
  const items = SHOP.filter((i) => s.owned.includes(i.id));
  const [said, setSaid] = useState<string | null>(null);
  const plate = `${RANKS[r].short} ${s.name}`.slice(0, 22);
  const onItem = (id: string) => {
    sfx.click();
    if (id === "cat") return setSaid(CAT_LINES[Math.floor(Math.random() * CAT_LINES.length)]);
    if (id === "basic-chair") return setSaid("Старый скрипучий стул. В магазине есть кресло руководителя — с капитанского звания.");
    const it = SHOP.find((x) => x.id === id);
    if (it) setSaid(`${it.name}: ${it.desc}`);
  };
  return (
    <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border-4 border-black bg-slate-200">
        <OfficeRoom owned={s.owned} tier={tier} plate={plate} onItem={onItem} />
        <div className="absolute left-[2%] top-[3%] rounded-md border-[3px] border-black bg-amber-100 px-2 py-1 text-[10px] font-black sm:text-xs">
          {tier.name}
          <div className="text-slate-600">{RANKS[r].short} {s.name}</div>
        </div>
        <div className="pointer-events-none absolute bottom-[1%] left-[19%] w-[19%]">
          <PlayerToon s={s} className="breathe h-auto w-full" mood="happy" />
        </div>
        {items.length === 0 && (
          <div className="absolute right-[3%] top-[40%] max-w-[36%] rounded-xl border-[3px] border-black bg-white p-2 text-xs font-bold sm:text-sm">Пустовато… Загляни в 🛒 Магазин и обустрой рабочее место!</div>
        )}
        {said && (
          <div className="bubble pop-in absolute bottom-[42%] right-[3%] max-w-[44%] cursor-pointer text-xs font-semibold sm:text-sm" onClick={() => setSaid(null)}>{said}</div>
        )}
        <div className="absolute bottom-[2%] right-[2%] rounded-md border-2 border-black bg-white/90 px-2 py-0.5 text-[10px] font-bold">👆 Нажимай на предметы</div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="toon-card bg-white p-4">
          <div className="text-lg font-black">📊 Личное дело</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <Stat label="Звание" value={RANKS[r].short} />
            <Stat label="Оклад" value={`${RANKS[r].salary} BYN / ${PAYDAY_EVERY} дн.`} />
            <Stat label="Раскрыто дел" value={String(Object.keys(s.completed).length)} />
            <Stat label="Вызовов 102" value={String(s.stats.incidents)} />
            <Stat label="Защищено граждан" value={String(s.stats.protectedPeople)} />
            <Stat label="Заработано" value={`${s.stats.earned} BYN`} />
          </div>
        </div>
        <div className="toon-card bg-slate-900 p-4 text-white">
          <div className="font-black text-yellow-300">⚡ Активные бонусы</div>
          <div className="mt-1 text-sm">Опыт: <b>+{Math.round(b.xp * 100)}%</b></div>
          <div className="text-sm">Премии и зарплата: <b>+{Math.round(b.money * 100)}%</b></div>
          <div className="text-sm">Подсказок на дело: <b>{b.hints}</b></div>
          <div className="mt-2 text-xs text-slate-400">Предметов в кабинете: {items.length} / {SHOP.length}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border-2 border-black bg-slate-50 p-2">
      <div className="text-[10px] font-black uppercase text-slate-500">{label}</div>
      <div className="font-black">{value}</div>
    </div>
  );
}

type Upd = (fn: (s: GameState) => GameState) => void;

export function ShopView({ s, update, float }: { s: GameState; update: Upd; float: (t: string) => void }) {
  const r = rankOf(s.xp);
  return (
    <div>
      <div className="toon-card mb-3 flex items-center justify-between bg-amber-100 p-3">
        <div className="font-black">🛒 Магазин «Всё для опера» — обустрой свой кабинет</div>
        <div className="toon-chip bg-white">💰 {s.money} BYN</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SHOP.map((it) => {
          const owned = s.owned.includes(it.id);
          const rankOk = r >= it.minRank;
          const afford = s.money >= it.price;
          return (
            <div key={it.id} className={`toon-card flex gap-3 p-3 ${owned ? "bg-emerald-50" : "bg-white"}`}>
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl border-[3px] border-black bg-gradient-to-b from-sky-100 to-indigo-100 p-1.5">
                <ItemPreview id={it.id} className="h-full w-full" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="font-black leading-tight">{it.name}</div>
                <div className="text-xs text-slate-600">{it.desc}</div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-sm font-black">{it.price} BYN</span>
                  {owned ? (
                    <span className="text-sm font-black text-emerald-600">✓ В кабинете</span>
                  ) : !rankOk ? (
                    <span className="text-xs font-bold text-rose-600">🔒 {RANKS[it.minRank].short}</span>
                  ) : (
                    <button
                      disabled={!afford}
                      onClick={() => {
                        sfx.coin();
                        float(`✨ ${it.name} — в кабинете!`);
                        update((st) => ({ ...st, money: st.money - it.price, owned: [...st.owned, it.id] }));
                      }}
                      className="toon-btn bg-yellow-300 px-3 py-1 text-sm disabled:opacity-40"
                    >
                      Купить
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WardrobeView({ s, update, float }: { s: GameState; update: Upd; float: (t: string) => void }) {
  const r = rankOf(s.xp);
  const [preview, setPreview] = useState(s.uniform);
  const pu = UNIFORMS.find((u) => u.id === preview)!;
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_2fr]">
      <div className="toon-card flex flex-col items-center bg-gradient-to-b from-sky-200 to-indigo-200 p-4">
        <div className="toon-chip bg-white">Примерочная</div>
        <PlayerToon s={s} uniformId={preview} className="breathe mt-2 h-72 w-60" mood="happy" />
        <div className="mt-2 text-xl font-black">{pu.name}</div>
        <div className="text-sm font-bold text-slate-700">{pu.perk}</div>
        <div className="mt-1 text-xs text-slate-600">Погоны отражают ваше звание: {RANKS[r].name}</div>
      </div>
      <div className="grid content-start gap-3 sm:grid-cols-2">
        {UNIFORMS.map((u) => {
          const owned = u.price === 0 || s.owned.includes("u:" + u.id);
          const worn = s.uniform === u.id;
          const rankOk = r >= u.minRank;
          return (
            <div key={u.id} onMouseEnter={() => setPreview(u.id)} onClick={() => setPreview(u.id)} className={`toon-card cursor-pointer p-3 ${worn ? "bg-emerald-100" : preview === u.id ? "bg-yellow-50" : "bg-white"}`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg border-[3px] border-black" style={{ background: `linear-gradient(135deg, ${u.body} 60%, ${u.accent})` }} />
                <div className="flex-1">
                  <div className="font-black">{u.name}</div>
                  <div className="text-xs text-slate-600">{u.perk}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-black">{u.price ? `${u.price} BYN` : "Бесплатно"}</span>
                {worn ? (
                  <span className="text-sm font-black text-emerald-600">✓ Надето</span>
                ) : owned ? (
                  <button onClick={(e) => { e.stopPropagation(); sfx.click(); update((st) => ({ ...st, uniform: u.id })); }} className="toon-btn bg-sky-300 px-3 py-1 text-sm">Надеть</button>
                ) : !rankOk ? (
                  <span className="text-xs font-bold text-rose-600">🔒 с звания «{RANKS[u.minRank].short}»</span>
                ) : (
                  <button
                    disabled={s.money < u.price}
                    onClick={(e) => {
                      e.stopPropagation();
                      sfx.coin();
                      float("👔 Новая форма!");
                      update((st) => ({ ...st, money: st.money - u.price, owned: [...st.owned, "u:" + u.id], uniform: u.id }));
                    }}
                    className="toon-btn bg-yellow-300 px-3 py-1 text-sm disabled:opacity-40"
                  >
                    Купить и надеть
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
