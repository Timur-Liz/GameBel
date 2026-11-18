"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameState } from "@/game/types";
import { CHARACTERS, PAYDAY_EVERY, RANKS, REGION_RANK, rankOf } from "@/game/data";
import { ALL_CASES, CASES, INCIDENTS, SIDE_CASES, randomIncidents } from "@/game/incidents";
import { caseStatus } from "@/game/status";
import { newAchievements } from "@/game/achievements";
import { AchievementsView, CallTrainerModal, ClassView, StoriesView } from "./Extra";
import { AccountButton, AccountModal, LoginForm, RecoverForm, RecoveryCodeCard, RegisterForm, type RegisterData } from "./Account";
import type { AccountInfo } from "@/game/store";
import { asset, IS_STATIC } from "@/lib/paths";
import { CITIES, type RegionId } from "@/game/mapData";
import { applyCall, applyCaseResult, applyIncident, fill, newState, useGameState } from "@/game/store";
import { isMuted, setMuted, sfx } from "@/game/sound";
import { BelarusMap, type CityMarker } from "./BelarusMap";
import { CasePlayer, VoiceToggle } from "./CasePlayer";
import { PlayerToon, Portrait } from "./Toon";
import { BigCaption, SceneBg } from "./Scene";
import { OfficeView, ShopView, WardrobeView } from "./Office";
import { CareerView, DossierView, LeaderboardView, MemoView } from "./Info";

type Tab = "map" | "stories" | "office" | "shop" | "wardrobe" | "career" | "medals" | "dossier" | "memo" | "class" | "top";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "map", label: "Карта дел", icon: "🗺️" },
  { id: "stories", label: "Истории", icon: "💬" },
  { id: "office", label: "Кабинет", icon: "🏢" },
  { id: "shop", label: "Магазин", icon: "🛒" },
  { id: "wardrobe", label: "Гардероб", icon: "👔" },
  { id: "career", label: "Звания", icon: "🎖️" },
  { id: "medals", label: "Медали", icon: "🏅" },
  { id: "dossier", label: "Досье", icon: "🗂️" },
  { id: "memo", label: "Памятка", icon: "📌" },
  { id: "class", label: "Класс", icon: "🏫" },
  { id: "top", label: "Рейтинг", icon: "🏆" },
];

const CHATTER: { who: string; text: string; need?: string }[] = [
  { who: "alesya", text: "Кто опять трогал мой энергетик?!" },
  { who: "alesya", text: "Совет дня: обновляй систему и приложения. Серьёзно. Обновляй." },
  { who: "alesya", text: "«123456» до сих пор самый популярный пароль в мире. Человечество, ну вы чего." },
  { who: "zubr", text: "{name}, пошли после смены в спортзал! Сделаю из тебя оперативника." },
  { who: "zubr", text: "Я сегодня дверь с первого раза выбил. Правда, не ту." },
  { who: "zubr", text: "Мой Пассат опять эвакуировали. Я же на двух местах всего стоял!" },
  { who: "kravets", text: "Помни: мошенник всегда торопит. А ты — не торопись." },
  { who: "kravets", text: "В мои годы фишинг был только на рыбалке. На Нарочи." },
  { who: "kravets", text: "Чай остыл. Опять. Кто-нибудь, подарите мне кофемашину… нет, лучше самовар." },
  { who: "babushka", text: "Сыночек, ты покушал? Я драников через Зубра передала!", need: "sms-code" },
  { who: "babushka", text: "Мне опять «банк» звонил! А я трубку положила, как ты учил! 💪", need: "sms-code" },
  { who: "stalnaya", text: "{rank} {name}, отчёт по делам — к пятнице. Без опечаток." },
  { who: "alesya", text: "Нашла в даркнете объявление «Куплю карты студентов». Аист, ты ли это…", need: "drop" },
  { who: "zubr", text: "Если увидишь в Telegram «лёгкий заработок» — это не заработок. Это статья.", need: "drop" },
  { who: "zubr", text: "У меня теперь 2FA! Каждый раз код из приложения ввожу. Чувствую себя хакером.", need: "side-zubr" },
  { who: "alesya", text: "Дима опять принёс кофе из автомата. Ужасный. Обожаю.", need: "side-alesya" },
  { who: "babushka", text: "Мишка теперь всем друзьям рассказывает про двухфакторную… как её… аутентификацию!", need: "side-babushka" },
  { who: "kravets", text: "Позвонили «из Нацбанка». Я попросил перезвонить через Стальную. Больше не звонят.", need: "cascade" },
];

function Hud({ s, onMute, muted, account, onAccount }: { s: GameState; onMute: () => void; muted: boolean; account: AccountInfo; onAccount: () => void }) {
  const r = rankOf(s.xp);
  const cur = RANKS[r];
  const nxt = RANKS[r + 1];
  const pct = nxt ? ((s.xp - cur.xp) / (nxt.xp - cur.xp)) * 100 : 100;
  const daysToPay = PAYDAY_EVERY - (s.day - s.lastPayday);
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <div className="flex items-center gap-2 rounded-xl border-[3px] border-black bg-white pr-3 shadow-[3px_3px_0_#000]">
        <div className="h-12 w-12 overflow-hidden rounded-l-lg bg-sky-200"><PlayerToon s={s} className="h-14 w-12" /></div>
        <div>
          <div className="text-[10px] font-black uppercase text-slate-500">{cur.short}</div>
          <div className="max-w-[120px] truncate text-sm font-black leading-tight">{s.name}</div>
        </div>
      </div>
      <div className="hud-box min-w-[150px] flex-1 bg-slate-800 text-white">
        <div className="text-[10px] font-black uppercase text-sky-300">Опыт → {nxt ? nxt.short : "МАКС"}</div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-black text-yellow-300">{s.xp}</div>
          <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-black bg-slate-600">
            <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[10px] text-slate-300">{nxt ? nxt.xp : ""}</div>
        </div>
      </div>
      <div className="hud-box bg-slate-800 text-white"><div className="text-[10px] font-black uppercase text-amber-300">Деньги</div><div className="text-lg font-black text-amber-300">{s.money} BYN</div></div>
      <div className="hud-box bg-slate-800 text-white"><div className="text-[10px] font-black uppercase text-pink-300">День службы</div><div className="text-lg font-black text-pink-300">{s.day}</div></div>
      <div className="hud-box hidden bg-slate-800 text-white sm:block"><div className="text-[10px] font-black uppercase text-emerald-300">До зарплаты</div><div className="text-lg font-black text-emerald-300">{daysToPay} дн.</div></div>
      <div className="hud-box hidden bg-slate-800 text-white md:block"><div className="text-[10px] font-black uppercase text-violet-300">Спасено</div><div className="text-lg font-black text-violet-300">{s.stats.protectedPeople} чел.</div></div>
      <div className="flex items-center gap-1">
        {!IS_STATIC && <AccountButton account={account} onClick={onAccount} />}
        <VoiceToggle />
        <button onClick={onMute} className="hud-box bg-slate-800 text-xl text-white" title="Звук">{muted ? "🔇" : "🔊"}</button>
      </div>
    </div>
  );
}

type RegResult = { error?: string; recoveryCode?: string; state?: GameState };

function Intro({
  onGuest,
  onRegister,
  onLogin,
  onRecover,
  onAdopt,
}: {
  onGuest: (name: string, g: "m" | "f") => void;
  onRegister: (d: RegisterData) => Promise<RegResult>;
  onLogin: (login: string, password: string) => Promise<string | null>;
  onRecover: (login: string, code: string, password: string) => Promise<RegResult>;
  onAdopt: (st: GameState) => void;
}) {
  const [name, setName] = useState("");
  const [g, setG] = useState<"m" | "f">("m");
  const [mode, setMode] = useState<"register" | "login" | "recover" | "guest">(IS_STATIC ? "guest" : "register");
  const [pending, setPending] = useState<{ code: string; login: string; state: GameState | null; kind: "register" | "recover" } | null>(null);
  const preview = useMemo(() => ({ ...newState(name || "Стажёр", g) }), [name, g]);
  const tabs: { id: typeof mode; label: string }[] = [
    { id: "register", label: "📝 Регистрация" },
    { id: "login", label: "🔑 Вход" },
    { id: "guest", label: "👤 Гость" },
  ];
  return (
    <div className="relative flex h-full scene-box items-center justify-center overflow-y-auto rounded-2xl border-4 border-black p-4">
      <SceneBg bg="office" dim />
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-6 md:grid-cols-2">
        <div className="text-center md:text-left">
          <div className="toon-chip mb-3 inline-block bg-yellow-300">МВД · УПК · МИНСК</div>
          <h1 className="caption-text text-5xl leading-none sm:text-6xl">КИБЕР<span className="text-sky-300">ЩИТ</span></h1>
          <div className="caption-text mt-1 text-2xl text-red-300">БЕЛАРУСЬ</div>
          <p className="mt-4 text-base font-semibold text-white/90">
            Ты — новый стажёр управления по противодействию киберпреступности. Раскрывай дела по всей стране, допрашивай подозреваемых, выезжай на места и расти от стажёра до полковника.
          </p>
          <div className="relative mx-auto mt-4 hidden h-64 max-w-sm md:block">
            <div className="absolute bottom-0 left-0 w-40"><PlayerToon s={preview} className="breathe h-56 w-full" /></div>
            <div className="absolute bottom-0 right-0 w-48"><Portrait id="kravets" s={preview} className="breathe h-64 w-full" /></div>
            <div className="bubble bubble-right absolute right-10 top-0 max-w-[220px] text-xs font-semibold">
              {mode === "register" ? "Оформим пропуск, стажёр? Логин, пароль — и на службу!" : mode === "login" ? "С возвращением! Чай уже остыл, но дела ждут." : mode === "recover" ? "Забыл пароль? Бывает. Код восстановления сохранил?" : "Без пропуска? Ладно, но прогресс останется только на этом компьютере."}
            </div>
          </div>
        </div>
        <div className="toon-card bg-white p-4 text-left sm:p-5">
          {pending ? (
            <RecoveryCodeCard
              code={pending.code}
              login={pending.login}
              title={pending.kind === "recover" ? "Пароль изменён! Ваш новый код восстановления" : "Добро пожаловать! Сохраните код восстановления"}
              onContinue={() => { if (pending.state) onAdopt(pending.state); }}
            />
          ) : (
            <>
              {IS_STATIC && (
                <div className="mb-3 rounded-lg border-2 border-black bg-sky-100 p-2 text-xs font-semibold">🌐 Это версия игры на GitHub Pages: прогресс сохраняется в этом браузере. Аккаунты, рейтинг и классы доступны в онлайн-версии с сервером.</div>
              )}
              {mode !== "recover" && !IS_STATIC && (
                <div className="mb-3 grid grid-cols-3 gap-1.5">
                  {tabs.map((t) => (
                    <button key={t.id} onClick={() => { sfx.click(); setMode(t.id); }} className={`toon-chip px-1 text-xs sm:text-sm ${mode === t.id ? "bg-yellow-300" : "bg-white"}`}>{t.label}</button>
                  ))}
                </div>
              )}
              {mode === "register" && (
                <RegisterForm
                  withProfile
                  onSubmit={async (d) => {
                    const r = await onRegister(d);
                    if (r.error) return r.error;
                    if (r.recoveryCode && r.state) setPending({ code: r.recoveryCode, login: d.login, state: r.state, kind: "register" });
                    return null;
                  }}
                />
              )}
              {mode === "login" && <LoginForm label="🔑 Войти и продолжить службу" onSubmit={onLogin} onForgot={() => setMode("recover")} />}
              {mode === "recover" && (
                <RecoverForm
                  onBack={() => setMode("login")}
                  onSubmit={async (l, c, p) => {
                    const r = await onRecover(l, c, p);
                    if (r.error) return r.error;
                    if (!r.state) return "В аккаунте нет сохранённого прогресса";
                    if (r.recoveryCode) setPending({ code: r.recoveryCode, login: l, state: r.state, kind: "recover" });
                    return null;
                  }}
                />
              )}
              {mode === "guest" && (
                <div className="flex flex-col gap-2">
                  <div className={`rounded-lg border-2 border-black bg-amber-100 p-2 text-xs font-semibold ${IS_STATIC ? "hidden" : ""}`}>⚠️ Гостевой прогресс хранится только в этом браузере и не попадает в рейтинг под защитой пароля. Зарегистрироваться можно в любой момент — кнопка «👤 Гость» в игре.</div>
                  <label className="text-xs font-black uppercase text-slate-500">Игровое имя</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Например: Алесь Бульба" className="w-full rounded-xl border-[3px] border-black px-3 py-2 text-lg font-bold outline-none focus:bg-yellow-50" />
                  <div className="flex gap-2">
                    <button onClick={() => setG("m")} className={`toon-btn flex-1 py-2 ${g === "m" ? "bg-sky-300" : "bg-slate-100"}`}>👨 Стажёр</button>
                    <button onClick={() => setG("f")} className={`toon-btn flex-1 py-2 ${g === "f" ? "bg-pink-300" : "bg-slate-100"}`}>👩 Стажёрка</button>
                  </div>
                  <button onClick={() => { sfx.fanfare(); onGuest(name, g); }} className={`toon-btn mt-2 w-full ${IS_STATIC ? "bg-emerald-400" : "bg-slate-200"}`}>{IS_STATIC ? "🛡 Заступить на службу" : "Играть как гость →"}</button>
                </div>
              )}
              <div className="mt-3 text-center text-[11px] text-slate-500">
                {!IS_STATIC && (
                  <>
                    <a href={asset("/terms/")} target="_blank" rel="noopener" className="underline">Правила</a> · <a href={asset("/privacy/")} target="_blank" rel="noopener" className="underline">Конфиденциальность</a>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RankUpModal({ s, rank, onClose }: { s: GameState; rank: number; onClose: () => void }) {
  const r = RANKS[rank];
  useEffect(() => { sfx.fanfare(); }, []);
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-black/70 p-4">
      <div className="confetti" />
      <BigCaption text="НОВОЕ ЗВАНИЕ!" />
      <div className="toon-card pop-in relative grid w-full max-w-3xl items-end gap-4 overflow-hidden bg-amber-50 p-5 sm:grid-cols-[1fr_1.3fr]">
        <div className="flex items-end justify-center gap-2">
          <Portrait id="stalnaya" s={s} className="h-64 w-40" />
          <PlayerToon s={s} className="h-52 w-36" mood="happy" />
        </div>
        <div>
          <div className="text-xs font-black uppercase text-slate-500">Приказ МВД Республики Беларусь № {100 + rank * 37}-лс</div>
          <div className="mt-1 text-lg font-bold">За образцовое выполнение служебных обязанностей <b>{s.name}</b> присвоить специальное звание:</div>
          <div className="caption-text mt-2 text-3xl text-red-600">{r.name.toUpperCase()}</div>
          <div className="mt-3 rounded-xl border-[3px] border-black bg-white p-3 text-sm">
            <div className="font-black">💰 Оклад: {r.salary} BYN каждые {PAYDAY_EVERY} дня</div>
            <div className="mt-1 font-black">🔓 Новые права:</div>
            <ul className="list-disc pl-5">{r.perms.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
          <button onClick={() => { sfx.click(); onClose(); }} className="toon-btn mt-4 w-full bg-emerald-400">«Служу Республике Беларусь!»</button>
        </div>
      </div>
    </div>
  );
}

function IncidentModal({ s, idx, cityId, onClose, onAnswer }: { s: GameState; idx: number; cityId: string; onClose: () => void; onAnswer: (ok: boolean) => { xp: number; money: number } }) {
  const inc = INCIDENTS[idx];
  const city = CITIES.find((c) => c.id === cityId);
  const [res, setRes] = useState<{ ok: boolean; fb: string; xp: number; money: number } | null>(null);
  const opts = useMemo(() => (idx % 2 ? [...inc.options].reverse() : inc.options), [idx, inc.options]);
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => res && onClose()}>
      <div className="toon-card pop-in w-full max-w-lg bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="toon-chip bg-rose-400 text-white">🚨 ВЫЗОВ 102</span>
          <span className="text-sm font-bold text-slate-500">📍 {city?.name}</span>
        </div>
        <div className="mt-3 flex gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-[3px] border-black bg-amber-100 text-3xl">{inc.icon}</div>
          <div className="bubble bubble-left flex-1 text-base font-semibold">
            <div className="text-xs font-black uppercase text-slate-500">{inc.caller}</div>
            {inc.text}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {opts.map((o, i) => (
            <button
              key={i}
              disabled={!!res}
              onClick={() => {
                const r = onAnswer(o.ok);
                o.ok ? sfx.ok() : sfx.bad();
                setRes({ ok: o.ok, fb: o.fb, ...r });
              }}
              className={`rounded-xl border-[3px] border-black px-3 py-2 text-left font-bold shadow-[3px_3px_0_#000] ${res ? (o.ok ? "bg-emerald-200" : "bg-rose-100") : "bg-white hover:bg-yellow-100"}`}
            >
              {o.t}
            </button>
          ))}
        </div>
        {res && (
          <div className="pop-in mt-3">
            <div className={`rounded-xl border-[3px] border-black p-3 font-semibold ${res.ok ? "bg-emerald-200" : "bg-rose-200"}`}>{res.ok ? "✅ Гражданин спасён! " : "❌ Увы… "}{res.fb}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-black">+{res.xp} XP {res.money ? `· +${res.money} BYN` : ""}</span>
              <button onClick={onClose} className="toon-btn bg-emerald-400">Закрыть</button>
            </div>
          </div>
        )}
        {!res && <div className="mt-2 text-xs text-slate-500">{fill("Дежурный {rank} {name} принимает вызов…", s)}</div>}
      </div>
    </div>
  );
}

export default function Game() {
  const { state: s, setState: rawSet, loaded, reset, account, registerState, adopt, recover, manage, signIn, signOut } = useGameState();
  const [accountOpen, setAccountOpen] = useState(false);
  const [achQueue, setAchQueue] = useState<{ id: number; icon: string; name: string; reward: number }[]>([]);
  const [trainer, setTrainer] = useState(false);
  // все изменения состояния проходят через проверку достижений
  const setState = useCallback(
    (next: GameState) => {
      const fresh = newAchievements(next);
      if (fresh.length) {
        const total = fresh.reduce((a, b) => a + b.reward, 0);
        next = { ...next, achievements: [...(next.achievements ?? []), ...fresh.map((a) => a.id)], money: next.money + total };
        sfx.fanfare();
        setAchQueue((q) => [...q, ...fresh.map((a, i) => ({ id: Date.now() + i, icon: a.icon, name: a.name, reward: a.reward }))]);
      }
      rawSet(next);
    },
    [rawSet],
  );
  const [tab, setTab] = useState<Tab>("map");
  const [active, setActive] = useState<string | null>(null);
  const [selCity, setSelCity] = useState<string | null>("minsk");
  const [incident, setIncident] = useState<{ idx: number; city: string } | null>(null);
  const [toast, setToast] = useState<{ who: string; text: string; id: number } | null>(null);
  const [floaters, setFloaters] = useState<{ id: number; text: string }[]>([]);
  const [muted, setMutedState] = useState(false);

  const float = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setFloaters((f) => [...f, { id, text }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 2200);
  }, []);

  // болтовня коллег
  useEffect(() => {
    if (!s || active) return;
    const t = setInterval(() => {
      const pool = CHATTER.filter((c) => !c.need || s.completed[c.need]);
      if (s.owned.includes("cat")) pool.push({ who: "bayt", text: "Мяу. (Байт прошёлся по клавиатуре и случайно заблокировал фишинговый сайт.)" });
      const c = pool[Math.floor(Math.random() * pool.length)];
      sfx.notify();
      setToast({ ...c, text: fill(c.text, s), id: Date.now() });
    }, 38000);
    return () => clearInterval(t);
  }, [s, active]);

  useEffect(() => {
    if (!achQueue.length) return;
    const t = setTimeout(() => setAchQueue((q) => q.slice(1)), 3500);
    return () => clearTimeout(t);
  }, [achQueue]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!loaded) return <div className="grid h-full place-items-center font-black text-white">Загрузка…</div>;
  if (!s)
    return (
      <div className="h-full p-2">
        <Intro
          onGuest={(n, g) => setState(newState(n, g))}
          onRegister={async (d) => {
            const st = newState(d.name, d.gender);
            const r = await registerState(st, d.login, d.password, d.consent, d.website);
            return { ...r, state: st };
          }}
          onLogin={signIn}
          onRecover={recover}
          onAdopt={(st) => adopt(st)}
        />
      </div>
    );

  const update = (fn: (st: GameState) => GameState) => setState(fn(s));
  const rank = rankOf(s.xp);
  const locked = new Set<RegionId>((Object.keys(REGION_RANK) as RegionId[]).filter((r) => REGION_RANK[r] > rank));
  const activeCase = active ? ALL_CASES.find((c) => c.id === active) : null;
  const mainSolved = CASES.filter((c) => s.completed[c.id]).length;
  const sideAvail = SIDE_CASES.find((c) => !s.completed[c.id] && caseStatus(c, s).ok);

  // маркеры городов
  const markers: Record<string, CityMarker> = {};
  for (const c of CASES) {
    const m = markers[c.city];
    const st = caseStatus(c, s);
    const done = !!s.completed[c.id];
    if (!m) markers[c.city] = { icon: c.icon, color: done ? "#4ade80" : st.ok ? "#fbbf24" : "#cbd5e1", count: 1, done };
    else {
      m.count = (m.count ?? 1) + 1;
      m.done = m.done && done;
      if (!done && st.ok) { m.color = "#fbbf24"; m.icon = c.icon; }
    }
  }

  const nextCase = CASES.find((c) => !s.completed[c.id] && caseStatus(c, s).ok);
  const incidentsOn = rank >= 1 || !!s.completed["sms-code"];
  const incs = incidentsOn
    ? randomIncidents(3, s.stats.incidents * 7 + s.day).map((x, i) => ({
        key: `${s.stats.incidents}-${i}`,
        city: CITIES.filter((c) => !locked.has(c.region) || i === 0)[x.city % CITIES.filter((c) => !locked.has(c.region) || i === 0).length].id,
        idx: x.idx,
      }))
    : [];

  const cityCases = CASES.filter((c) => c.city === selCity);
  const selCityObj = CITIES.find((c) => c.id === selCity);
  const pendingRank = s.seenRank < rank ? s.seenRank + 1 : null;

  return (
    <div className="relative flex h-full flex-col gap-2 p-2">
      {!activeCase && <Hud s={s} muted={muted} account={account} onAccount={() => { sfx.click(); setAccountOpen(true); }} onMute={() => { setMuted(!isMuted()); setMutedState(isMuted()); }} />}

      {activeCase ? (
        <CasePlayer
          key={activeCase.id}
          c={activeCase}
          s={s}
          onComplete={(pct, m, calls) => {
            const { next, reward } = applyCaseResult(s, activeCase.id, pct, m, calls);
            setState(next);
            return reward;
          }}
          onExit={() => setActive(null)}
        />
      ) : (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.filter((t) => !IS_STATIC || t.id !== "class").map((t) => (IS_STATIC && t.id === "top" ? { ...t, label: "Настройки", icon: "⚙️" } : t)).map((t) => (
              <button key={t.id} onClick={() => { sfx.click(); setTab(t.id); }} className={`shrink-0 rounded-xl border-[3px] border-black px-3 py-1.5 text-sm font-black shadow-[3px_3px_0_#000] transition ${tab === t.id ? "-translate-y-0.5 bg-yellow-300" : "bg-white hover:bg-yellow-100"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "map" && (
              <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
                <div className="relative overflow-hidden rounded-2xl border-4 border-black bg-gradient-to-br from-sky-300 via-sky-200 to-indigo-200 p-2">
                  <div className="map-grid absolute inset-0 opacity-30" />
                  {nextCase && (
                    <button onClick={() => setSelCity(nextCase.city)} className="toon-chip absolute left-3 top-3 z-10 bg-yellow-300 text-left">
                      📌 Текущая цель: {nextCase.icon} «{nextCase.title}» — {CITIES.find((c) => c.id === nextCase.city)?.name}
                    </button>
                  )}
                  {!nextCase && CASES.some((c) => !s.completed[c.id]) && (
                    <div className="toon-chip absolute left-3 top-3 z-10 bg-rose-200">⏳ Новые дела откроются с повышением. Принимайте вызовы 🚨 дежурной части!</div>
                  )}
                  <BelarusMap
                    className="relative h-auto w-full"
                    locked={locked}
                    markers={markers}
                    selected={selCity}
                    onCity={(id) => { sfx.click(); setSelCity(id); }}
                    incidents={incs.map((x) => ({ key: x.key, city: x.city, onClick: () => { sfx.notify(); setIncident({ idx: x.idx, city: x.city }); } }))}
                  />
                  <div className="absolute bottom-2 right-2 flex flex-wrap gap-1 text-[11px] font-bold">
                    <span className="rounded border-2 border-black bg-amber-300 px-1">● доступно</span>
                    <span className="rounded border-2 border-black bg-green-400 px-1">● раскрыто</span>
                    <span className="rounded border-2 border-black bg-slate-300 px-1">🔒 закрыто</span>
                    {incidentsOn && <span className="rounded border-2 border-black bg-rose-400 px-1 text-white">! вызов 102</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="toon-card bg-white p-4">
                    <div className="text-xs font-black uppercase text-slate-500">Город</div>
                    <div className="text-2xl font-black">📍 {selCityObj?.name ?? "Выберите город"}</div>
                    {selCityObj && locked.has(selCityObj.region) && <div className="mt-1 text-sm font-bold text-rose-600">🔒 Регион откроется на звании «{RANKS[REGION_RANK[selCityObj.region]].short}»</div>}
                    <div className="mt-3 flex flex-col gap-2">
                      {cityCases.length === 0 && <div className="text-sm text-slate-500">В этом городе пока тихо. Следите за вызовами 🚨</div>}
                      {cityCases.map((c) => {
                        const st = caseStatus(c, s);
                        const res = s.completed[c.id];
                        return (
                          <div key={c.id} className={`rounded-xl border-[3px] border-black p-3 ${res ? "bg-emerald-50" : st.ok ? "bg-amber-50" : "bg-slate-100"}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{c.icon}</span>
                              <div className="flex-1">
                                <div className="font-black leading-tight">{c.title} {c.final && <span className="text-xs text-rose-600">ФИНАЛ</span>}</div>
                                <div className="text-xs text-slate-600">{c.tagline}</div>
                              </div>
                              {res && <span className="text-sm">{"⭐".repeat(res.stars)}</span>}
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-600">+{c.xp} XP · +{c.money} BYN</span>
                              {st.ok ? (
                                <button onClick={() => { sfx.click(); setActive(c.id); }} className="toon-btn bg-emerald-400 px-3 py-1 text-sm">{res ? "Переиграть" : "Взять дело →"}</button>
                              ) : (
                                <span className="text-right text-xs font-bold text-rose-600">🔒 {st.reason}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {s.completed["sms-code"] && (
                    <button onClick={() => { sfx.notify(); setTrainer(true); }} className="toon-card flex items-center gap-3 bg-rose-100 p-3 text-left transition hover:-translate-y-0.5">
                      <span className="text-4xl">📞</span>
                      <span className="flex-1"><span className="block font-black">Тренажёр: звонок мошенника</span><span className="block text-xs text-slate-600">Отличи мошенника от настоящего звонка за 12 секунд. Правильно разобрано: {s.stats.callsWon ?? 0}</span></span>
                      <span className="toon-chip bg-white">▶</span>
                    </button>
                  )}
                  {sideAvail && (
                    <button onClick={() => { sfx.click(); setTab("stories"); }} className="toon-card flex items-center gap-3 bg-pink-100 p-3 text-left transition hover:-translate-y-0.5">
                      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-[3px] border-black bg-white"><Portrait id={sideAvail.side!.giver} s={s} className="h-16 w-full" /></span>
                      <span className="flex-1"><span className="block text-xs font-black uppercase text-pink-700">Новая побочная история</span><span className="block font-black">{sideAvail.icon} {sideAvail.title}</span><span className="block text-xs text-slate-600">«{sideAvail.side!.teaser}»</span></span>
                    </button>
                  )}
                  <div className="toon-card bg-slate-900 p-4 text-white">
                    <div className="font-black text-sky-300">📁 Журнал расследования «Гнездо»</div>
                    <div className="mt-1 text-sm">Раскрыто дел: <b>{mainSolved}</b> / {CASES.length}</div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-black bg-slate-700"><div className="h-full bg-rose-400" style={{ width: `${(mainSolved / CASES.length) * 100}%` }} /></div>
                    <div className="mt-2 text-xs text-slate-300">Вызовов дежурной части принято: {s.stats.incidents}</div>
                  </div>
                </div>
              </div>
            )}
            {tab === "stories" && <StoriesView s={s} onStart={(id) => setActive(id)} />}
            {tab === "medals" && <AchievementsView s={s} />}
            {tab === "class" && <ClassView s={s} update={update} />}
            {tab === "office" && <OfficeView s={s} />}
            {tab === "shop" && <ShopView s={s} update={update} float={float} />}
            {tab === "wardrobe" && <WardrobeView s={s} update={update} float={float} />}
            {tab === "career" && <CareerView s={s} />}
            {tab === "dossier" && <DossierView s={s} />}
            {tab === "memo" && <MemoView s={s} />}
            {tab === "top" && (
              <LeaderboardView
                s={s}
                onReset={() => {
                  if (account.login) {
                    if (confirm("Вы вошли в аккаунт. Чтобы начать новую карьеру, нужно выйти — прогресс в аккаунте сохранится. Выйти?")) signOut();
                  } else if (confirm("Начать карьеру заново? Весь гостевой прогресс будет удалён.")) reset();
                }}
              />
            )}
          </div>
        </>
      )}

      {incident && (
        <IncidentModal
          s={s}
          idx={incident.idx}
          cityId={incident.city}
          onClose={() => setIncident(null)}
          onAnswer={(ok) => {
            const r = applyIncident(s, ok);
            setState(r.next);
            if (r.salary) float(`💰 Зарплата +${r.salary} BYN`);
            return { xp: r.xp, money: r.money };
          }}
        />
      )}

      {pendingRank !== null && !activeCase && (
        <RankUpModal s={s} rank={pendingRank} onClose={() => update((st) => ({ ...st, seenRank: pendingRank }))} />
      )}

      {toast && !activeCase && (
        <div key={toast.id} className="slide-in-right absolute bottom-4 right-4 z-40 flex max-w-sm items-end gap-2" onClick={() => setToast(null)}>
          <div className="bubble bubble-right bg-white text-sm font-semibold">
            <div className="text-xs font-black uppercase" style={{ color: CHARACTERS[toast.who]?.color ?? "#0f172a" }}>{toast.who === "bayt" ? "Кот Байт" : CHARACTERS[toast.who]?.name}</div>
            {toast.text}
          </div>
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] border-black bg-sky-200">
            {toast.who === "bayt" ? <div className="grid h-full place-items-center text-4xl">🐈</div> : <Portrait id={toast.who} s={s} className="h-20 w-full" />}
          </div>
        </div>
      )}

      {accountOpen && (
        <AccountModal
          s={s}
          account={account}
          onClose={() => setAccountOpen(false)}
          registerGuest={(d) => registerState(s, d.login, d.password, d.consent, d.website)}
          signIn={signIn}
          recover={async (l, c, p) => {
            const r = await recover(l, c, p);
            if (r.state) adopt(r.state);
            return r;
          }}
          manage={manage}
          signOut={signOut}
        />
      )}

      {trainer && (
        <CallTrainerModal
          s={s}
          onClose={() => setTrainer(false)}
          onResult={(m) => {
            const r = applyCall(s, m);
            setState(r.next);
            if (r.salary) float(`💰 Зарплата +${r.salary} BYN`);
            return { xp: r.xp, money: r.money };
          }}
        />
      )}

      {achQueue[0] && (
        <div key={achQueue[0].id} className="pop-in pointer-events-none absolute left-1/2 top-3 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-2xl border-4 border-black bg-gradient-to-r from-yellow-200 to-amber-300 px-4 py-2 shadow-[5px_5px_0_#000]">
          <span className="star-pop grid h-12 w-12 place-items-center rounded-full border-[3px] border-black bg-yellow-300 text-2xl">{achQueue[0].icon}</span>
          <span>
            <span className="block text-[10px] font-black uppercase text-amber-800">Новое достижение!</span>
            <span className="block font-black">{achQueue[0].name}</span>
            <span className="block text-xs font-bold text-emerald-800">+{achQueue[0].reward} BYN</span>
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute left-1/2 top-16 z-50 -translate-x-1/2">
        {floaters.map((f) => (
          <div key={f.id} className="float-up caption-text text-2xl">{f.text}</div>
        ))}
      </div>
    </div>
  );
}
