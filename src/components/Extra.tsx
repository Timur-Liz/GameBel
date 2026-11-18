"use client";
import { useCallback, useEffect, useState } from "react";
import type { GameState } from "@/game/types";
import { CHARACTERS, RANKS, rankOf } from "@/game/data";
import { ACHIEVEMENTS } from "@/game/achievements";
import { CASES, SIDE_CASES } from "@/game/incidents";
import { caseStatus } from "@/game/status";
import { TRAINER_CALLS } from "@/game/calls";
import { sfx } from "@/game/sound";
import { Portrait } from "./Toon";
import { CallTask } from "./CallTask";
import { asset, IS_STATIC } from "@/lib/paths";

/* ================= СЕРТИФИКАТ ================= */
export const CERT_MIN_CASES = 5;

async function makeCertificate(s: GameState) {
  const { PDFDocument, rgb } = await import("pdf-lib");
  const fontkit = (await import("@pdf-lib/fontkit")).default;
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const GH = "https://raw.githubusercontent.com/google/fonts/main/ofl/";
  const sources: [string, string][] = [
    ["/fonts/PTSans-Regular.ttf", GH + "ptsans/PT_Sans-Web-Regular.ttf"],
    ["/fonts/PTSans-Bold.ttf", GH + "ptsans/PT_Sans-Web-Bold.ttf"],
    ["/fonts/RussoOne.ttf", GH + "russoone/RussoOne-Regular.ttf"],
  ];
  // если папки public нет — шрифты скачиваются из открытого репозитория Google Fonts
  const loadFont = async ([local, remote]: [string, string]) => {
    try {
      const r = await fetch(asset(local));
      const ct = r.headers.get("content-type") ?? "";
      if (r.ok && !ct.includes("text/html")) return await r.arrayBuffer();
    } catch {
      /* пробуем запасной источник */
    }
    const r2 = await fetch(remote);
    if (!r2.ok) throw new Error("Не удалось загрузить шрифт");
    return await r2.arrayBuffer();
  };
  const [reg, bold, cap] = await Promise.all(sources.map(loadFont));
  const fR = await pdf.embedFont(reg, { subset: true });
  const fB = await pdf.embedFont(bold, { subset: true });
  const fC = await pdf.embedFont(cap, { subset: true });
  const W = 842;
  const H = 595;
  const page = pdf.addPage([W, H]);
  const ink = rgb(0.09, 0.09, 0.14);
  const red = rgb(0.78, 0.1, 0.14);
  const blue = rgb(0.12, 0.3, 0.68);

  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 0.985, 0.94) });
  page.drawRectangle({ x: 18, y: 18, width: W - 36, height: H - 36, borderColor: ink, borderWidth: 6 });
  page.drawRectangle({ x: 30, y: 30, width: W - 60, height: H - 60, borderColor: red, borderWidth: 2 });
  // орнамент-ромбы по краям (мотив белорусского орнамента)
  for (let y = 50; y < H - 50; y += 26) {
    for (const x of [44, W - 44]) {
      page.drawSvgPath("M0 -8 L8 0 L0 8 L-8 0 Z", { x, y: y + 8, color: red });
      page.drawSvgPath("M0 -3 L3 0 L0 3 L-3 0 Z", { x, y: y + 8, color: rgb(1, 0.985, 0.94) });
    }
  }
  // щит-эмблема
  page.drawSvgPath("M0 0 L56 0 L56 34 Q56 70 28 84 Q0 70 0 34 Z", { x: W / 2 - 28, y: H - 44, color: blue, borderColor: ink, borderWidth: 3 });
  page.drawSvgPath("M10 30 L24 46 L48 18", { x: W / 2 - 28, y: H - 44, borderColor: rgb(1, 1, 1), borderWidth: 6 });

  const center = (t: string, y: number, font = fR, size = 14, color = ink) => {
    const w = font.widthOfTextAtSize(t, size);
    page.drawText(t, { x: (W - w) / 2, y, size, font, color });
  };
  const r = RANKS[rankOf(s.xp)];
  const solved = CASES.filter((c) => s.completed[c.id]).length;
  const f = s.gender === "f";
  center("СЕРТИФИКАТ", H - 180, fC, 46, ink);
  center("о прохождении курса практической кибербезопасности", H - 206, fR, 15);
  center("«КИБЕРЩИТ: БЕЛАРУСЬ»", H - 232, fB, 18, red);
  center("Настоящим подтверждается, что", H - 272, fR, 14);
  const name = s.name.length > 34 ? s.name.slice(0, 34) + "…" : s.name;
  center(name, H - 312, fB, 34, blue);
  page.drawLine({ start: { x: 220, y: H - 322 }, end: { x: W - 220, y: H - 322 }, thickness: 1, color: ink });
  center(`успешно ${f ? "прошла" : "прошёл"} обучение в управлении по противодействию киберпреступности`, H - 346, fR, 14);
  center(`и ${f ? "получила" : "получил"} игровое звание «${r.name}»`, H - 368, fB, 15);
  center(`Раскрыто дел: ${solved} из ${CASES.length}   ·   Защищено граждан: ${s.stats.protectedPeople}   ·   Достижений: ${(s.achievements ?? []).length}`, H - 398, fR, 12);
  center("Главные правила: никому не сообщать коды из SMS и CVV · перезванивать самому · проверять ссылки · включать 2FA · при обмане — 102", H - 420, fR, 10);

  const date = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  page.drawText("Наставник:", { x: 90, y: 110, size: 11, font: fR, color: ink });
  page.drawText("майор милиции В. П. Кравец", { x: 90, y: 94, size: 12, font: fB, color: ink });
  page.drawSvgPath("M0 0 C10 -14 20 10 30 -4 S50 -10 60 2", { x: 100, y: 132, borderColor: blue, borderWidth: 1.5 });
  page.drawText("Начальник управления:", { x: W - 300, y: 110, size: 11, font: fR, color: ink });
  page.drawText("полковник милиции Т. И. Стальная", { x: W - 300, y: 94, size: 12, font: fB, color: ink });
  page.drawSvgPath("M0 0 C8 -16 18 8 26 -6 S44 -12 64 0", { x: W - 290, y: 132, borderColor: blue, borderWidth: 1.5 });
  // печать
  page.drawCircle({ x: W / 2, y: 110, size: 42, borderColor: red, borderWidth: 2.5, opacity: 0, borderOpacity: 0.8 });
  page.drawCircle({ x: W / 2, y: 110, size: 34, borderColor: red, borderWidth: 1, opacity: 0, borderOpacity: 0.8 });
  const st = "КИБЕРЩИТ";
  page.drawText(st, { x: W / 2 - fB.widthOfTextAtSize(st, 11) / 2, y: 106, size: 11, font: fB, color: red, opacity: 0.85 });
  center(`Минск, ${date}   ·   № ${s.id.slice(0, 8).toUpperCase()}`, 52, fR, 10);
  center("Игровой сертификат. Персонажи вымышлены, советы по безопасности — реальные.", 38, fR, 8, rgb(0.4, 0.4, 0.45));

  const bytes = await pdf.save();
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Сертификат_КиберЩит_${s.name.replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function CertificateCard({ s }: { s: GameState }) {
  const solved = CASES.filter((c) => s.completed[c.id]).length;
  const ok = solved >= CERT_MIN_CASES;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="toon-card flex flex-col gap-3 bg-gradient-to-br from-amber-100 to-yellow-200 p-4 sm:flex-row sm:items-center">
      <div className="text-6xl">📜</div>
      <div className="flex-1">
        <div className="text-lg font-black">Сертификат о прохождении курса</div>
        <div className="text-sm">PDF с вашим именем, званием и статистикой — можно распечатать или показать в школе. {ok ? "" : `Нужно раскрыть ещё ${CERT_MIN_CASES - solved} дел(а).`}</div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-black bg-white"><div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (solved / CERT_MIN_CASES) * 100)}%` }} /></div>
        {err && <div className="text-xs font-bold text-rose-600">{err}</div>}
      </div>
      <button
        disabled={!ok || busy}
        onClick={async () => {
          setBusy(true);
          setErr(null);
          try {
            await makeCertificate(s);
            sfx.fanfare();
          } catch (e) {
            setErr("Не удалось создать PDF: " + String(e));
          }
          setBusy(false);
        }}
        className="toon-btn bg-emerald-400 disabled:opacity-40"
      >
        {busy ? "Создаём…" : ok ? "⬇ Скачать PDF" : "🔒 Недоступно"}
      </button>
    </div>
  );
}

/* ================= ДОСТИЖЕНИЯ ================= */
export function AchievementsView({ s }: { s: GameState }) {
  const have = new Set(s.achievements ?? []);
  return (
    <div className="flex flex-col gap-3">
      <CertificateCard s={s} />
      <div className="toon-card flex items-center justify-between bg-slate-900 p-3 text-white">
        <div className="caption-text text-xl">🏅 МЕДАЛИ И ДОСТИЖЕНИЯ</div>
        <div className="toon-chip bg-yellow-300">{have.size} / {ACHIEVEMENTS.length}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {ACHIEVEMENTS.map((a) => {
          const got = have.has(a.id);
          return (
            <div key={a.id} className={`toon-card flex flex-col items-center p-3 text-center ${got ? "bg-gradient-to-b from-yellow-100 to-amber-200" : "bg-slate-200"}`}>
              <div className={`grid h-16 w-16 place-items-center rounded-full border-4 border-black text-3xl ${got ? "bg-yellow-300 star-pop" : "bg-slate-400 grayscale"}`}>{got ? a.icon : "🔒"}</div>
              <div className="mt-2 text-sm font-black leading-tight">{a.name}</div>
              <div className="text-[11px] text-slate-600">{a.desc}</div>
              <div className={`mt-1 text-[11px] font-black ${got ? "text-emerald-700" : "text-slate-500"}`}>{got ? "✓ получено" : `+${a.reward} BYN`}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= ПОБОЧНЫЕ ИСТОРИИ ================= */
export function StoriesView({ s, onStart }: { s: GameState; onStart: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="toon-card bg-pink-100 p-3">
        <div className="caption-text text-xl">💬 ПОБОЧНЫЕ ИСТОРИИ</div>
        <div className="text-sm font-semibold">Личные истории ваших коллег и знакомых. Помогите им — и узнаете их ближе.</div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {SIDE_CASES.map((c) => {
          const st = caseStatus(c, s);
          const done = s.completed[c.id];
          const giver = CHARACTERS[c.side!.giver];
          return (
            <div key={c.id} className={`toon-card flex flex-col overflow-hidden ${done ? "bg-emerald-50" : "bg-white"}`}>
              <div className="relative h-44 overflow-hidden border-b-4 border-black" style={{ background: giver.color + "40" }}>
                <Portrait id={giver.id} s={s} className="absolute -bottom-3 left-2 h-48 w-36" />
                <div className="bubble bubble-left absolute right-2 top-3 max-w-[58%] text-xs font-semibold">{c.side!.teaser}</div>
              </div>
              <div className="flex flex-1 flex-col p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{c.icon}</span>
                  <div className="font-black">{c.title}</div>
                  {done && <span className="ml-auto text-sm">{"⭐".repeat(done.stars)}</span>}
                </div>
                <div className="text-xs text-slate-600">{c.tagline}</div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-xs font-bold text-slate-600">+{c.xp} XP · +{c.money} BYN</span>
                  {st.ok ? (
                    <button onClick={() => { sfx.click(); onStart(c.id); }} className="toon-btn bg-pink-300 px-3 py-1 text-sm">{done ? "Переиграть" : "Помочь →"}</button>
                  ) : (
                    <span className="max-w-[55%] text-right text-[11px] font-bold text-rose-600">🔒 {st.reason}</span>
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

/* ================= ТРЕНАЖЁР ЗВОНКОВ ================= */
export function CallTrainerModal({ s, onClose, onResult }: { s: GameState; onClose: () => void; onResult: (mistakes: number) => { xp: number; money: number } }) {
  const [idx] = useState(() => Math.floor(Math.random() * TRAINER_CALLS.length));
  const [res, setRes] = useState<{ xp: number; money: number } | null>(null);
  const [n, setN] = useState(0);
  const script = TRAINER_CALLS[(idx + n) % TRAINER_CALLS.length];
  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-black/75 p-3">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="caption-text text-2xl">📞 ТРЕНАЖЁР: ЗВОНОК МОШЕННИКА</div>
          <button onClick={onClose} className="toon-btn bg-white px-3 py-1">✕</button>
        </div>
        <div className="mb-3 text-sm font-semibold text-white/90">Звонок может быть как мошенническим, так и настоящим. Решай быстро: на каждый ответ — 12 секунд.</div>
        {res ? (
          <div className="toon-card pop-in mx-auto max-w-md bg-white p-5 text-center">
            <div className="text-5xl">📵</div>
            <div className="mt-2 text-xl font-black">+{res.xp} XP {res.money ? `· +${res.money} BYN` : ""}</div>
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => { setRes(null); setN(n + 1); }} className="toon-btn bg-yellow-300">Следующий звонок</button>
              <button onClick={onClose} className="toon-btn bg-white">Закрыть</button>
            </div>
          </div>
        ) : (
          <CallTask key={script.id + n} script={script} s={s} onDone={(m) => setRes(onResult(m))} />
        )}
      </div>
    </div>
  );
}

/* ================= ШКОЛЬНЫЙ РЕЖИМ ================= */
interface ClassRow { id: string; name: string; xp: number; rank: string; solved: number; achievements: number; updatedAt: string }
interface ClassInfo { code: string; name: string; teacher: string }
const TEACHER_KEY = "cybershield_teacher_classes";

function useClassData(code: string | null | undefined) {
  const [data, setData] = useState<{ class: ClassInfo; rows: ClassRow[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!code) return;
    try {
      const r = await fetch(`/api/class?code=${encodeURIComponent(code)}`);
      const d = await r.json();
      if (!r.ok) setErr(d.error ?? "Ошибка");
      else {
        setErr(null);
        setData(d);
      }
    } catch {
      setErr("Нет связи с сервером");
    }
  }, [code]);
  useEffect(() => {
    const t = setTimeout(load, 900);
    return () => clearTimeout(t);
  }, [load]);
  return { data, err, reload: load };
}

function ClassTable({ rows, me }: { rows: ClassRow[]; me?: string }) {
  if (!rows.length) return <div className="p-4 text-center text-sm font-bold text-slate-500">Пока никто не вступил. Раздайте ученикам код класса!</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-[3px] border-black bg-slate-100 text-left text-xs uppercase">
            <th className="p-2">#</th><th className="p-2">Ученик</th><th className="p-2">Звание</th><th className="p-2">Дела</th><th className="p-2">Медали</th><th className="p-2">XP</th><th className="p-2">Активность</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={`border-b border-black/10 ${r.id === me ? "bg-yellow-200" : ""}`}>
              <td className="p-2 font-black">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td>
              <td className="p-2 font-bold">{r.name}{r.id === me && " (вы)"}</td>
              <td className="p-2">{r.rank}</td>
              <td className="p-2">{r.solved}</td>
              <td className="p-2">{r.achievements}</td>
              <td className="p-2 font-black text-indigo-700">{r.xp}</td>
              <td className="p-2 text-xs text-slate-500">{new Date(r.updatedAt).toLocaleDateString("ru-RU")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeacherPanel() {
  const [list, setList] = useState<ClassInfo[]>([]);
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setList(JSON.parse(localStorage.getItem(TEACHER_KEY) ?? "[]"));
      } catch {
        /* ignore */
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);
  const create = async () => {
    setMsg(null);
    const r = await fetch("/api/class", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, teacher }) });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error ?? "Ошибка");
    const nl = [{ code: d.code, name: d.name, teacher: d.teacher }, ...list];
    setList(nl);
    localStorage.setItem(TEACHER_KEY, JSON.stringify(nl));
    setOpen(d.code);
    setName("");
    sfx.fanfare();
  };
  const { data, err, reload } = useClassData(open);
  const avg = data?.rows.length ? Math.round(data.rows.reduce((a, b) => a + b.xp, 0) / data.rows.length) : 0;
  return (
    <div className="flex flex-col gap-3">
      <div className="toon-card bg-white p-4">
        <div className="font-black">👩‍🏫 Создать класс</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Класс, например: 8 «Б», гимназия №3" className="rounded-xl border-[3px] border-black px-3 py-2 font-semibold" />
          <input value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="Учитель: Ирина Васильевна" className="rounded-xl border-[3px] border-black px-3 py-2 font-semibold" />
          <button onClick={create} className="toon-btn bg-emerald-400">Создать</button>
        </div>
        {msg && <div className="mt-1 text-sm font-bold text-rose-600">{msg}</div>}
      </div>
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {list.map((c) => (
            <button key={c.code} onClick={() => setOpen(c.code)} className={`toon-chip ${open === c.code ? "bg-yellow-300" : "bg-white"}`}>🏫 {c.name} · <span className="font-mono">{c.code}</span></button>
          ))}
        </div>
      )}
      {open && (
        <div className="toon-card overflow-hidden bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b-4 border-black bg-sky-100 p-3">
            <div>
              <div className="text-xs font-black uppercase text-slate-500">Код для учеников</div>
              <div className="font-mono text-3xl font-black tracking-[0.2em]">{open}</div>
            </div>
            {data && (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="toon-chip bg-white">👥 {data.rows.length} учеников</span>
                <span className="toon-chip bg-white">⌀ {avg} XP</span>
                <span className="toon-chip bg-white">🗂 {data.rows.reduce((a, b) => a + b.solved, 0)} дел всего</span>
              </div>
            )}
            <button onClick={reload} className="toon-btn ml-auto bg-white px-3 py-1 text-sm">🔄 Обновить</button>
          </div>
          {err && <div className="p-3 text-sm font-bold text-rose-600">{err}</div>}
          {data ? <ClassTable rows={data.rows} /> : !err && <div className="p-4 text-center font-bold">Загрузка…</div>}
          <div className="border-t-2 border-black/10 p-3 text-xs text-slate-600">Ученики вводят этот код во вкладке «Класс» → «Я ученик». Прогресс обновляется автоматически.</div>
        </div>
      )}
    </div>
  );
}

export function ClassView({ s, update }: { s: GameState; update: (fn: (s: GameState) => GameState) => void }) {
  const [mode, setMode] = useState<"student" | "teacher">("student");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const { data, err, reload } = useClassData(IS_STATIC ? null : s.classCode);
  const join = async () => {
    setMsg(null);
    const c = code.trim().toUpperCase();
    if (!c) return;
    const r = await fetch(`/api/class?code=${encodeURIComponent(c)}`);
    const d = await r.json();
    if (!r.ok) return setMsg(d.error ?? "Класс не найден");
    sfx.fanfare();
    update((st) => ({ ...st, classCode: c, className: d.class.name }));
    setTimeout(reload, 1500);
  };
  if (IS_STATIC) return <OnlineOnly what="Режим для школ" />;
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-3">
      <div className="toon-card flex flex-wrap items-center gap-2 bg-indigo-100 p-3">
        <div className="caption-text mr-auto text-xl">🏫 РЕЖИМ ДЛЯ ШКОЛ</div>
        <button onClick={() => setMode("student")} className={`toon-chip ${mode === "student" ? "bg-yellow-300" : "bg-white"}`}>🧑‍🎓 Я ученик</button>
        <button onClick={() => setMode("teacher")} className={`toon-chip ${mode === "teacher" ? "bg-yellow-300" : "bg-white"}`}>👩‍🏫 Я учитель</button>
      </div>
      {mode === "teacher" ? (
        <TeacherPanel />
      ) : s.classCode ? (
        <div className="toon-card overflow-hidden bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b-4 border-black bg-yellow-100 p-3">
            <div>
              <div className="text-xs font-black uppercase text-slate-500">Ваш класс</div>
              <div className="text-xl font-black">{data?.class.name ?? s.className ?? s.classCode}</div>
              {data && <div className="text-xs text-slate-600">Учитель: {data.class.teacher} · код {s.classCode}</div>}
            </div>
            <button onClick={reload} className="toon-btn ml-auto bg-white px-3 py-1 text-sm">🔄</button>
            <button onClick={() => { if (confirm("Выйти из класса?")) update((st) => ({ ...st, classCode: null, className: null })); }} className="toon-btn bg-rose-200 px-3 py-1 text-sm">Выйти</button>
          </div>
          {err && <div className="p-3 text-sm font-bold text-rose-600">{err}</div>}
          {data ? <ClassTable rows={data.rows} me={s.id} /> : !err && <div className="p-4 text-center font-bold">Загрузка…</div>}
        </div>
      ) : (
        <div className="toon-card bg-white p-5">
          <div className="text-lg font-black">Вступить в класс</div>
          <div className="text-sm text-slate-600">Попросите у учителя 6-значный код класса.</div>
          <div className="mt-3 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} placeholder="КОД" className="w-40 rounded-xl border-[3px] border-black px-3 py-2 text-center font-mono text-2xl font-black tracking-widest" />
            <button onClick={join} className="toon-btn bg-emerald-400">Вступить</button>
          </div>
          {msg && <div className="mt-2 text-sm font-bold text-rose-600">{msg}</div>}
        </div>
      )}
    </div>
  );
}

/** Заглушка для статической версии (GitHub Pages) */
export function OnlineOnly({ what }: { what: string }) {
  return (
    <div className="toon-card mx-auto max-w-xl bg-white p-5 text-center">
      <div className="text-5xl">🌐</div>
      <div className="mt-2 text-lg font-black">{what} — только в онлайн-версии</div>
      <div className="mt-1 text-sm text-slate-600">Эта копия игры опубликована на GitHub Pages без сервера: прогресс хранится в браузере, а аккаунты, рейтинг и классы недоступны.</div>
    </div>
  );
}
