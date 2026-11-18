"use client";
import { useEffect, useRef, useState } from "react";
import type { CallScript, GameState } from "@/game/types";
import { CHARACTERS } from "@/game/data";
import { sfx } from "@/game/sound";
import { babbleText, speak, stopSpeak } from "@/game/voice";
import { Portrait } from "./Toon";

const LINE_TIME = 12; // секунд на ответ

interface Msg {
  who: "them" | "me" | "sys";
  text: string;
}

export function CallTask({ script, s, onDone }: { script: CallScript; s: GameState; onDone: (mistakes: number) => void }) {
  const [phase, setPhase] = useState<"ring" | "talk" | "end">("ring");
  const [li, setLi] = useState(0);
  const [left, setLeft] = useState(LINE_TIME);
  const [mist, setMist] = useState(0);
  const [log, setLog] = useState<Msg[]>([]);
  const [seenFlags, setSeenFlags] = useState<number[]>([]);
  const [leaks, setLeaks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null);
  const [dur, setDur] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const female = s.gender === "f";
  const charImg = CHARACTERS[script.voice]?.img;

  // звонок
  useEffect(() => {
    if (phase !== "ring") return;
    const id = setInterval(() => sfx.notify(), 1200);
    sfx.notify();
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => () => stopSpeak(), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [log]);

  const say = (text: string) => {
    speak(text, script.voice, female);
    babbleText(text, script.voice, female);
  };

  const showLine = (i: number) => {
    if (endedRef.current) return;
    const line = script.lines[i];
    setLog((l) => [...l, { who: "them", text: line.text }]);
    if (line.flag) setSeenFlags((f) => (f.includes(i) ? f : [...f, i]));
    leftRef.current = LINE_TIME;
    setLeft(LINE_TIME);
    setBusy(false);
    say(line.text);
  };

  const endedRef = useRef(false);
  const finish = (m: number, ok: boolean, text: string) => {
    if (endedRef.current) return;
    endedRef.current = true;
    stopSpeak();
    setMist(m);
    setVerdict({ ok, text });
    setPhase("end");
    ok ? sfx.ok() : sfx.bad();
  };

  const advance = (m: number) => {
    if (endedRef.current) return;
    const n = li + 1;
    if (n >= script.lines.length) {
      if (script.legit) finish(m, m === 0, m === 0 ? "Это был настоящий звонок, и вы провели разговор безопасно." : "Звонок был настоящим, но вы выдали лишнее.");
      else finish(m + 2, false, "Вы дослушали мошенника до конца и продолжали разговор. В реальности это закончилось бы потерей денег.");
      return;
    }
    setLi(n);
    showLine(n);
  };

  // таймер ответа
  const leftRef = useRef(LINE_TIME);
  const mistRef = useRef(0);
  useEffect(() => {
    mistRef.current = mist;
  }, [mist]);
  useEffect(() => {
    if (phase !== "talk" || busy) return;
    leftRef.current = Math.max(leftRef.current, 0.1);
    const id = setInterval(() => {
      leftRef.current = Math.max(0, leftRef.current - 0.1);
      setLeft(leftRef.current);
      setDur((d) => d + 0.1);
      if (leftRef.current <= 0) {
        clearInterval(id);
        if (endedRef.current) return;
        setBusy(true);
        if (!script.legit) {
          setLog((l) => [...l, { who: "sys", text: "⏱ Вы замешкались — собеседник давит сильнее!" }]);
          sfx.bad();
          const nm = mistRef.current + 0.5;
          setMist(nm);
          setTimeout(() => advance(nm), 500);
        } else {
          setTimeout(() => advance(mistRef.current), 500);
        }
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, li, busy]);

  const answer = () => {
    sfx.click();
    setPhase("talk");
    setLi(0);
    showLine(0);
  };

  const decline = () => {
    sfx.click();
    if (script.legit) finish(1, false, "Это был настоящий звонок. Ничего страшного — но перезвонить по официальному номеру всё же стоит.");
    else finish(0.5, true, "Вы сбросили звонок, не слушая. Осторожность не бывает лишней! Но давайте научимся узнавать признаки обмана.");
  };

  const pick = (oi: number) => {
    if (busy || endedRef.current) return;
    const opt = script.lines[li].options[oi];
    setBusy(true);
    setLog((l) => [...l, { who: "me", text: opt.t }]);
    let m = mist;
    if (opt.leak) {
      m += 1;
      setLeaks((x) => [...x, opt.leak!]);
      sfx.bad();
      setTimeout(() => setLog((l) => [...l, { who: "sys", text: `⚠ Вы сообщили: ${opt.leak}` }]), 200);
    } else sfx.click();
    setMist(m);
    if (opt.reply) {
      setTimeout(() => {
        if (endedRef.current) return;
        setLog((l) => [...l, { who: "them", text: opt.reply! }]);
        say(opt.reply!);
      }, 500);
    }
    setTimeout(() => advance(m), opt.reply ? 1900 : 900);
  };

  const hangUp = () => {
    if (endedRef.current) return;
    sfx.click();
    setLog((l) => [...l, { who: "sys", text: "📵 Вы положили трубку" }]);
    if (script.legit) {
      finish(mist + 1, false, "Это был настоящий звонок. Ничего страшного: перезвонить по официальному номеру — тоже правильно.");
    } else if (seenFlags.length > 0) {
      finish(mist, mist === 0, mist === 0 ? "Отлично! Вы распознали обман и вовремя положили трубку." : "Вы положили трубку — но успели сообщить лишнее.");
    } else {
      finish(mist + 0.5, true, "Положили трубку до явных признаков. Перестраховка — не ошибка, но попробуйте узнать сигналы.");
    }
  };

  const line = script.lines[li];
  const pressure = Math.min(100, ((li + (LINE_TIME - left) / LINE_TIME) / script.lines.length) * 100);

  return (
    <div className="mx-auto grid w-full max-w-4xl items-start gap-4 md:grid-cols-[minmax(0,360px)_1fr]">
      {/* телефон */}
      <div className="mx-auto w-full max-w-[360px] rounded-[2.5rem] border-[6px] border-black bg-slate-900 p-3 shadow-[8px_8px_0_#000]">
        <div className="mb-1 flex justify-between px-4 text-[11px] text-slate-400"><span>📶 BY</span><span>{phase === "talk" ? `${Math.floor(dur / 60)}:${String(Math.floor(dur % 60)).padStart(2, "0")}` : "09:41"}</span><span>🔋</span></div>
        <div className="flex min-h-[460px] flex-col rounded-[2rem] bg-gradient-to-b from-slate-800 to-slate-950 p-4 text-white">
          <div className="flex flex-col items-center">
            <div className={`relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-sky-300 ${phase === "ring" ? "ring-pulse" : ""}`}>
              {charImg ? <Portrait id={script.voice} s={s} className="absolute -bottom-2 h-28 w-full" /> : <div className="grid h-full place-items-center text-5xl">{script.voice === "female" ? "👩" : "👤"}</div>}
            </div>
            <div className="mt-2 text-center text-lg font-black">{script.caller}</div>
            <div className="text-xs text-slate-400">{script.number}</div>
            <div className="mt-1 text-xs font-bold text-emerald-300">{phase === "ring" ? "Входящий вызов…" : phase === "talk" ? "Идёт разговор" : "Вызов завершён"}</div>
          </div>
          {phase === "ring" && (
            <div className="mt-auto flex justify-around pb-4">
              <button onClick={decline} className="grid h-16 w-16 place-items-center rounded-full border-4 border-black bg-red-500 text-3xl shadow-[3px_3px_0_#000]">📵</button>
              <button onClick={answer} className="grid h-16 w-16 animate-bounce place-items-center rounded-full border-4 border-black bg-emerald-500 text-3xl shadow-[3px_3px_0_#000]">📞</button>
            </div>
          )}
          {phase === "talk" && (
            <>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-black uppercase text-rose-300"><span>Давление</span><span>{Math.ceil(left)} с</span></div>
                <div className="h-2.5 overflow-hidden rounded-full border-2 border-black bg-slate-700"><div className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all" style={{ width: `${pressure}%` }} /></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-700"><div className="h-full bg-sky-400" style={{ width: `${(left / LINE_TIME) * 100}%` }} /></div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {line.options.map((o, i) => (
                  <button key={li + "-" + i} disabled={busy} onClick={() => pick(i)} className="rounded-xl border-[3px] border-black bg-white px-3 py-2 text-left text-sm font-bold text-black shadow-[3px_3px_0_#000] hover:bg-yellow-100 disabled:opacity-50">
                    💬 {o.t}
                  </button>
                ))}
              </div>
              <button onClick={hangUp} className="mt-auto rounded-2xl border-4 border-black bg-red-500 py-3 text-lg font-black shadow-[3px_3px_0_#000] hover:bg-red-600">📵 Положить трубку</button>
            </>
          )}
          {phase === "end" && verdict && (
            <div className="mt-4 flex flex-1 flex-col gap-2">
              <div className={`rounded-xl border-[3px] border-black p-2 text-sm font-bold text-black ${verdict.ok ? "bg-emerald-300" : "bg-rose-300"}`}>{verdict.ok ? "✅ " : "❌ "}{verdict.text}</div>
              <div className="rounded-xl border-[3px] border-black bg-amber-100 p-2 text-xs font-semibold text-black">
                Это был {script.legit ? <b className="text-emerald-700">НАСТОЯЩИЙ звонок</b> : <b className="text-rose-700">МОШЕННИК</b>}. {script.outro}
              </div>
              <button onClick={() => onDone(mist)} className="toon-btn mt-auto bg-emerald-400">Далее →</button>
            </div>
          )}
        </div>
      </div>
      {/* стенограмма и разбор */}
      <div className="flex flex-col gap-3">
        <div className="toon-card max-h-80 overflow-y-auto bg-white p-3">
          <div className="mb-2 text-xs font-black uppercase text-slate-500">📝 Стенограмма разговора</div>
          {log.length === 0 && <div className="text-sm text-slate-500">Телефон звонит… Ответить или сбросить?</div>}
          {log.map((m, i) => (
            <div key={i} className={`mb-1.5 flex ${m.who === "me" ? "justify-end" : m.who === "sys" ? "justify-center" : "justify-start"}`}>
              <div className={`pop-in max-w-[85%] rounded-2xl border-2 border-black px-3 py-1.5 text-sm font-semibold ${m.who === "me" ? "bg-sky-200" : m.who === "sys" ? "bg-amber-100 text-xs" : "bg-slate-100"}`}>{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        {phase === "end" && !script.legit && (
          <div className="toon-card pop-in bg-rose-50 p-3">
            <div className="font-black">🚩 Красные флаги в этом звонке:</div>
            <ul className="mt-1 space-y-1 text-sm">
              {script.lines.map((l, i) => l.flag && (
                <li key={i} className="rounded-lg border-2 border-black bg-white px-2 py-1">{seenFlags.includes(i) ? "👁️" : "🙈"} {l.flag}</li>
              ))}
            </ul>
            {leaks.length > 0 && <div className="mt-2 text-sm font-bold text-rose-700">Вы выдали: {leaks.join(", ")}</div>}
          </div>
        )}
        {phase !== "end" && (
          <div className="toon-card bg-slate-900 p-3 text-sm text-slate-200">
            💡 Правило: настоящий банк, милиция или поликлиника <b>никогда</b> не просят коды, CVV, пароли и переводы. Слышишь такое — клади трубку.
          </div>
        )}
      </div>
    </div>
  );
}
