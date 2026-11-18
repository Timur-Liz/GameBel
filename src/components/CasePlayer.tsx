"use client";
import { useEffect, useMemo, useState } from "react";
import type { BgId, ChoiceStep, DialogueStep, GameCase, GameState, Step } from "@/game/types";
import { CHARACTERS, bonuses, RANKS, rankOf } from "@/game/data";
import { fill, type Reward } from "@/game/store";
import { sfx } from "@/game/sound";
import { babble, getVoiceMode, onVoiceMode, setVoiceMode, speak, stopSpeak, ttsSupported, type VoiceMode } from "@/game/voice";
import { CallTask } from "./CallTask";
import { CITIES } from "@/game/mapData";
import { BigCaption, SceneBg } from "./Scene";
import { Portrait } from "./Toon";
import {
  HotspotTask,
  InputTask,
  InterrogationTask,
  LogsTask,
  MapPickTask,
  OrderTask,
  PasswordTask,
  SelectTask,
  SortTask,
  TerminalTask,
} from "./tasks";

function useTypewriter(text: string, speed = 18, who = "narrator", female = false) {
  const [st, setSt] = useState({ text, n: 0 });
  if (st.text !== text) setSt({ text, n: 0 });
  useEffect(() => {
    let k = 0;
    const id = setInterval(() => {
      k++;
      if (k <= text.length) {
        const mode = getVoiceMode();
        if (mode === "babble") {
          if (k % 2 === 0) babble(who, text[k - 1] ?? "", female);
        } else if (mode === "off" && k % 3 === 0) sfx.type();
      }
      setSt((p) => (p.text !== text || p.n >= p.text.length ? p : { ...p, n: p.n + 1 }));
      if (k > text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, who, female]);
  useEffect(() => {
    speak(text, who, female);
  }, [text, who, female]);
  const n = st.text === text ? st.n : 0;
  return { shown: text.slice(0, n), done: n >= text.length, skip: () => setSt({ text, n: text.length }) };
}

function nameOf(id: string, s: GameState) {
  if (id === "player") return s.name;
  return CHARACTERS[id]?.name ?? "";
}

export interface SceneStats {
  progress: string;
  trust: number;
}

function TopStats({ s, stats }: { s: GameState; stats?: SceneStats }) {
  if (!stats) return null;
  const boxes = [
    { label: "ЗВАНИЕ", value: RANKS[rankOf(s.xp)].short, color: "#facc15" },
    { label: "ЭТАП ДЕЛА", value: stats.progress, color: "#38bdf8" },
    { label: "ТОЧНОСТЬ", value: `${stats.trust}%`, color: stats.trust >= 80 ? "#4ade80" : stats.trust >= 50 ? "#fb923c" : "#f87171" },
  ];
  return (
    <div className="pointer-events-none absolute left-2 top-2 z-20 flex gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
      {boxes.map((b) => (
        <div key={b.label} className="rounded-lg border-2 border-black bg-slate-900/85 px-2 py-0.5 shadow-[2px_2px_0_#000] sm:px-3 sm:py-1">
          <div className="text-[8px] font-black uppercase tracking-wide text-slate-300 sm:text-[10px]">{b.label}</div>
          <div className="caption-text text-sm leading-tight sm:text-xl" style={{ color: b.color }}>{b.value}</div>
        </div>
      ))}
    </div>
  );
}

function DialogueScene({ step, s, onDone, stats }: { step: DialogueStep; s: GameState; onDone: () => void; stats?: SceneStats }) {
  const [i, setI] = useState(0);
  const line = step.lines[i];
  const text = fill(line.text, s);
  const tw = useTypewriter(text, 18, line.who, s.gender === "f");
  const npcs = useMemo(() => step.lines.map((l) => l.who).filter((w) => w !== "player" && w !== "narrator"), [step.lines]);
  // текущий NPC справа — последний говоривший не-игрок
  let right = npcs[0] ?? null;
  for (let k = 0; k <= i; k++) {
    const w = step.lines[k].who;
    if (w !== "player" && w !== "narrator") right = w;
  }
  const speaking = line.who;
  const isNarr = speaking === "narrator";
  const color = CHARACTERS[speaking]?.color ?? "#0ea5e9";

  const advance = () => {
    if (!tw.done) {
      tw.skip();
      return;
    }
    sfx.click();
    if (i + 1 >= step.lines.length) onDone();
    else setI(i + 1);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  return (
    <div className="relative flex scene-box flex-1 cursor-pointer select-none flex-col overflow-hidden rounded-2xl border-4 border-black" onClick={advance}>
      <SceneBg bg={step.bg ?? "office"} />
      <TopStats s={s} stats={stats} />
      {line.caption && <BigCaption text={fill(line.caption, s)} />}
      {/* персонажи */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-2 sm:px-10">
        <div className={`w-36 transition-all duration-300 sm:w-56 ${speaking === "player" ? "scale-105" : "opacity-90 brightness-90"}`}>
          <Portrait id="player" s={s} className={`h-48 w-full sm:h-72 ${speaking === "player" ? "talk" : "breathe"}`} />
        </div>
        {right && (
          <div key={right} className={`slide-in-right w-44 transition-all duration-300 sm:w-72 ${speaking === right ? "scale-105" : "opacity-90 brightness-90"}`}>
            <Portrait id={right} s={s} className={`h-56 w-full sm:h-[22rem] ${speaking === right ? "talk" : "breathe"}`} />
          </div>
        )}
      </div>
      {/* речь */}
      {isNarr ? (
        <div className="relative z-20 mx-auto mt-16 max-w-2xl px-4">
          <div key={i} className="pop-in rounded-xl border-4 border-black bg-slate-900/90 px-5 py-3 text-center text-lg font-bold italic text-amber-200 shadow-[6px_6px_0_#000]">
            {tw.shown}
          </div>
        </div>
      ) : (
        <div className={`relative z-20 mt-16 flex px-3 sm:px-8 ${speaking === "player" ? "justify-start" : "justify-end"}`}>
          <div key={i} className={`bubble pop-in max-w-xl ${speaking === "player" ? "bubble-left" : "bubble-right"}`}>
            <div className="mb-1 inline-block rounded-md border-2 border-black px-2 text-xs font-black uppercase text-white" style={{ background: speaking === "player" ? "#0ea5e9" : color }}>
              {nameOf(speaking, s)}
            </div>
            <div className="min-h-[3rem] text-base font-semibold leading-snug sm:text-xl">{tw.shown}</div>
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 animate-pulse rounded-full border-2 border-black bg-white/90 px-3 py-0.5 text-xs font-bold">
        {tw.done ? "▶ нажми, чтобы продолжить" : "…"}
      </div>
    </div>
  );
}

function ChoiceScene({ step, s, onDone, stats }: { step: ChoiceStep; s: GameState; onDone: (m: number) => void; stats?: SceneStats }) {
  const [mist, setMist] = useState(0);
  const [fb, setFb] = useState<{ ok: boolean; text: string } | null>(null);
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const q = fill(step.question, s);
  const tw = useTypewriter(q, 18, step.who, s.gender === "f");
  const pick = (i: number) => {
    if (solved || tried.includes(i)) return;
    const o = step.options[i];
    setFb({ ok: o.correct, text: o.feedback });
    if (o.correct) {
      setSolved(true);
      sfx.ok();
    } else {
      setMist((m) => m + 1);
      setTried([...tried, i]);
      sfx.bad();
    }
  };
  return (
    <div className="relative flex scene-box flex-1 flex-col overflow-hidden rounded-2xl border-4 border-black">
      <SceneBg bg={step.bg ?? "office"} />
      <TopStats s={s} stats={stats} />
      <div className="absolute bottom-0 right-2 z-10 w-44 sm:right-10 sm:w-72">
        <Portrait id={step.who} s={s} className="talk h-56 w-full sm:h-[22rem]" mood={fb && !fb.ok ? "shock" : "neutral"} />
      </div>
      <div className="relative z-20 mt-16 flex justify-end px-3 sm:px-8">
        <div className="bubble bubble-right max-w-xl" onClick={tw.skip}>
          <div className="mb-1 inline-block rounded-md border-2 border-black px-2 text-xs font-black uppercase text-white" style={{ background: CHARACTERS[step.who]?.color ?? "#0ea5e9" }}>
            {nameOf(step.who, s)}
          </div>
          <div className="text-base font-semibold sm:text-xl">{tw.shown}</div>
        </div>
      </div>
      <div className="relative z-20 mt-auto flex flex-col gap-2 p-3 sm:max-w-[60%] sm:p-6">
        <div className="toon-chip w-fit bg-yellow-300">🤔 Твой ответ:</div>
        {step.options.map((o, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={tried.includes(i) || solved}
            className={`rounded-xl border-[3px] border-black px-4 py-3 text-left text-sm font-bold shadow-[4px_4px_0_#000] transition sm:text-base ${
              solved && o.correct ? "bg-emerald-300" : tried.includes(i) ? "bg-rose-200 line-through opacity-70" : "bg-white hover:-translate-y-0.5 hover:bg-yellow-100"
            }`}
          >
            {String.fromCharCode(65 + i)}. {fill(o.text, s)}
          </button>
        ))}
        {fb && (
          <div key={fb.text} className={`pop-in rounded-xl border-[3px] border-black px-4 py-2 text-sm font-semibold ${fb.ok ? "bg-emerald-200" : "bg-rose-200"}`}>
            {fb.ok ? "✅ " : "❌ "}
            {fb.text}
          </div>
        )}
        {solved && (
          <button onClick={() => { sfx.click(); onDone(mist); }} className="toon-btn pop-in w-fit bg-emerald-400">Далее →</button>
        )}
      </div>
    </div>
  );
}

const TASK_TITLES: Partial<Record<Step["type"], string>> = {
  hotspot: "🔍 Поиск признаков",
  sort: "🗂 Сортировка",
  password: "🔐 Пароль",
  terminal: "💻 Терминал",
  logs: "📜 Анализ логов",
  order: "📋 Алгоритм",
  select: "☑️ Выбор",
  input: "🧩 Шифр",
  mappick: "🗺 Поиск на карте",
  interrogation: "🎙 Допрос",
  call: "📞 Звонок",
};

function TaskShell({ step, s, hintsLeft, onHint, onDone, bg }: { step: Step; s: GameState; hintsLeft: number; onHint: () => void; onDone: (m: number) => void; bg: BgId }) {
  const [hintShown, setHintShown] = useState(false);
  const hint = "hint" in step ? step.hint : undefined;
  const title = "title" in step ? step.title : "";
  const intro = "intro" in step ? step.intro : "";
  const mentor = s.completed["sms-code"] ? (step.type === "terminal" || step.type === "logs" ? "alesya" : "kravets") : "kravets";
  const useHint = () => {
    if (hintShown || hintsLeft <= 0) return;
    sfx.notify();
    setHintShown(true);
    onHint();
  };
  const content = (() => {
    switch (step.type) {
      case "hotspot": return <HotspotTask step={step} s={s} onDone={onDone} />;
      case "sort": return <SortTask step={step} s={s} onDone={onDone} />;
      case "password": return <PasswordTask step={step} s={s} onDone={onDone} />;
      case "terminal": return <TerminalTask step={step} s={s} onDone={onDone} />;
      case "logs": return <LogsTask step={step} s={s} onDone={onDone} />;
      case "order": return <OrderTask step={step} s={s} onDone={onDone} />;
      case "select": return <SelectTask step={step} s={s} onDone={onDone} />;
      case "input": return <InputTask step={step} s={s} onDone={onDone} />;
      case "mappick": return <MapPickTask step={step} s={s} onDone={onDone} />;
      case "interrogation": return <InterrogationTask step={step} s={s} onDone={onDone} />;
      case "call": return <CallTask script={step.script} s={s} onDone={onDone} />;
      default: return null;
    }
  })();
  const hintText = hint ?? (step.type === "terminal" ? `Попробуй: ${step.tasks.map((t) => t.cmd).join("  →  ")}` : null);
  return (
    <div className="relative flex scene-box-sm flex-1 flex-col overflow-hidden rounded-2xl border-4 border-black">
      <SceneBg bg={bg} dim />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 pb-24 sm:p-6 sm:pb-24">
        {step.type !== "interrogation" && (
          <div className="mx-auto w-full max-w-3xl text-center">
            <div className="toon-chip mx-auto mb-2 w-fit bg-yellow-300">{TASK_TITLES[step.type]}</div>
            <h2 className="caption-text text-2xl sm:text-4xl">{fill(title, s)}</h2>
            <p className="mt-2 text-sm font-semibold text-white/90 sm:text-base">{fill(intro, s)}</p>
          </div>
        )}
        {content}
        {hintText && (
          <div className="fixed bottom-16 left-3 z-50 flex max-w-xs items-end gap-2 sm:absolute sm:bottom-4 sm:left-4">
            <button onClick={useHint} disabled={hintShown || hintsLeft <= 0} className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] border-black bg-sky-200 shadow-[3px_3px_0_#000] disabled:opacity-80" title="Подсказка">
              <Portrait id={mentor} s={s} className="absolute -bottom-1 left-0 h-20 w-full" />
              <span className="absolute -right-0 -top-0 grid h-6 w-6 place-items-center rounded-full border-2 border-black bg-yellow-300 text-xs font-black">{hintsLeft}</span>
            </button>
            {hintShown ? (
              <div className="bubble pop-in bg-white text-sm font-semibold">💡 {hintText}</div>
            ) : (
              <div className="rounded-lg border-2 border-black bg-white/90 px-2 py-1 text-xs font-bold">💡 Подсказка ({hintsLeft})</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function VoiceToggle({ className = "" }: { className?: string }) {
  const [m, setM] = useState<VoiceMode>("babble");
  useEffect(() => {
    const t = setTimeout(() => setM(getVoiceMode()), 0);
    const off = onVoiceMode(setM);
    return () => {
      clearTimeout(t);
      off();
    };
  }, []);
  const order: VoiceMode[] = ttsSupported() ? ["babble", "tts", "off"] : ["babble", "off"];
  const label = m === "babble" ? "🗨️ Бормотание" : m === "tts" ? "🗣️ Озвучка" : "🔇 Без голоса";
  return (
    <button
      onClick={() => {
        const n = order[(order.indexOf(m) + 1) % order.length];
        setVoiceMode(n);
        sfx.click();
      }}
      className={`toon-chip bg-white text-xs ${className}`}
      title="Голос персонажей: бормотание / синтез речи / выкл"
    >
      {label}
    </button>
  );
}

export function CasePlayer({ c, s, onComplete, onExit }: { c: GameCase; s: GameState; onComplete: (pct: number, mistakes: number, calls: { won: number; played: number }) => Reward; onExit: () => void }) {
  const [calls, setCalls] = useState({ won: 0, played: 0 });
  useEffect(() => () => stopSpeak(), []);
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [mistTotal, setMistTotal] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(() => bonuses(s).hints);
  const [pendingHint, setPendingHint] = useState(0);
  const [reward, setReward] = useState<Reward | null>(null);
  const step = c.steps[idx];
  const city = CITIES.find((x) => x.id === c.city);
  useEffect(() => {
    if (step.type !== "dialogue" && step.type !== "choice") stopSpeak();
  }, [idx, step.type]);

  let lastBg: BgId = "office";
  for (let k = 0; k <= idx && k < c.steps.length; k++) {
    const st = c.steps[k];
    if ((st.type === "dialogue" || st.type === "choice") && st.bg) lastBg = st.bg;
  }

  const finishStep = (mistakes: number | null) => {
    let sc = scores;
    let mt = mistTotal;
    let cl = calls;
    if (step.type === "call" && mistakes !== null) {
      cl = { won: calls.won + (mistakes === 0 ? 1 : 0), played: calls.played + 1 };
      setCalls(cl);
    }
    if (mistakes !== null) {
      const m = mistakes + pendingHint * 0.5;
      sc = [...scores, Math.max(0, 1 - 0.25 * m)];
      mt = mistTotal + mistakes;
      setScores(sc);
      setMistTotal(mt);
      setPendingHint(0);
    }
    if (idx + 1 >= c.steps.length) {
      const pct = sc.length ? sc.reduce((a, b) => a + b, 0) / sc.length : 1;
      const r = onComplete(pct, mt, cl);
      setReward(r);
      sfx.fanfare();
    } else {
      setIdx(idx + 1);
    }
  };

  const sceneStats: SceneStats = {
    progress: `${idx + 1}/${c.steps.length}`,
    trust: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) : 100,
  };

  if (reward) {
    return (
      <div className="relative flex scene-box flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border-4 border-black p-4">
        <SceneBg bg="office" dim />
        <div className="toon-card pop-in relative z-10 w-full max-w-2xl bg-white p-5 sm:p-7">
          <div className="text-center">
            <div className="toon-chip mx-auto w-fit bg-emerald-300">{c.side ? "ИСТОРИЯ ЗАВЕРШЕНА" : "ДЕЛО РАСКРЫТО"}</div>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">{c.icon} {c.title}</h2>
            <div className="mt-2 text-5xl">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`inline-block ${n <= reward.stars ? "star-pop" : "opacity-20 grayscale"}`} style={{ animationDelay: `${n * 0.2}s` }}>⭐</span>
              ))}
            </div>
            <div className="text-sm font-bold text-slate-500">Точность: {Math.round(reward.pct * 100)}% {reward.replay && "· повторное прохождение (25% награды)"}</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border-[3px] border-black bg-sky-200 p-3 text-center"><div className="text-xs font-bold">ОПЫТ</div><div className="text-2xl font-black">+{reward.xp} XP</div></div>
            <div className="rounded-xl border-[3px] border-black bg-amber-200 p-3 text-center"><div className="text-xs font-bold">ПРЕМИЯ</div><div className="text-2xl font-black">+{reward.money} BYN</div></div>
          </div>
          {reward.salary > 0 && <div className="mt-3 rounded-xl border-[3px] border-black bg-emerald-200 p-2 text-center font-black">💰 День зарплаты! Начислено {reward.salary} BYN</div>}
          <div className="mt-4 rounded-xl border-[3px] border-black bg-yellow-50 p-3">
            <div className="font-black">📌 Памятка по делу</div>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {c.lessons.map((l) => <li key={l}>{l}</li>)}
            </ul>
            <div className="mt-2 text-xs font-bold text-slate-600">⚖️ Квалификация: {c.article}</div>
          </div>
          <div className="mt-4 flex justify-center">
            <button onClick={() => { sfx.click(); onExit(); }} className="toon-btn bg-emerald-400">В управление →</button>
          </div>
          {reward.rankUp !== null && <div className="mt-2 text-center text-sm font-black text-indigo-700">🎖 Вас ждёт приказ о присвоении звания «{RANKS[reward.rankUp].name}»!</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <button onClick={() => { if (confirm("Прервать дело? Прогресс по делу будет потерян.")) onExit(); }} className="toon-btn bg-white px-3 py-1 text-sm">✕</button>
        <div className="toon-chip bg-white">{c.icon} {c.title} · 📍 {city?.name}</div>
        <div className="h-4 flex-1 overflow-hidden rounded-full border-[3px] border-black bg-white">
          <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(idx / c.steps.length) * 100}%` }} />
        </div>
        <div className="toon-chip bg-yellow-300">{idx + 1}/{c.steps.length}</div>
        <VoiceToggle className="hidden sm:block" />
      </div>
      <div key={idx} className="flex min-h-0 flex-1 flex-col fade-in">
        {step.type === "dialogue" ? (
          <DialogueScene step={step} s={s} onDone={() => finishStep(null)} stats={sceneStats} />
        ) : step.type === "choice" ? (
          <ChoiceScene step={step} s={s} onDone={(m) => finishStep(m)} stats={sceneStats} />
        ) : (
          <TaskShell step={step} s={s} bg={lastBg} hintsLeft={hintsLeft} onHint={() => { setHintsLeft((h) => h - 1); setPendingHint(1); }} onDone={(m) => finishStep(m)} />
        )}
      </div>
    </div>
  );
}
