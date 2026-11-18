"use client";
import { useState } from "react";
import type { BgId } from "@/game/types";
import { asset } from "@/lib/paths";
import type { ReactNode } from "react";

const K = "#1a1a1a";

function Windows({ x, y, cols, rows, w = 26, h = 30, gap = 14, lit = 0.3, seed = 1 }: { x: number; y: number; cols: number; rows: number; w?: number; h?: number; gap?: number; lit?: number; seed?: number }) {
  const out: ReactNode[] = [];
  let s = seed;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      s = (s * 9301 + 49297) % 233280;
      const on = s / 233280 < lit;
      out.push(<rect key={`${r}-${c}`} x={x + c * (w + gap)} y={y + r * (h + gap)} width={w} height={h} fill={on ? "#fde68a" : "#7dd3fc"} stroke={K} strokeWidth={3} />);
    }
  return <>{out}</>;
}

function SvgScene({ id }: { id: BgId }) {
  switch (id) {
    case "apartment":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <defs>
            <pattern id="wp" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="#f5e6c8" />
              <circle cx="30" cy="30" r="6" fill="#e9c98f" />
              <circle cx="0" cy="0" r="4" fill="#e9c98f" />
              <circle cx="60" cy="60" r="4" fill="#e9c98f" />
            </pattern>
            <pattern id="carpet" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="#b91c1c" />
              <path d="M40 6 L74 40 L40 74 L6 40 Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="4" />
              <circle cx="40" cy="40" r="10" fill="#fbbf24" />
            </pattern>
          </defs>
          <rect width="1600" height="680" fill="url(#wp)" />
          <rect y="680" width="1600" height="220" fill="#a16207" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={i * 140} y1="680" x2={i * 140 - 80} y2="900" stroke="#854d0e" strokeWidth="5" />
          ))}
          <rect x="140" y="140" width="560" height="380" rx="10" fill="url(#carpet)" stroke={K} strokeWidth="8" />
          <rect x="160" y="160" width="520" height="340" fill="none" stroke="#fbbf24" strokeWidth="6" />
          <rect x="1000" y="120" width="380" height="380" fill="#bae6fd" stroke={K} strokeWidth="8" />
          <line x1="1190" y1="120" x2="1190" y2="500" stroke={K} strokeWidth="8" />
          <line x1="1000" y1="310" x2="1380" y2="310" stroke={K} strokeWidth="8" />
          <path d="M960 100 Q1000 300 970 520 L1040 520 Q1020 300 1040 100 Z" fill="#16a34a" stroke={K} strokeWidth="6" />
          <path d="M1420 100 Q1380 300 1410 520 L1340 520 Q1360 300 1340 100 Z" fill="#16a34a" stroke={K} strokeWidth="6" />
          <rect x="100" y="560" width="680" height="170" rx="30" fill="#7c3aed" stroke={K} strokeWidth="8" />
          <rect x="80" y="520" width="80" height="230" rx="30" fill="#6d28d9" stroke={K} strokeWidth="8" />
          <rect x="720" y="520" width="80" height="230" rx="30" fill="#6d28d9" stroke={K} strokeWidth="8" />
          <rect x="1150" y="560" width="200" height="160" fill="#78350f" stroke={K} strokeWidth="8" />
          <rect x="1180" y="480" width="140" height="90" rx="8" fill="#334155" stroke={K} strokeWidth="8" />
        </svg>
      );
    case "school":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="1600" height="900" fill="#f6efd8" />
          <polygon points="0,0 1600,0 1050,300 550,300" fill="#fbf7ea" stroke={K} strokeWidth="5" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={640 - i * 30} y={60 + i * 70} width={320 + i * 60} height="14" rx="7" fill="#fff" stroke={K} strokeWidth="3" />
          ))}
          <polygon points="0,560 550,420 1050,420 1600,560 1600,900 0,900" fill="#c69c6d" />
          <polygon points="0,900 550,600 1050,600 1600,900" fill="#b5835a" stroke={K} strokeWidth="5" />
          <polygon points="0,560 550,420 550,600 0,900" fill="#8fbf9f" stroke={K} strokeWidth="5" />
          <polygon points="1600,560 1050,420 1050,600 1600,900" fill="#8fbf9f" stroke={K} strokeWidth="5" />
          <rect x="550" y="300" width="500" height="300" fill="#f1e7c9" stroke={K} strokeWidth="5" />
          <rect x="730" y="380" width="140" height="220" fill="#92400e" stroke={K} strokeWidth="6" />
          <rect x="745" y="345" width="110" height="28" rx="4" fill="#16a34a" stroke={K} strokeWidth="3" />
          <text x="800" y="366" textAnchor="middle" fontSize="18" fontWeight="900" fill="#fff" fontFamily="sans-serif">СПОРТЗАЛ</text>
          {[0, 1, 2].map((i) => (
            <polygon key={i} points={`${60 + i * 160},${180 + i * 40} ${180 + i * 150},${210 + i * 36} ${180 + i * 150},${470 - i * 10} ${60 + i * 160},${520 - i * 14}`} fill="#bae6fd" stroke={K} strokeWidth="6" />
          ))}
          {[0, 1, 2].map((i) => (
            <polygon key={i} points={`${1540 - i * 160},${200 + i * 40} ${1420 - i * 150},${230 + i * 36} ${1420 - i * 150},${560 - i * 30} ${1540 - i * 160},${640 - i * 40}`} fill="#a16207" stroke={K} strokeWidth="6" />
          ))}
        </svg>
      );
    case "street":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="1600" height="900" fill="#93c5fd" />
          <circle cx="1350" cy="140" r="70" fill="#fde047" stroke={K} strokeWidth="6" />
          <ellipse cx="300" cy="120" rx="120" ry="40" fill="#fff" stroke={K} strokeWidth="5" />
          <rect x="60" y="200" width="420" height="520" fill="#d6d3d1" stroke={K} strokeWidth="7" />
          <Windows x={90} y={230} cols={7} rows={10} w={34} h={30} gap={22} seed={3} />
          <rect x="560" y="300" width="320" height="420" fill="#fca5a5" stroke={K} strokeWidth="7" />
          <Windows x={590} y={330} cols={5} rows={7} w={34} h={34} gap={24} seed={7} />
          <rect x="960" y="160" width="520" height="560" fill="#e7e5e4" stroke={K} strokeWidth="7" />
          <Windows x={990} y={190} cols={9} rows={11} w={30} h={28} gap={24} seed={11} />
          <rect y="720" width="1600" height="180" fill="#57534e" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={i * 220 + 40} y="800" width="120" height="16" fill="#fafaf9" />
          ))}
          <rect y="700" width="1600" height="26" fill="#a8a29e" stroke={K} strokeWidth="4" />
        </svg>
      );
    case "cafe":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="1600" height="900" fill="#fde7c7" />
          <rect y="560" width="1600" height="340" fill="#92400e" />
          <rect x="140" y="120" width="620" height="360" fill="#bae6fd" stroke={K} strokeWidth="8" />
          <path d="M240 480 L240 330 L300 330 L300 280 L340 230 L380 280 L380 330 L520 330 L520 260 L560 210 L600 260 L600 480 Z" fill="#a8a29e" stroke={K} strokeWidth="6" />
          <line x1="450" y1="120" x2="450" y2="480" stroke={K} strokeWidth="8" />
          {[950, 1150, 1350].map((x) => (
            <g key={x}>
              <line x1={x} y1="0" x2={x} y2="140" stroke={K} strokeWidth="4" />
              <path d={`M${x - 50} 190 Q${x} 110 ${x + 50} 190 Z`} fill="#f59e0b" stroke={K} strokeWidth="5" />
            </g>
          ))}
          <rect x="860" y="420" width="640" height="200" fill="#78350f" stroke={K} strokeWidth="8" />
          <rect x="900" y="330" width="120" height="90" rx="10" fill="#475569" stroke={K} strokeWidth="6" />
          <rect x="1080" y="360" width="50" height="60" rx="8" fill="#fff" stroke={K} strokeWidth="5" />
          <text x="1180" y="290" fontSize="44" fontWeight="900" fill="#78350f" fontFamily="sans-serif">ПОД ЗАМКОМ</text>
        </svg>
      );
    case "factory":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="1600" height="900" fill="#cbd5e1" />
          <rect y="640" width="1600" height="260" fill="#64748b" />
          {[100, 500, 900, 1300].map((x) => (
            <g key={x}>
              <rect x={x} y="120" width="40" height="520" fill="#94a3b8" stroke={K} strokeWidth="5" />
              <rect x={x + 120} y="300" width="160" height="340" fill="#475569" stroke={K} strokeWidth="6" />
              <rect x={x + 150} y="340" width="100" height="70" fill="#ef4444" stroke={K} strokeWidth="5" />
              <text x={x + 200} y="388" fontSize="30" textAnchor="middle" fill="#fff" fontFamily="monospace">🔒</text>
            </g>
          ))}
          <rect y="560" width="1600" height="50" fill="#334155" stroke={K} strokeWidth="5" />
          {Array.from({ length: 16 }).map((_, i) => (
            <circle key={i} cx={i * 100 + 50} cy="585" r="18" fill="#94a3b8" stroke={K} strokeWidth="4" />
          ))}
          <rect x="0" y="80" width="1600" height="30" fill="#f59e0b" stroke={K} strokeWidth="5" />
        </svg>
      );
    case "basement":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <defs>
            <pattern id="brick" width="120" height="60" patternUnits="userSpaceOnUse">
              <rect width="120" height="60" fill="#57534e" />
              <rect x="2" y="2" width="116" height="26" fill="#78716c" stroke="#292524" strokeWidth="3" />
              <rect x="-58" y="32" width="116" height="26" fill="#78716c" stroke="#292524" strokeWidth="3" />
              <rect x="62" y="32" width="116" height="26" fill="#78716c" stroke="#292524" strokeWidth="3" />
            </pattern>
          </defs>
          <rect width="1600" height="900" fill="url(#brick)" />
          <rect y="640" width="1600" height="260" fill="#292524" />
          <line x1="800" y1="0" x2="800" y2="120" stroke={K} strokeWidth="4" />
          <circle cx="800" cy="140" r="24" fill="#fde047" stroke={K} strokeWidth="5" />
          <path d="M800 160 L500 640 L1100 640 Z" fill="#fde047" opacity="0.15" />
          {[120, 480, 1040, 1300].map((x) => (
            <g key={x}>
              <rect x={x} y="520" width="240" height="30" fill="#a16207" stroke={K} strokeWidth="5" />
              <rect x={x + 60} y="420" width="120" height="90" rx="6" fill="#0f172a" stroke={K} strokeWidth="5" />
              <rect x={x + 72} y="432" width="96" height="66" fill="#22c55e" opacity="0.6" />
            </g>
          ))}
          <rect x="560" y="180" width="480" height="200" fill="#f8fafc" stroke={K} strokeWidth="6" />
          <text x="800" y="250" textAnchor="middle" fontSize="30" fontWeight="900" fontFamily="sans-serif" fill="#b91c1c">СКРИПТ: «СЛУЖБА</text>
          <text x="800" y="295" textAnchor="middle" fontSize="30" fontWeight="900" fontFamily="sans-serif" fill="#b91c1c">БЕЗОПАСНОСТИ БАНКА»</text>
          <text x="800" y="345" textAnchor="middle" fontSize="22" fontFamily="sans-serif" fill="#334155">план: 40 бабушек / день</text>
        </svg>
      );
    case "server":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="1600" height="900" fill="#0b1220" />
          <rect y="700" width="1600" height="200" fill="#111827" />
          {Array.from({ length: 7 }).map((_, i) => (
            <g key={i}>
              <rect x={60 + i * 220} y="120" width="170" height="580" fill="#1f2937" stroke="#000" strokeWidth="6" />
              {Array.from({ length: 12 }).map((__, j) => (
                <g key={j}>
                  <rect x={75 + i * 220} y={140 + j * 46} width="140" height="34" fill="#111827" stroke="#374151" strokeWidth="2" />
                  <circle cx={95 + i * 220} cy={157 + j * 46} r="5" fill={(i + j) % 3 ? "#22c55e" : "#ef4444"} className="blink" style={{ animationDelay: `${(i * 7 + j) % 10 / 5}s` }} />
                  <circle cx={112 + i * 220} cy={157 + j * 46} r="5" fill="#38bdf8" className="blink" style={{ animationDelay: `${(i + j * 3) % 10 / 4}s` }} />
                </g>
              ))}
            </g>
          ))}
          <text x="800" y="80" textAnchor="middle" fontSize="40" fill="#f87171" fontFamily="monospace">🕊 NEST // NODE-POLOTSK</text>
        </svg>
      );
    case "night":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="1600" height="900" fill="#0f172a" />
          {Array.from({ length: 60 }).map((_, i) => (
            <circle key={i} cx={(i * 263) % 1600} cy={(i * 131) % 400} r={(i % 3) + 1} fill="#fff" opacity={0.7} className="blink" style={{ animationDelay: `${(i % 9) / 3}s` }} />
          ))}
          <circle cx="1300" cy="150" r="60" fill="#fef9c3" />
          <polygon points="700,700 760,520 820,450 880,520 940,700" fill="#1e3a8a" stroke="#000" strokeWidth="5" />
          {[[40, 380, 200], [280, 300, 160], [480, 420, 180], [980, 260, 200], [1220, 360, 160], [1420, 300, 180]].map(([x, y, w], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={720 - y} fill="#1e293b" stroke="#000" strokeWidth="5" />
              <Windows x={x + 16} y={y + 20} cols={Math.floor((w - 16) / 36)} rows={Math.floor((680 - y) / 44)} w={20} h={24} gap={16} lit={0.35} seed={i * 13 + 5} />
            </g>
          ))}
          <rect y="720" width="1600" height="180" fill="#020617" />
        </svg>
      );
    case "office":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="1600" height="900" fill="#e0f2fe" />
          <rect y="640" width="1600" height="260" fill="#cbd5e1" />
          <rect x="80" y="100" width="560" height="320" fill="#7dd3fc" stroke={K} strokeWidth="8" />
          <Windows x={120} y={240} cols={8} rows={3} w={34} h={30} gap={26} seed={5} />
          <line x1="360" y1="100" x2="360" y2="420" stroke={K} strokeWidth="8" />
          <rect x="760" y="120" width="560" height="300" rx="10" fill="#0f172a" stroke={K} strokeWidth="8" />
          <text x="1040" y="290" textAnchor="middle" fontSize="60" fontWeight="900" fill="#38bdf8" fontFamily="sans-serif">УПК МВД</text>
          {[160, 620, 1080].map((x) => (
            <g key={x}>
              <rect x={x} y="560" width="360" height="30" fill="#a16207" stroke={K} strokeWidth="6" />
              <rect x={x + 110} y="450" width="140" height="100" rx="8" fill="#1e293b" stroke={K} strokeWidth="6" />
              <rect x={x + 124} y="464" width="112" height="72" fill="#22c55e" opacity="0.6" />
            </g>
          ))}
          <text x="1460" y="620" fontSize="110" textAnchor="middle">🪴</text>
        </svg>
      );
    case "interrogation":
      return (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="1600" height="900" fill="#9ca3af" />
          <rect y="640" width="1600" height="260" fill="#4b5563" />
          <rect x="1000" y="140" width="460" height="300" fill="#111827" stroke={K} strokeWidth="8" />
          <line x1="800" y1="0" x2="800" y2="140" stroke={K} strokeWidth="5" />
          <path d="M740 140 L860 140 L830 190 L770 190 Z" fill="#334155" stroke={K} strokeWidth="5" />
          <path d="M770 190 L520 640 L1080 640 L830 190 Z" fill="#fde047" opacity="0.18" />
          <rect x="520" y="600" width="560" height="40" fill="#64748b" stroke={K} strokeWidth="6" />
          <rect x="560" y="640" width="24" height="200" fill="#475569" stroke={K} strokeWidth="5" />
          <rect x="1016" y="640" width="24" height="200" fill="#475569" stroke={K} strokeWidth="5" />
          <rect x="740" y="570" width="120" height="30" fill="#fbbf24" stroke={K} strokeWidth="4" />
        </svg>
      );
    default:
      return null;
  }
}

function ImgScene({ bg }: { bg: "office" | "interrogation" }) {
  const path = `/bg/${bg}.webp`;
  const [cur, setCur] = useState(asset(path));
  const [failed, setFailed] = useState(false);
  const onError = () => {
    if (cur.startsWith("data:")) return setFailed(true);
    import("@/game/embeddedArt")
      .then((m) => (m.ART[path] ? setCur(m.ART[path]) : setFailed(true)))
      .catch(() => setFailed(true));
  };
  if (failed) return <SvgScene id={bg} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={cur} alt="" onError={onError} className="absolute inset-0 h-full w-full object-cover" draggable={false} />;
}

export function SceneBg({ bg, dim }: { bg: BgId; dim?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {bg === "office" || bg === "interrogation" ? (
        <ImgScene bg={bg} />
      ) : (
        <SvgScene id={bg} />
      )}
      {dim && <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" />}
    </div>
  );
}

export function BigCaption({ text }: { text: string }) {
  return (
    <div key={text} className="pointer-events-none absolute inset-x-0 top-[38%] z-30 flex justify-center px-4">
      <div className="caption-pop caption-text text-center text-3xl leading-tight sm:text-5xl">{text}</div>
    </div>
  );
}
