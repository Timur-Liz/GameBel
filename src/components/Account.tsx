"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { GameState } from "@/game/types";
import type { AccountInfo } from "@/game/store";
import { RANKS, rankOf } from "@/game/data";
import { sfx } from "@/game/sound";
import { loginIssue, nameIssue, passwordChecks, passwordIssue, passwordScore } from "@/lib/authRules";
import { PlayerToon } from "./Toon";
import { asset } from "@/lib/paths";

const inputCls = "w-full rounded-xl border-[3px] border-black px-3 py-2 text-base font-bold outline-none focus:bg-yellow-50 sm:text-lg";

function Err({ text }: { text: string | null }) {
  if (!text) return null;
  return <div className="pop-in rounded-lg border-2 border-black bg-rose-200 px-3 py-1.5 text-sm font-bold">❌ {text}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <label className="text-xs font-black uppercase text-slate-500">{children}</label>;
}

/* ---------- Поле пароля с индикатором ---------- */
export function PasswordField({ value, onChange, login = "", placeholder = "пароль", meter = false, auto = "current-password" }: { value: string; onChange: (v: string) => void; login?: string; placeholder?: string; meter?: boolean; auto?: string }) {
  const [show, setShow] = useState(false);
  const score = passwordScore(value);
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];
  const labels = ["очень слабый", "слабый", "средний", "хороший", "отличный"];
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} type={show ? "text" : "password"} autoComplete={auto} placeholder={placeholder} className={inputCls} />
        <button type="button" onClick={() => setShow(!show)} className="toon-btn bg-slate-100 px-3" aria-label="Показать пароль">{show ? "🙈" : "👁️"}</button>
      </div>
      {meter && value && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-2 flex-1 rounded-full border border-black" style={{ background: i < Math.max(1, score) ? colors[score] : "#e5e7eb" }} />)}
            </div>
            <span className="text-xs font-bold" style={{ color: colors[score] }}>{labels[score]}</span>
          </div>
          <ul className="grid grid-cols-2 gap-x-2 text-[11px] font-semibold">
            {passwordChecks(value, login).map((c) => <li key={c.t} className={c.ok ? "text-emerald-700" : "text-slate-500"}>{c.ok ? "✅" : "⬜"} {c.t}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

/* ---------- Проверка занятости логина ---------- */
function useLoginCheck(login: string) {
  const [res, setRes] = useState<{ login: string; available: boolean | null; reason: string | null } | null>(null);
  useEffect(() => {
    const l = login.trim();
    if (!l || loginIssue(l)) return;
    const t = setTimeout(() => {
      fetch(`/api/auth/check-login?login=${encodeURIComponent(l)}`)
        .then((r) => r.json())
        .then((d) => setRes({ login: l, available: d.available, reason: d.reason }))
        .catch(() => {});
    }, 450);
    return () => clearTimeout(t);
  }, [login]);
  const l = login.trim();
  if (!l) return null;
  const local = loginIssue(l);
  if (local) return { ok: false, text: local };
  if (!res || res.login !== l) return { ok: null, text: "Проверяем…" };
  if (res.available === null) return null;
  return res.available ? { ok: true, text: "Логин свободен" } : { ok: false, text: res.reason ?? "Логин занят" };
}

/* ---------- Регистрация ---------- */
export interface RegisterData {
  name: string;
  gender: "m" | "f";
  login: string;
  password: string;
  consent: boolean;
  website: string;
}

export function RegisterForm({ withProfile, defaultName = "", onSubmit }: { withProfile: boolean; defaultName?: string; onSubmit: (d: RegisterData) => Promise<string | null> }) {
  const [name, setName] = useState(defaultName);
  const [gender, setGender] = useState<"m" | "f">("m");
  const [login, setLogin] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // ловушка для ботов
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const check = useLoginCheck(login);

  const submit = async () => {
    setErr(null);
    const e =
      (withProfile ? nameIssue(name) : null) ??
      loginIssue(login) ??
      (check?.ok === false ? check.text : null) ??
      passwordIssue(pw, login) ??
      (pw !== pw2 ? "Пароли не совпадают" : null) ??
      (!consent ? "Отметьте согласие с Правилами и Политикой конфиденциальности" : null);
    if (e) {
      setErr(e);
      sfx.bad();
      return;
    }
    setBusy(true);
    const r = await onSubmit({ name: name.trim(), gender, login: login.trim(), password: pw, consent, website });
    setBusy(false);
    if (r) {
      setErr(r);
      sfx.bad();
    }
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
      {withProfile && (
        <>
          <Label>Игровое имя (видно в рейтинге)</Label>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Например: Алесь Бульба" className={inputCls} />
          <div className="text-[11px] text-slate-500">Не указывайте настоящие ФИО — достаточно игрового имени.</div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setGender("m")} className={`toon-btn flex-1 py-1.5 ${gender === "m" ? "bg-sky-300" : "bg-slate-100"}`}>👨 Стажёр</button>
            <button type="button" onClick={() => setGender("f")} className={`toon-btn flex-1 py-1.5 ${gender === "f" ? "bg-pink-300" : "bg-slate-100"}`}>👩 Стажёрка</button>
          </div>
        </>
      )}
      <Label>Логин для входа</Label>
      <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" maxLength={24} placeholder="латиница или кириллица, 3–24 символа" className={inputCls} />
      {check && <div className={`text-xs font-bold ${check.ok ? "text-emerald-700" : check.ok === false ? "text-rose-600" : "text-slate-500"}`}>{check.ok ? "✅ " : check.ok === false ? "❌ " : "⏳ "}{check.text}</div>}
      <Label>Пароль</Label>
      <PasswordField value={pw} onChange={setPw} login={login} meter auto="new-password" placeholder={`не короче 8 символов`} />
      <PasswordField value={pw2} onChange={setPw2} auto="new-password" placeholder="повторите пароль" />
      {pw2 && pw !== pw2 && <div className="text-xs font-bold text-rose-600">Пароли не совпадают</div>}
      {/* скрытое поле-ловушка: люди его не видят, боты заполняют */}
      <input value={website} onChange={(e) => setWebsite(e.target.value)} name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
      <label className="mt-1 flex cursor-pointer items-start gap-2 text-xs font-semibold">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" />
        <span>
          Я принимаю <a href={asset("/terms/")} target="_blank" rel="noopener" className="font-black text-sky-700 underline">Правила игры</a> и <a href={asset("/privacy/")} target="_blank" rel="noopener" className="font-black text-sky-700 underline">Политику конфиденциальности</a> и даю согласие на обработку данных аккаунта. Если мне меньше 14 лет — с разрешения родителей.
        </span>
      </label>
      <Err text={err} />
      <button type="submit" disabled={busy} className="toon-btn mt-1 bg-emerald-400 disabled:opacity-50">{busy ? "Создаём аккаунт…" : "📝 Зарегистрироваться"}</button>
    </form>
  );
}

/* ---------- Вход ---------- */
export function LoginForm({ onSubmit, onForgot, label = "Войти" }: { onSubmit: (login: string, password: string) => Promise<string | null>; onForgot?: () => void; label?: string }) {
  const [login, setLogin] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setErr(null);
    setBusy(true);
    const e = await onSubmit(login.trim(), pw);
    setBusy(false);
    if (e) {
      setErr(e);
      sfx.bad();
    } else sfx.fanfare();
  };
  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <Label>Логин</Label>
      <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" maxLength={24} className={inputCls} />
      <Label>Пароль</Label>
      <PasswordField value={pw} onChange={setPw} />
      <Err text={err} />
      <button type="submit" disabled={busy || !login || !pw} className="toon-btn mt-1 bg-emerald-400 disabled:opacity-50">{busy ? "Входим…" : label}</button>
      {onForgot && <button type="button" onClick={onForgot} className="text-sm font-bold text-sky-700 underline">Забыли пароль?</button>}
    </form>
  );
}

/* ---------- Восстановление ---------- */
export function RecoverForm({ onSubmit, onBack }: { onSubmit: (login: string, code: string, password: string) => Promise<string | null>; onBack: () => void }) {
  const [login, setLogin] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setErr(null);
    const e = passwordIssue(pw, login) ?? (pw !== pw2 ? "Пароли не совпадают" : null);
    if (e) return setErr(e);
    setBusy(true);
    const r = await onSubmit(login.trim(), code, pw);
    setBusy(false);
    if (r) {
      setErr(r);
      sfx.bad();
    }
  };
  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="rounded-lg border-2 border-black bg-sky-100 p-2 text-xs font-semibold">🔑 Введите код восстановления, который вы сохранили при регистрации (вида <span className="font-mono">ABCD-EFGH-JKLM-NPQR</span>).</div>
      <Label>Логин</Label>
      <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" className={inputCls} />
      <Label>Код восстановления</Label>
      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX-XXXX-XXXX" className={`${inputCls} font-mono tracking-wider`} />
      <Label>Новый пароль</Label>
      <PasswordField value={pw} onChange={setPw} login={login} meter auto="new-password" />
      <PasswordField value={pw2} onChange={setPw2} auto="new-password" placeholder="повторите пароль" />
      <Err text={err} />
      <button type="submit" disabled={busy || !login || !code || !pw} className="toon-btn mt-1 bg-emerald-400 disabled:opacity-50">{busy ? "Проверяем…" : "Сменить пароль и войти"}</button>
      <button type="button" onClick={onBack} className="text-sm font-bold text-slate-600 underline">← Назад ко входу</button>
    </form>
  );
}

/* ---------- Код восстановления ---------- */
export function RecoveryCodeCard({ code, login, onContinue, title = "Сохраните код восстановления" }: { code: string; login: string; onContinue: () => void; title?: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const download = () => {
    const text = `КиберЩит: Беларусь — код восстановления\n\nЛогин: ${login}\nКод: ${code}\n\nХраните в надёжном месте. Код одноразовый: после использования выдаётся новый.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `КиберЩит_код_восстановления_${login}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="text-lg font-black">🔐 {title}</div>
      <div className="text-sm">Это <b>единственный способ</b> восстановить пароль, если вы его забудете. Мы показываем код один раз — сохраните его. Совет Петровича: как резервные коды 2FA — в надёжном месте, не в заметках телефона.</div>
      <div className="select-all rounded-xl border-4 border-black bg-slate-900 p-4 text-center font-mono text-2xl font-black tracking-widest text-emerald-300 sm:text-3xl">{code}</div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => { navigator.clipboard?.writeText(code).then(() => setCopied(true)).catch(() => {}); sfx.click(); }} className="toon-btn bg-sky-200 text-sm">{copied ? "✅ Скопировано" : "📋 Копировать"}</button>
        <button type="button" onClick={() => { download(); sfx.click(); }} className="toon-btn bg-sky-200 text-sm">⬇ Скачать .txt</button>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="h-5 w-5 accent-emerald-600" />
        Я сохранил(а) код в надёжном месте
      </label>
      <button disabled={!saved} onClick={() => { sfx.fanfare(); onContinue(); }} className="toon-btn bg-emerald-400 disabled:opacity-40">Продолжить →</button>
    </div>
  );
}

/* ---------- Кнопка в HUD ---------- */
export function AccountButton({ account, onClick }: { account: AccountInfo; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`hud-box flex items-center gap-1 text-sm font-black ${account.login ? "bg-emerald-300" : account.lost ? "animate-pulse bg-rose-300" : "bg-white"}`} title="Аккаунт">
      👤 <span className="max-w-[90px] truncate">{account.login ?? (account.lost ? "Войдите!" : "Гость")}</span>
    </button>
  );
}

/* ---------- Окно аккаунта в игре ---------- */
type ManageFn = (action: "password" | "recovery" | "logout-all" | "delete", password?: string, next?: string) => Promise<{ error?: string; recoveryCode?: string }>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-xl border-[3px] border-black bg-slate-50 p-3">
      <summary className="cursor-pointer font-black">{title}</summary>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </details>
  );
}

function Settings({ s, account, manage, signOut, onClose }: { s: GameState; account: AccountInfo; manage: ManageFn; signOut: () => Promise<void>; onClose: () => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [next2, setNext2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [delPw, setDelPw] = useState("");
  const [delLogin, setDelLogin] = useState("");
  const run = async (fn: () => Promise<{ error?: string; recoveryCode?: string }>, okText: string) => {
    setMsg(null);
    const r = await fn();
    if (r.error) {
      setMsg({ ok: false, t: r.error });
      sfx.bad();
    } else {
      setMsg({ ok: true, t: okText });
      sfx.ok();
      if (r.recoveryCode) setCode(r.recoveryCode);
    }
    return r;
  };
  if (code) return <RecoveryCodeCard code={code} login={account.login ?? ""} title="Новый код восстановления" onContinue={() => setCode(null)} />;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl border-[3px] border-black bg-emerald-100 p-3">
        <div className="h-16 w-14 overflow-hidden rounded-lg border-2 border-black bg-sky-200"><PlayerToon s={s} className="h-20 w-14" /></div>
        <div>
          <div className="text-xs font-black uppercase text-emerald-700">Вы вошли как</div>
          <div className="text-xl font-black">{account.login}</div>
          <div className="text-xs text-slate-600">{RANKS[rankOf(s.xp)].short} {s.name} · {s.xp} XP</div>
        </div>
      </div>
      <div className="text-sm">✅ Прогресс сохраняется в аккаунт автоматически — входите с любого устройства.</div>
      {msg && <div className={`pop-in rounded-lg border-2 border-black px-3 py-1.5 text-sm font-bold ${msg.ok ? "bg-emerald-200" : "bg-rose-200"}`}>{msg.ok ? "✅ " : "❌ "}{msg.t}</div>}

      <Section title="🔒 Сменить пароль">
        <PasswordField value={cur} onChange={setCur} placeholder="текущий пароль" />
        <PasswordField value={next} onChange={setNext} login={account.login ?? ""} meter auto="new-password" placeholder="новый пароль" />
        <PasswordField value={next2} onChange={setNext2} auto="new-password" placeholder="повторите новый пароль" />
        <button
          onClick={() => {
            if (next !== next2) return setMsg({ ok: false, t: "Пароли не совпадают" });
            run(() => manage("password", cur, next), "Пароль изменён. На других устройствах выполнен выход.").then((r) => { if (!r.error) { setCur(""); setNext(""); setNext2(""); } });
          }}
          className="toon-btn bg-yellow-300 text-sm"
        >
          Сменить пароль
        </button>
      </Section>

      <Section title="🔑 Новый код восстановления">
        <div className="text-xs">Старый код перестанет работать.</div>
        <PasswordField value={cur} onChange={setCur} placeholder="текущий пароль" />
        <button onClick={() => run(() => manage("recovery", cur), "Новый код создан")} className="toon-btn bg-yellow-300 text-sm">Получить новый код</button>
      </Section>

      <Section title="📱 Устройства">
        <div className="text-xs">Если вы входили на чужом компьютере — выйдите везде, кроме этого устройства.</div>
        <button onClick={() => run(() => manage("logout-all"), "Выполнен выход на всех других устройствах")} className="toon-btn bg-yellow-300 text-sm">Выйти на всех других устройствах</button>
      </Section>

      <Section title="🗑 Удалить аккаунт">
        <div className="text-xs font-semibold text-rose-700">Аккаунт и весь прогресс будут удалены навсегда. Это действие нельзя отменить.</div>
        <input value={delLogin} onChange={(e) => setDelLogin(e.target.value)} placeholder={`введите логин «${account.login}»`} className={inputCls} />
        <PasswordField value={delPw} onChange={setDelPw} placeholder="пароль" />
        <button
          disabled={delLogin.trim().toLowerCase() !== (account.login ?? "").toLowerCase() || !delPw}
          onClick={async () => {
            const r = await run(() => manage("delete", delPw), "Аккаунт удалён");
            if (!r.error) onClose();
          }}
          className="toon-btn bg-rose-400 text-sm disabled:opacity-40"
        >
          Удалить навсегда
        </button>
      </Section>

      <button
        onClick={async () => {
          if (confirm("Выйти из аккаунта? Прогресс сохранится в аккаунте.")) {
            await signOut();
            onClose();
          }
        }}
        className="toon-btn bg-rose-200"
      >
        🚪 Выйти из аккаунта
      </button>
    </div>
  );
}

export function AccountModal({
  s,
  account,
  onClose,
  registerGuest,
  signIn,
  recover,
  manage,
  signOut,
}: {
  s: GameState;
  account: AccountInfo;
  onClose: () => void;
  registerGuest: (d: RegisterData) => Promise<{ error?: string; recoveryCode?: string }>;
  signIn: (login: string, password: string) => Promise<string | null>;
  recover: (login: string, code: string, password: string) => Promise<{ error?: string; recoveryCode?: string; login?: string }>;
  manage: ManageFn;
  signOut: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"create" | "login" | "recover">(account.lost ? "login" : "create");
  const [code, setCode] = useState<{ code: string; login: string } | null>(null);
  return (
    <div className="absolute inset-0 z-[65] grid place-items-center overflow-y-auto bg-black/60 p-4" onClick={onClose}>
      <div className="toon-card pop-in my-auto w-full max-w-lg bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="caption-text text-2xl">👤 АККАУНТ</div>
          <button onClick={onClose} className="toon-btn bg-white px-3 py-1">✕</button>
        </div>
        {code ? (
          <RecoveryCodeCard code={code.code} login={code.login} onContinue={() => { setCode(null); onClose(); }} />
        ) : account.login ? (
          <Settings s={s} account={account} manage={manage} signOut={signOut} onClose={onClose} />
        ) : (
          <>
            {account.lost && <div className="mb-3 rounded-xl border-[3px] border-black bg-rose-100 p-3 text-sm font-bold">⚠️ Сессия истекла. Войдите снова, чтобы прогресс сохранялся в аккаунт.</div>}
            {mode !== "recover" && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                <button onClick={() => setMode("create")} className={`toon-chip ${mode === "create" ? "bg-yellow-300" : "bg-white"}`}>📝 Регистрация</button>
                <button onClick={() => setMode("login")} className={`toon-chip ${mode === "login" ? "bg-yellow-300" : "bg-white"}`}>🔑 Вход</button>
              </div>
            )}
            {mode === "create" && (
              <>
                <div className="mb-2 text-sm">Сейчас вы <b>гость</b> — прогресс хранится только в этом браузере. Зарегистрируйтесь, и прогресс (<b>{RANKS[rankOf(s.xp)].short}, {s.xp} XP</b>) сохранится в аккаунте.</div>
                <RegisterForm
                  withProfile={false}
                  defaultName={s.name}
                  onSubmit={async (d) => {
                    const r = await registerGuest(d);
                    if (r.error) return r.error;
                    if (r.recoveryCode) setCode({ code: r.recoveryCode, login: d.login });
                    return null;
                  }}
                />
              </>
            )}
            {mode === "login" && (
              <>
                {!account.lost && <div className="mb-2 rounded-lg border-2 border-black bg-amber-100 p-2 text-xs font-semibold">⚠️ После входа загрузится прогресс из аккаунта, а гостевой прогресс на этом устройстве будет заменён.</div>}
                <LoginForm onForgot={() => setMode("recover")} onSubmit={async (l, p) => { const e = await signIn(l, p); if (!e) setTimeout(onClose, 300); return e; }} />
              </>
            )}
            {mode === "recover" && (
              <RecoverForm
                onBack={() => setMode("login")}
                onSubmit={async (l, c, p) => {
                  const r = await recover(l, c, p);
                  if (r.error) return r.error;
                  if (r.recoveryCode) setCode({ code: r.recoveryCode, login: l });
                  return null;
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
