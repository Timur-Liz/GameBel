"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Game from "./Game";
import { sfx } from "@/game/sound";
import { IS_STATIC } from "@/lib/paths";

type WinId = "game" | "memo" | "mail" | "trash" | "about";
interface Win { id: WinId; title: string; icon: string; min: boolean; max: boolean; x: number; y: number; w: number; h: number; z: number }

const ICONS: { id: WinId; label: string; icon: string }[] = [
  { id: "game", label: "КиберЩит.exe", icon: "🛡️" },
  { id: "memo", label: "Памятка.txt", icon: "📄" },
  { id: "mail", label: "Почта (1)", icon: "📧" },
  { id: "trash", label: "Корзина", icon: "🗑️" },
  { id: "about", label: "О программе", icon: "ℹ️" },
];

const DEFAULTS: Record<WinId, { title: string; icon: string; w: number; h: number }> = {
  game: { title: "КиберЩит: Беларусь — УПК МВД", icon: "🛡️", w: 1200, h: 760 },
  memo: { title: "Памятка.txt — Блокнот", icon: "📄", w: 520, h: 460 },
  mail: { title: "Почта — Входящие", icon: "📧", w: 620, h: 480 },
  trash: { title: "Корзина", icon: "🗑️", w: 460, h: 320 },
  about: { title: "О программе", icon: "ℹ️", w: 460, h: 340 },
};

function Boot({ onDone }: { onDone: () => void }) {
  const lines = [
    "БелОС BIOS v26.04  (c) Минск",
    "Проверка памяти ........ 16384 МБ OK",
    "Загрузка драйверов ..... OK",
    "Модуль «Антифишинг» .... OK",
    "Подключение к сети МВД . OK",
    "Обнаружены угрозы: 1 427 (Гнездо?)",
    "Запуск рабочего стола…",
  ];
  const [n, setN] = useState(0);
  const ready = n >= lines.length;
  useEffect(() => {
    if (n < lines.length) {
      const t = setTimeout(() => setN(n + 1), 260);
      return () => clearTimeout(t);
    }
  }, [n, lines.length]);
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black p-6 font-mono text-emerald-400" onClick={() => ready && (sfx.boot(), onDone())}>
      <div className="w-full max-w-xl">
        {lines.slice(0, n).map((l, i) => <div key={i} className="text-sm sm:text-base">{l}</div>)}
      </div>
      {ready && (
        <div className="pop-in mt-10 text-center">
          <div className="text-7xl">🛡️</div>
          <div className="caption-text mt-2 text-4xl">БелОС</div>
          <button className="toon-btn mt-6 animate-pulse bg-emerald-400 font-sans">▶ Нажмите, чтобы войти</button>
        </div>
      )}
    </div>
  );
}

function Notepad() {
  return (
    <div className="h-full overflow-auto whitespace-pre-wrap bg-white p-4 font-mono text-sm text-black">
{`ПАМЯТКА ГРАЖДАНИНУ — КИБЕРБЕЗОПАСНОСТЬ
=======================================

1. Код из SMS = ваша подпись. НИКОМУ.
2. Банк не звонит с просьбой «перевести на
   безопасный счёт». Таких счетов НЕТ.
3. Звонок «сын попал в беду»? Положите трубку
   и перезвоните ему сами.
4. Ссылка в SMS/мессенджере? Проверьте домен.
   kufar.by ≠ kufar-dostavka.site
5. Пароль — длинная фраза, разный для каждого
   сайта + двухфакторная аутентификация.
6. «Работа: оформи карту и передай нам» —
   это уголовная статья (ст. 222 УК).
7. Файл .apk/.exe «с фото» — вирус.
8. Обманули? Блокируйте карту и звоните 102.

Запустите КиберЩит.exe, чтобы пройти обучение
на практике.  — майор Кравец`}
    </div>
  );
}

function Mail() {
  const [ans, setAns] = useState<null | boolean>(null);
  return (
    <div className="flex h-full flex-col bg-white text-black">
      <div className="border-b-2 border-black bg-slate-100 p-3 text-sm">
        <div><b>От:</b> Belarusbank Support &lt;support@belarusbank.by-secure-login.top&gt;</div>
        <div><b>Тема:</b> ⚠ Ваш аккаунт будет удалён через 24 часа!</div>
      </div>
      <div className="flex-1 overflow-auto p-4 text-sm">
        <p>Уважаемый клиент!</p>
        <p className="mt-2">Мы обнаружили подозрительную активность. Чтобы избежать блокировки, <u className="text-blue-600">подтвердите данные карты по ссылке</u> в течение 24 часов.</p>
        <p className="mt-2">С уважением, Служба безопасности.</p>
        <div className="mt-4 rounded-lg border-2 border-black bg-yellow-50 p-3">
          <b>Испытание на внимательность:</b> это письмо настоящее?
          <div className="mt-2 flex gap-2">
            <button onClick={() => { setAns(false); sfx.bad(); }} className="toon-btn bg-emerald-200 px-3 py-1 text-sm">Настоящее</button>
            <button onClick={() => { setAns(true); sfx.ok(); }} className="toon-btn bg-rose-300 px-3 py-1 text-sm">Фишинг!</button>
          </div>
          {ans !== null && (
            <div className="pop-in mt-2 font-semibold">
              {ans ? "✅ Верно! Домен by-secure-login.top, угроза удаления и просьба ввести данные карты — классический фишинг." : "❌ Нет! Посмотрите на адрес отправителя: настоящий домен здесь — secure-login.top."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Trash() {
  const [open, setOpen] = useState(false);
  return (
    <div className="h-full bg-white p-4 text-black">
      <button onDoubleClick={() => setOpen(true)} onClick={() => setOpen(true)} className="flex flex-col items-center rounded p-2 hover:bg-sky-100">
        <span className="text-4xl">📝</span>
        <span className="text-xs">пароли_от_всего.txt</span>
      </button>
      {open && (
        <div className="bubble pop-in mt-3 text-sm font-semibold">
          <b className="text-purple-700">Алеся:</b> Серьёзно?! Хранить пароли в txt-файле — плохо. Даже в корзине. Используй менеджер паролей! 😤
        </div>
      )}
    </div>
  );
}

function About() {
  return (
    <div className="h-full bg-white p-5 text-sm text-black">
      <div className="text-4xl">🛡️</div>
      <div className="mt-2 text-xl font-black">КиберЩит: Беларусь</div>
      <p className="mt-2">Обучающая игра о противодействии киберпреступности. Вы — стажёр управления, раскрывающий дела по всей стране: от Бреста до Витебска.</p>
      <p className="mt-2">21 сюжетное дело в 19 городах, 3 побочные истории, допросы, тренажёр звонков мошенников, озвучка персонажей, медали{IS_STATIC ? "" : ", режим для школ"} и PDF-сертификат. Звания — от стажёра до полковника.</p>
      <p className="mt-2 text-xs text-slate-500">Все персонажи и события вымышлены. Советы по безопасности — реальные.</p>
    </div>
  );
}

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
    f();
    const id = setInterval(f, 10000);
    return () => clearInterval(id);
  }, []);
  return <span>{t}</span>;
}

export default function Desktop() {
  const [booted, setBooted] = useState(false);
  const [wins, setWins] = useState<Win[]>([]);
  const [selIcon, setSelIcon] = useState<WinId | null>(null);
  const [start, setStart] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const zTop = useRef(10);
  const drag = useRef<{ id: WinId; dx: number; dy: number } | null>(null);

  const open = (id: WinId) => {
    sfx.click();
    setStart(false);
    setWins((ws) => {
      const ex = ws.find((w) => w.id === id);
      zTop.current += 1;
      if (ex) return ws.map((w) => (w.id === id ? { ...w, min: false, z: zTop.current } : w));
      const d = DEFAULTS[id];
      const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
      const vh = typeof window !== "undefined" ? window.innerHeight : 800;
      const w = Math.min(d.w, vw - 20);
      const h = Math.min(d.h, vh - 70);
      return [...ws, { id, title: d.title, icon: d.icon, min: false, max: id === "game" || vw < 768, x: Math.max(10, (vw - w) / 2 + ws.length * 20), y: Math.max(10, (vh - 48 - h) / 2 + ws.length * 20), w, h, z: zTop.current }];
    });
  };
  const close = (id: WinId) => setWins((ws) => ws.filter((w) => w.id !== id));
  const focus = (id: WinId) => {
    zTop.current += 1;
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: zTop.current } : w)));
  };
  const patch = (id: WinId, p: Partial<Win>) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...p } : w)));

  useEffect(() => {
    const mv = (e: PointerEvent) => {
      if (!drag.current) return;
      const { id, dx, dy } = drag.current;
      patch(id, { x: e.clientX - dx, y: Math.max(0, e.clientY - dy) });
    };
    const up = () => (drag.current = null);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const content = (id: WinId): ReactNode => {
    switch (id) {
      case "game": return <div className="game-bg h-full overflow-auto"><Game /></div>;
      case "memo": return <Notepad />;
      case "mail": return <Mail />;
      case "trash": return <Trash />;
      case "about": return <About />;
    }
  };

  const gameOpen = wins.some((w) => w.id === "game");

  return (
    <div className="desktop-bg fixed inset-0 select-none overflow-hidden" onClick={() => { setSelIcon(null); setStart(false); }}>
      {!booted && <Boot onDone={() => setBooted(true)} />}
      <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.08]">
        <div className="text-[30vmin]">🛡️</div>
      </div>
      {/* иконки */}
      <div className="absolute left-3 top-3 flex flex-col flex-wrap gap-2" style={{ maxHeight: "calc(100% - 70px)" }}>
        {ICONS.map((ic) => (
          <button
            key={ic.id}
            onClick={(e) => { e.stopPropagation(); setSelIcon(ic.id); if (window.matchMedia("(pointer: coarse)").matches) open(ic.id); }}
            onDoubleClick={(e) => { e.stopPropagation(); open(ic.id); }}
            className={`relative flex w-24 flex-col items-center gap-1 rounded-lg p-2 text-center ${selIcon === ic.id ? "bg-sky-500/40 ring-2 ring-sky-200" : "hover:bg-white/10"}`}
          >
            <span className="text-5xl drop-shadow-[2px_3px_0_rgba(0,0,0,.6)]">{ic.icon}</span>
            <span className="text-xs font-bold text-white [text-shadow:1px_1px_2px_#000]">{ic.label}</span>
            {ic.id === "game" && booted && !gameOpen && (
              <span className="bubble bubble-left pop-in absolute left-[105%] top-2 w-48 text-left text-xs font-bold text-black">👆 Дважды кликни, чтобы запустить игру!</span>
            )}
          </button>
        ))}
      </div>

      {/* окна */}
      {wins.map((w) => (
        <div
          key={w.id}
          onPointerDown={() => focus(w.id)}
          onClick={(e) => e.stopPropagation()}
          className={`win-frame absolute flex flex-col ${w.min ? "hidden" : ""}`}
          style={w.max ? { left: 0, top: 0, right: 0, bottom: 48, zIndex: w.z } : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }}
        >
          <div
            className="flex h-9 shrink-0 cursor-move items-center gap-2 bg-gradient-to-r from-blue-800 to-sky-600 px-2 text-sm font-bold text-white"
            onPointerDown={(e) => { if (!w.max) drag.current = { id: w.id, dx: e.clientX - w.x, dy: e.clientY - w.y }; }}
            onDoubleClick={() => patch(w.id, { max: !w.max })}
          >
            <span>{w.icon}</span>
            <span className="flex-1 truncate">{w.title}</span>
            <button onClick={() => patch(w.id, { min: true })} className="win-btn">_</button>
            <button onClick={() => patch(w.id, { max: !w.max })} className="win-btn">{w.max ? "❐" : "□"}</button>
            <button onClick={() => close(w.id)} className="win-btn bg-red-500 hover:bg-red-600">✕</button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{content(w.id)}</div>
        </div>
      ))}

      {/* меню Пуск */}
      {start && (
        <div className="pop-in absolute bottom-12 left-1 z-[90] w-64 overflow-hidden rounded-t-xl border-4 border-black bg-white shadow-[6px_6px_0_#000]" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-blue-800 to-sky-600 p-3 font-black text-white">🛡️ БелОС · Сотрудник УПК</div>
          {ICONS.map((ic) => (
            <button key={ic.id} onClick={() => open(ic.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left font-bold hover:bg-sky-100">
              <span className="text-2xl">{ic.icon}</span>{ic.label}
            </button>
          ))}
          <button onClick={() => { setStart(false); setMsg("Выключить компьютер нельзя: у вас дежурство! — Полковник Стальная"); sfx.bad(); }} className="flex w-full items-center gap-3 border-t-2 border-black px-3 py-2 text-left font-bold hover:bg-rose-100">
            <span className="text-2xl">⏻</span>Завершение работы
          </button>
        </div>
      )}
      {msg && (
        <div className="absolute inset-0 z-[95] grid place-items-center bg-black/40" onClick={() => setMsg(null)}>
          <div className="win-frame pop-in w-80 bg-white">
            <div className="bg-gradient-to-r from-red-700 to-red-500 px-2 py-1 text-sm font-bold text-white">⚠ БелОС</div>
            <div className="p-4 text-sm font-semibold text-black">{msg}</div>
            <div className="p-2 text-right"><button className="toon-btn bg-white px-4 py-1 text-sm">OK</button></div>
          </div>
        </div>
      )}

      {/* панель задач */}
      <div className="absolute inset-x-0 bottom-0 z-[80] flex h-12 items-center gap-2 border-t-4 border-black bg-slate-800 px-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => { sfx.click(); setStart(!start); }} className="flex h-9 items-center gap-1 rounded-lg border-[3px] border-black bg-emerald-400 px-3 font-black shadow-[2px_2px_0_#000]">🛡️ Пуск</button>
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {wins.map((w) => (
            <button key={w.id} onClick={() => (w.min ? open(w.id) : patch(w.id, { min: true }))} className={`flex h-9 max-w-[200px] shrink-0 items-center gap-1 truncate rounded-md border-2 border-black px-2 text-sm font-bold ${w.min ? "bg-slate-500 text-white" : "bg-sky-300"}`}>
              {w.icon} <span className="truncate">{w.title.split(" — ")[0]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1 text-sm font-bold text-white">
          <span title="Защита активна">🛡️</span>
          <span>BY</span>
          <Clock />
        </div>
      </div>
    </div>
  );
}
