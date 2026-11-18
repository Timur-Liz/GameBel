"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  HotspotStep,
  InputStep,
  InterrogationStep,
  LogsStep,
  MapPickStep,
  OrderStep,
  PasswordStep,
  SelectStep,
  SortStep,
  TerminalStep,
  GameState,
} from "@/game/types";
import { sfx } from "@/game/sound";
import { CHARACTERS } from "@/game/data";
import { CITIES } from "@/game/mapData";
import { fill } from "@/game/store";
import { Portrait } from "./Toon";
import { BelarusMap } from "./BelarusMap";
import { BigCaption, SceneBg } from "./Scene";

export interface TaskProps<T> {
  step: T;
  s: GameState;
  onDone: (mistakes: number) => void;
}

function NextBtn({ onClick, label = "Далее →" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={() => { sfx.click(); onClick(); }} className="toon-btn bg-emerald-400 pop-in">
      {label}
    </button>
  );
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div key={text} className={`pop-in rounded-xl border-[3px] border-black px-4 py-3 text-sm font-semibold sm:text-base ${ok ? "bg-emerald-200" : "bg-rose-200"}`}>
      {ok ? "✅ " : "❌ "}
      {text}
    </div>
  );
}

/* ---------------- HOTSPOT ---------------- */
export function HotspotTask({ step, onDone }: TaskProps<HotspotStep>) {
  const [found, setFound] = useState<number[]>([]);
  const [mist, setMist] = useState(0);
  const [last, setLast] = useState<{ ok: boolean; text: string } | null>(null);
  const [shake, setShake] = useState<number | null>(null);
  const total = step.parts.filter((p) => p.flag).length;
  const done = found.length === total;

  const click = (i: number) => {
    if (done) return;
    const p = step.parts[i];
    if (p.flag) {
      if (!found.includes(i)) {
        setFound([...found, i]);
        setLast({ ok: true, text: p.flag });
        sfx.ok();
      }
    } else {
      setMist((m) => m + 1);
      setLast({ ok: false, text: "Здесь ничего подозрительного. Ищи внимательнее!" });
      setShake(i);
      setTimeout(() => setShake(null), 400);
      sfx.bad();
    }
  };

  const body = (
    <p className="text-[15px] leading-8 sm:text-lg">
      {step.parts.map((p, i) => (
        <span
          key={i}
          onClick={() => click(i)}
          className={`cursor-pointer rounded px-0.5 transition ${found.includes(i) ? "bg-rose-300 font-bold underline decoration-rose-600 decoration-wavy" : "hover:bg-yellow-200"} ${shake === i ? "shake inline-block" : ""}`}
        >
          {p.t}
        </span>
      ))}
    </p>
  );

  let frame;
  if (step.frame === "sms") {
    frame = (
      <div className="mx-auto w-full max-w-md rounded-[2.2rem] border-[5px] border-black bg-slate-900 p-3 shadow-[8px_8px_0_#000]">
        <div className="mb-2 flex items-center justify-between px-3 text-xs text-slate-300"><span>09:41</span><span>📶 🔋</span></div>
        <div className="rounded-3xl bg-slate-100 p-4">
          <div className="mb-3 text-center text-sm font-bold text-slate-500">{step.meta.from}</div>
          <div className="rounded-2xl rounded-tl-none border-2 border-black bg-white p-3">{body}</div>
        </div>
      </div>
    );
  } else if (step.frame === "chat") {
    frame = (
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border-4 border-black bg-sky-100 shadow-[8px_8px_0_#000]">
        <div className="flex items-center gap-3 border-b-4 border-black bg-sky-500 px-4 py-2 text-white">
          <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-black bg-amber-300 font-black text-black">{step.meta.from?.[0]}</div>
          <div className="font-bold">{step.meta.from}</div>
          <div className="ml-auto text-xs opacity-80">в сети</div>
        </div>
        <div className="p-4"><div className="rounded-2xl rounded-tl-none border-2 border-black bg-white p-3">{body}</div></div>
      </div>
    );
  } else if (step.frame === "email") {
    frame = (
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border-4 border-black bg-white shadow-[8px_8px_0_#000]">
        <div className="border-b-4 border-black bg-amber-100 px-4 py-2 text-sm">
          <div><b>От:</b> {step.meta.from}</div>
          <div><b>Тема:</b> {step.meta.subject}</div>
        </div>
        <div className="p-4">{body}</div>
      </div>
    );
  } else {
    frame = (
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border-4 border-black bg-white shadow-[8px_8px_0_#000]">
        <div className="flex items-center gap-2 border-b-4 border-black bg-slate-200 px-3 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-yellow-400" /><span className="h-3 w-3 rounded-full bg-green-400" />
          <div className="ml-2 flex-1 rounded-md border-2 border-black bg-white px-3 py-1 font-mono text-sm">🔒 https://{step.meta.url}</div>
        </div>
        <div className="p-5">{body}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2 text-lg font-black text-white">
        Найдено: <span className="rounded-lg border-2 border-black bg-yellow-300 px-3 text-black">{found.length} / {total}</span>
        {mist > 0 && <span className="text-sm text-rose-300">ошибок: {mist}</span>}
      </div>
      {frame}
      {last && <Feedback ok={last.ok} text={last.text} />}
      {done && <div className="flex justify-center"><NextBtn onClick={() => onDone(mist)} /></div>}
    </div>
  );
}

/* ---------------- SORT ---------------- */
export function SortTask({ step, onDone }: TaskProps<SortStep>) {
  const [i, setI] = useState(0);
  const [mist, setMist] = useState(0);
  const [ans, setAns] = useState<null | { ok: boolean; why: string }>(null);
  const [fly, setFly] = useState<0 | 1 | null>(null);
  const item = step.items[i];
  const pick = (b: 0 | 1) => {
    if (ans) return;
    const ok = item.bin === b;
    if (!ok) setMist((m) => m + 1);
    ok ? sfx.ok() : sfx.bad();
    setFly(b);
    setAns({ ok, why: item.why });
  };
  const next = () => {
    setAns(null);
    setFly(null);
    if (i + 1 >= step.items.length) onDone(mist);
    else setI(i + 1);
  };
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4">
      <div className="font-black text-white">Карточка {i + 1} / {step.items.length}</div>
      <div key={i} className={`toon-card w-full bg-white p-6 text-center text-xl font-bold sm:text-2xl ${fly === 0 ? "fly-left" : fly === 1 ? "fly-right" : "pop-in"}`}>
        <span className="font-mono">{item.text}</span>
      </div>
      {!ans ? (
        <div className="grid w-full grid-cols-2 gap-3">
          <button onClick={() => pick(0)} className="toon-btn bg-emerald-300 text-lg">{step.bins[0]}</button>
          <button onClick={() => pick(1)} className="toon-btn bg-rose-300 text-lg">{step.bins[1]}</button>
        </div>
      ) : (
        <>
          <Feedback ok={ans.ok} text={ans.why} />
          <NextBtn onClick={next} />
        </>
      )}
    </div>
  );
}

/* ---------------- PASSWORD ---------------- */
function crackTime(pw: string) {
  let n = 0;
  if (/[a-z]/.test(pw)) n += 26;
  if (/[A-Z]/.test(pw)) n += 26;
  if (/[а-яё]/.test(pw)) n += 33;
  if (/[А-ЯЁ]/.test(pw)) n += 33;
  if (/\d/.test(pw)) n += 10;
  if (/[^a-zA-Zа-яА-ЯёЁ0-9]/.test(pw)) n += 32;
  const bits = pw.length * Math.log2(Math.max(n, 1));
  const sec = Math.pow(2, bits) / 1e10;
  if (sec < 1) return { t: "мгновенно", bits };
  if (sec < 3600) return { t: `${Math.round(sec / 60)} мин`, bits };
  if (sec < 86400 * 365) return { t: `${Math.round(sec / 86400)} дней`, bits };
  const y = sec / (86400 * 365);
  if (y > 1e9) return { t: "миллиарды лет", bits };
  if (y > 1e6) return { t: `${Math.round(y / 1e6)} млн лет`, bits };
  return { t: `${Math.round(y).toLocaleString("ru")} лет`, bits };
}

export function PasswordTask({ step, onDone }: TaskProps<PasswordStep>) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const lower = pw.toLowerCase();
  const checks = [
    { ok: pw.length >= step.minLen, t: `Не меньше ${step.minLen} символов` },
    { ok: /[A-ZА-ЯЁ]/.test(pw) && /[a-zа-яё]/.test(pw), t: "Заглавные и строчные буквы" },
    { ok: /\d/.test(pw), t: "Хотя бы одна цифра" },
    { ok: /[^a-zA-Zа-яА-ЯёЁ0-9]/.test(pw), t: "Спецсимвол (!, -, #, …)" },
    { ok: pw.length > 0 && !step.banned.some((b) => lower.includes(b)), t: "Без имени, года рождения и «qwerty/123»" },
    { ok: pw.length > 0 && !/(.)\1\1/.test(pw), t: "Без трёх одинаковых символов подряд" },
  ];
  const all = checks.every((c) => c.ok);
  const ct = crackTime(pw);
  const pct = Math.min(100, (ct.bits / 90) * 100);
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="toon-card bg-white p-5">
        <div className="flex gap-2">
          <input
            value={pw}
            onChange={(e) => { setPw(e.target.value); sfx.type(); }}
            type={show ? "text" : "password"}
            placeholder="Например: Зубр-Пьёт-Чай-В-Пуще-2026!"
            className="flex-1 rounded-xl border-[3px] border-black px-3 py-3 font-mono text-lg outline-none focus:bg-yellow-50"
          />
          <button onClick={() => setShow(!show)} className="toon-btn bg-slate-200 px-3">{show ? "🙈" : "👁️"}</button>
        </div>
        <div className="mt-4 h-5 overflow-hidden rounded-full border-[3px] border-black bg-slate-200">
          <div className="h-full transition-all duration-300" style={{ width: `${pct}%`, background: pct < 35 ? "#ef4444" : pct < 65 ? "#f59e0b" : "#22c55e" }} />
        </div>
        <div className="mt-2 text-sm font-bold">⏱ Время взлома перебором: <span className="text-indigo-700">{pw ? ct.t : "—"}</span></div>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.t} className={`text-sm font-semibold ${c.ok ? "text-emerald-700" : "text-slate-500"}`}>{c.ok ? "✅" : "⬜"} {c.t}</li>
          ))}
        </ul>
      </div>
      {all && <div className="flex justify-center"><NextBtn label="Установить пароль ✓" onClick={() => { sfx.ok(); onDone(0); }} /></div>}
    </div>
  );
}

/* ---------------- TERMINAL ---------------- */
export function TerminalTask({ step, onDone }: TaskProps<TerminalStep>) {
  const [lines, setLines] = useState<{ t: string; k: "in" | "out" | "sys" | "err" }[]>([
    { t: "КиберЩит OS v2.6 — терминал УПК МВД", k: "sys" },
    { t: "Введите help для списка команд.", k: "sys" },
  ]);
  const [ti, setTi] = useState(0);
  const [val, setVal] = useState("");
  const [mist, setMist] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = ti >= step.tasks.length;
  const cmds = Array.from(new Set(step.tasks.map((t) => t.cmd.split(" ")[0])));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines]);

  const submit = () => {
    const raw = val.trim();
    if (!raw) return;
    const norm = raw.toLowerCase().replace(/\s+/g, " ");
    const out: typeof lines = [{ t: `agent@upk:~$ ${raw}`, k: "in" }];
    setVal("");
    if (norm === "clear") {
      setLines([]);
      return;
    }
    if (norm === "help") {
      out.push({ t: `Команды: ${cmds.join(", ")}, help, clear`, k: "sys" });
      step.tasks.forEach((t) => {
        const [c, ...rest] = t.cmd.split(" ");
        out.push({ t: `  ${c} ${rest.length ? "<" + (rest.length > 1 ? "параметры" : "аргумент") + ">" : ""}`, k: "sys" });
      });
    } else if (!done && norm === step.tasks[ti].cmd.toLowerCase()) {
      step.tasks[ti].output.forEach((o) => out.push({ t: o, k: "out" }));
      out.push({ t: "✓ Цель выполнена", k: "sys" });
      sfx.ok();
      setTi(ti + 1);
    } else {
      out.push({ t: `Нет результата для «${raw}». Проверь цель и синтаксис (help).`, k: "err" });
      setMist((m) => m + 1);
      sfx.bad();
    }
    setLines((l) => [...l, ...out]);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <div className="toon-card bg-yellow-200 p-3 text-sm font-bold sm:text-base">
        {done ? "🎯 Все цели выполнены!" : <>🎯 Цель {ti + 1}/{step.tasks.length}: {step.tasks[ti].goal}</>}
      </div>
      <div onClick={() => inputRef.current?.focus()} className="h-72 overflow-y-auto rounded-xl border-4 border-black bg-[#0b1020] p-3 font-mono text-[13px] shadow-[8px_8px_0_#000] sm:h-80 sm:text-sm">
        {lines.map((l, i) => (
          <div key={i} className={l.k === "in" ? "text-sky-300" : l.k === "err" ? "text-rose-400" : l.k === "sys" ? "text-slate-400" : "text-emerald-300"}>{l.t}</div>
        ))}
        {!done && (
          <div className="flex text-sky-300">
            <span>agent@upk:~$&nbsp;</span>
            <input
              ref={inputRef}
              autoFocus
              value={val}
              onChange={(e) => { setVal(e.target.value); sfx.type(); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="flex-1 bg-transparent text-sky-200 caret-emerald-400 outline-none"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {!done && <span className="text-xs text-slate-300">Подсказка: команда пишется вместе с аргументом, например <code className="rounded bg-slate-800 px-1">{step.tasks[ti].cmd.split(" ")[0]} …</code></span>}
        {done && <NextBtn onClick={() => onDone(Math.min(mist, 4))} />}
      </div>
    </div>
  );
}

/* ---------------- LOGS ---------------- */
export function LogsTask({ step, onDone }: TaskProps<LogsStep>) {
  const [sel, setSel] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [mist, setMist] = useState(0);
  const toggle = (i: number) => {
    if (checked) return;
    sfx.click();
    setSel(sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]);
  };
  const check = () => {
    const wrong = sel.filter((i) => !step.bad.includes(i)).length;
    const missed = step.bad.filter((i) => !sel.includes(i)).length;
    setMist(wrong + missed);
    setChecked(true);
    wrong + missed === 0 ? sfx.ok() : sfx.bad();
  };
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <div className="overflow-hidden rounded-xl border-4 border-black bg-[#0b1020] font-mono text-[12px] shadow-[8px_8px_0_#000] sm:text-sm">
        {step.lines.map((l, i) => {
          const isSel = sel.includes(i);
          const isBad = step.bad.includes(i);
          let cls = isSel ? "bg-amber-500/30 text-amber-200" : "text-emerald-300 hover:bg-white/5";
          if (checked) cls = isBad ? (isSel ? "bg-emerald-600/40 text-white" : "bg-rose-600/40 text-white") : isSel ? "bg-rose-600/40 text-white line-through" : "text-slate-500";
          return (
            <div key={i} onClick={() => toggle(i)} className={`cursor-pointer whitespace-pre-wrap border-b border-white/5 px-3 py-2 ${cls}`}>
              <span className="mr-2 text-slate-500">{String(i + 1).padStart(2, "0")}</span>
              {checked && isBad ? "⚠ " : isSel ? "▶ " : ""}
              {l}
            </div>
          );
        })}
      </div>
      {!checked ? (
        <div className="flex justify-center">
          <button disabled={!sel.length} onClick={check} className="toon-btn bg-yellow-300 disabled:opacity-50">Проверить ({sel.length})</button>
        </div>
      ) : (
        <>
          <Feedback ok={mist === 0} text={(mist ? `Ошибок: ${mist}. ` : "Идеально! ") + step.explain} />
          <div className="flex justify-center"><NextBtn onClick={() => onDone(mist)} /></div>
        </>
      )}
    </div>
  );
}

/* ---------------- ORDER ---------------- */
export function OrderTask({ step, onDone }: TaskProps<OrderStep>) {
  const initial = useMemo(() => {
    const idx = step.items.map((_, i) => i);
    // детерминированное перемешивание
    const out = [...idx].sort((a, b) => ((a * 7 + 3) % 5) - ((b * 7 + 3) % 5));
    if (out.every((v, i) => v === i)) out.reverse();
    return out;
  }, [step.items]);
  const [arr, setArr] = useState(initial);
  const [mist, setMist] = useState(0);
  const [wrong, setWrong] = useState<number[] | null>(null);
  const [ok, setOk] = useState(false);
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= arr.length || ok) return;
    const a = [...arr];
    [a[i], a[j]] = [a[j], a[i]];
    setArr(a);
    setWrong(null);
    sfx.click();
  };
  const check = () => {
    const w = arr.map((v, i) => (v === i ? -1 : i)).filter((x) => x >= 0);
    if (!w.length) {
      setOk(true);
      sfx.ok();
    } else {
      setWrong(w);
      setMist((m) => m + 1);
      sfx.bad();
    }
  };
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
      {arr.map((v, i) => (
        <div key={v} className={`toon-card flex items-center gap-3 p-3 transition ${ok ? "bg-emerald-200" : wrong?.includes(i) ? "bg-rose-200 shake" : "bg-white"}`}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-[3px] border-black bg-yellow-300 font-black">{i + 1}</div>
          <div className="flex-1 text-sm font-semibold sm:text-base">{step.items[v]}</div>
          {!ok && (
            <div className="flex flex-col gap-1">
              <button onClick={() => move(i, -1)} className="rounded-md border-2 border-black bg-sky-200 px-2 text-sm font-black hover:bg-sky-300">▲</button>
              <button onClick={() => move(i, 1)} className="rounded-md border-2 border-black bg-sky-200 px-2 text-sm font-black hover:bg-sky-300">▼</button>
            </div>
          )}
        </div>
      ))}
      {wrong && <Feedback ok={false} text={`Неверно стоят пункты: ${wrong.map((w) => w + 1).join(", ")}. Попробуй ещё.`} />}
      <div className="flex justify-center">
        {ok ? <NextBtn onClick={() => onDone(mist)} /> : <button onClick={check} className="toon-btn bg-yellow-300">Проверить порядок</button>}
      </div>
    </div>
  );
}

/* ---------------- SELECT ---------------- */
export function SelectTask({ step, onDone }: TaskProps<SelectStep>) {
  const [sel, setSel] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [mist, setMist] = useState(0);
  const check = () => {
    const m = step.items.reduce((acc, it, i) => acc + (it.ok !== sel.includes(i) ? 1 : 0), 0);
    setMist(m);
    setChecked(true);
    m === 0 ? sfx.ok() : sfx.bad();
  };
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {step.items.map((it, i) => {
          const on = sel.includes(i);
          let bg = on ? "bg-yellow-200" : "bg-white";
          if (checked) bg = it.ok ? (on ? "bg-emerald-200" : "bg-rose-200") : on ? "bg-rose-200" : "bg-slate-100";
          return (
            <button
              key={i}
              onClick={() => { if (!checked) { sfx.click(); setSel(on ? sel.filter((x) => x !== i) : [...sel, i]); } }}
              className={`toon-card flex items-center gap-3 p-3 text-left ${bg} ${on && !checked ? "-translate-y-0.5" : ""}`}
            >
              <span className="text-3xl">{it.icon}</span>
              <span className="flex-1">
                <span className="block text-sm font-bold sm:text-base">{it.label}</span>
                {checked && it.why && <span className="block text-xs text-slate-700">{it.why}</span>}
                {checked && it.ok && !on && <span className="block text-xs text-rose-700">Это нужно было отметить</span>}
              </span>
              <span className="text-xl">{checked ? (it.ok === on ? "✅" : "❌") : on ? "☑️" : "⬜"}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center">
        {!checked ? <button onClick={check} className="toon-btn bg-yellow-300">Проверить</button> : <NextBtn onClick={() => onDone(mist)} />}
      </div>
    </div>
  );
}

/* ---------------- INPUT ---------------- */
export function InputTask({ step, onDone }: TaskProps<InputStep>) {
  const [v, setV] = useState("");
  const [mist, setMist] = useState(0);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const check = () => {
    const n = v.trim().toLowerCase().replace(/ё/g, "е");
    if (step.answers.some((a) => a.toLowerCase().replace(/ё/g, "е") === n)) {
      setOk(true);
      sfx.ok();
    } else {
      setMist((m) => m + 1);
      setErr(true);
      setTimeout(() => setErr(false), 500);
      sfx.bad();
    }
  };
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="toon-card bg-slate-900 p-6 text-center font-mono text-3xl font-black tracking-[0.3em] text-emerald-300 sm:text-4xl">{step.puzzle}</div>
      {step.helper && <div className="toon-card bg-white p-3 text-center font-mono text-sm tracking-wider sm:text-base">{step.helper}</div>}
      <div className="text-center font-bold text-white">{step.question}</div>
      <div className={`flex gap-2 ${err ? "shake" : ""}`}>
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} disabled={ok} className="flex-1 rounded-xl border-[3px] border-black px-3 py-3 text-center text-xl font-black uppercase outline-none" placeholder="ответ" />
        {!ok && <button onClick={check} className="toon-btn bg-yellow-300">Проверить</button>}
      </div>
      {ok && <Feedback ok text="Расшифровано верно!" />}
      {mist > 0 && !ok && <Feedback ok={false} text={`Не то. Попыток: ${mist}`} />}
      {ok && <div className="flex justify-center"><NextBtn onClick={() => onDone(mist)} /></div>}
    </div>
  );
}

/* ---------------- MAP PICK ---------------- */
export function MapPickTask({ step, onDone }: TaskProps<MapPickStep>) {
  const [mist, setMist] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const pick = (id: string) => {
    if (ok) return;
    if (id === step.answer) {
      setOk(true);
      sfx.ok();
    } else {
      setMist((m) => m + 1);
      setWrong(id);
      sfx.bad();
      setTimeout(() => setWrong(null), 700);
    }
  };
  const city = CITIES.find((c) => c.id === step.answer);
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-[1fr_2fr]">
      <div className="toon-card flex flex-col gap-2 bg-white p-4">
        <div className="font-black">🔎 Улики:</div>
        {step.clues.map((c, i) => (
          <div key={i} className="rounded-lg border-2 border-black bg-yellow-100 p-2 text-sm font-semibold">{i + 1}. {c}</div>
        ))}
        {ok && <Feedback ok text={`Верно: ${city?.name}!`} />}
        {mist > 0 && !ok && <div className="text-sm font-bold text-rose-600">Не тот город. Ошибок: {mist}</div>}
        {ok && <NextBtn onClick={() => onDone(mist)} />}
      </div>
      <div className="toon-card bg-sky-200 p-2">
        <BelarusMap showAllCities onCity={pick} selected={ok ? step.answer : null} wrongCity={wrong} className="h-auto w-full" />
      </div>
    </div>
  );
}

/* ---------------- INTERROGATION ---------------- */
export function InterrogationTask({ step, s, onDone }: TaskProps<InterrogationStep>) {
  const [round, setRound] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [speech, setSpeech] = useState<string>(fill(step.intro, s));
  const [who, setWho] = useState<"suspect" | "sys">("sys");
  const [mist, setMist] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [caught, setCaught] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [mood, setMood] = useState<"neutral" | "shock">("neutral");
  const r = step.rounds[round];
  const suspect = CHARACTERS[step.suspect];

  const flash = (t: string) => {
    setCaption(t);
    setTimeout(() => setCaption(null), 1500);
  };

  const choose = (i: number) => {
    if (caught) return;
    sfx.click();
    setSel(i);
    setWho("suspect");
    setSpeech(r.statements[i].text);
  };
  const press = () => {
    if (sel === null) return;
    sfx.click();
    setWho("suspect");
    setSpeech(r.statements[sel].press);
  };
  const present = (eid: string) => {
    setDrawer(false);
    if (sel === null) return;
    if (sel === r.answer.s && eid === r.answer.e) {
      sfx.objection();
      flash("ПОПАЛСЯ!");
      setMood("shock");
      setCaught(true);
      setWho("suspect");
      setSpeech(r.breakText);
    } else {
      sfx.bad();
      setMist((m) => m + 1);
      setWho("suspect");
      const taunts = ["Ха! И что это доказывает?", "Это вообще не про то, начальник.", "Пф-ф. Мимо.", "Вы что-то путаете…"];
      setSpeech(taunts[(mist + round) % taunts.length]);
      flash("МИМО!");
    }
  };
  const nextRound = () => {
    setCaught(false);
    setMood("neutral");
    setSel(null);
    if (round + 1 >= step.rounds.length) {
      setFinished(true);
      setWho("sys");
      setSpeech(step.confession);
      sfx.fanfare();
    } else {
      setRound(round + 1);
      setWho("sys");
      setSpeech("Новые показания. Слушай внимательно и ищи противоречие.");
    }
  };

  return (
    <div className="relative flex scene-box flex-1 flex-col overflow-hidden rounded-2xl border-4 border-black">
      <SceneBg bg="interrogation" />
      {caption && <BigCaption text={caption} />}
      <div className="relative z-10 flex items-center justify-between gap-2 p-3">
        <div className="toon-chip bg-white">🎙 {step.title}</div>
        <div className="toon-chip bg-yellow-300">Показания {Math.min(round + 1, step.rounds.length)}/{step.rounds.length}</div>
        <div className="toon-chip bg-rose-200">Промахи: {mist}</div>
      </div>
      <div className="relative z-10 flex flex-1 items-end justify-center gap-4 px-3">
        <div className={`relative w-44 shrink-0 sm:w-64 ${mood === "shock" ? "shake" : "breathe"}`}>
          <Portrait id={step.suspect} s={s} className="h-56 w-full sm:h-80" mood={mood} />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-[3px] border-black bg-white px-3 py-0.5 text-sm font-black">{suspect?.name}</div>
        </div>
        <div className="mb-16 max-w-md flex-1">
          <div key={speech} className={`bubble pop-in ${who === "sys" ? "bg-amber-100" : "bg-white"}`}>
            <div className="mb-1 text-xs font-black uppercase text-slate-500">{who === "sys" ? "Протокол" : suspect?.name}</div>
            <div className="text-base font-semibold sm:text-lg">{speech}</div>
          </div>
        </div>
      </div>
      <div className="relative z-10 border-t-4 border-black bg-slate-900/90 p-3">
        {finished ? (
          <div className="flex justify-center"><NextBtn label="Завершить допрос ✓" onClick={() => onDone(mist)} /></div>
        ) : caught ? (
          <div className="flex justify-center"><NextBtn label={round + 1 >= step.rounds.length ? "К признанию →" : "Следующие показания →"} onClick={nextRound} /></div>
        ) : (
          <>
            <div className="mb-2 grid gap-2 sm:grid-cols-3">
              {r.statements.map((st, i) => (
                <button key={i} onClick={() => choose(i)} className={`rounded-xl border-[3px] border-black px-3 py-2 text-left text-sm font-bold transition ${sel === i ? "bg-yellow-300" : "bg-white hover:bg-yellow-100"}`}>
                  «{st.text}»
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button disabled={sel === null} onClick={press} className="toon-btn bg-sky-300 disabled:opacity-40">🗣 Надавить</button>
              <button disabled={sel === null} onClick={() => setDrawer(true)} className="toon-btn bg-rose-400 disabled:opacity-40">📂 Предъявить улику</button>
            </div>
          </>
        )}
      </div>
      {drawer && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-4" onClick={() => setDrawer(false)}>
          <div className="toon-card pop-in w-full max-w-2xl bg-amber-50 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-lg font-black">📂 Папка с уликами — что предъявить?</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {step.evidence.map((e) => (
                <button key={e.id} onClick={() => present(e.id)} className="flex gap-3 rounded-xl border-[3px] border-black bg-white p-3 text-left hover:bg-yellow-100">
                  <span className="text-3xl">{e.icon}</span>
                  <span><span className="block font-black">{e.name}</span><span className="block text-xs text-slate-600">{e.desc}</span></span>
                </button>
              ))}
            </div>
            <button onClick={() => setDrawer(false)} className="mt-3 text-sm font-bold underline">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
