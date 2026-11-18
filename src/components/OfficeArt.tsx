"use client";
import type { ReactNode } from "react";
import { CITIES, MAP_H, MAP_W, REGIONS } from "@/game/mapData";
import { REGION_COLORS } from "./BelarusMap";

const K = "#1a1a1a";

/* ========== ПРЕДМЕТЫ ========== */

const Plant = (
  <g>
    <g className="sway" style={{ transformOrigin: "80px 230px" }}>
      <path d="M80 228 C74 190 90 150 78 96" stroke="#78350f" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M80 180 C96 168 104 150 108 130 M79 140 C64 128 56 110 52 96" stroke="#78350f" strokeWidth={5} fill="none" />
      {[
        [48, 118, -40, 34, 15, "#16a34a"],
        [114, 110, 35, 34, 15, "#22c55e"],
        [40, 168, -25, 36, 16, "#22c55e"],
        [120, 158, 30, 36, 16, "#16a34a"],
        [78, 66, -5, 30, 14, "#4ade80"],
        [56, 80, -60, 27, 13, "#16a34a"],
        [102, 76, 55, 27, 13, "#22c55e"],
        [66, 204, -15, 30, 13, "#16a34a"],
        [102, 198, 20, 30, 13, "#22c55e"],
        [90, 40, 20, 22, 11, "#4ade80"],
      ].map(([cx, cy, r, rx, ry, c], i) => (
        <g key={i} transform={`rotate(${r} ${cx} ${cy})`}>
          <ellipse cx={cx as number} cy={cy as number} rx={rx as number} ry={ry as number} fill={c as string} stroke={K} strokeWidth={4} />
          <line x1={(cx as number) - (rx as number) + 6} y1={cy as number} x2={(cx as number) + (rx as number) - 6} y2={cy as number} stroke="#14532d" strokeWidth={2} />
        </g>
      ))}
    </g>
    <path d="M38 222 L122 222 L112 298 L48 298 Z" fill="#c2410c" stroke={K} strokeWidth={5} strokeLinejoin="round" />
    <rect x={32} y={210} width={96} height={20} rx={5} fill="#ea580c" stroke={K} strokeWidth={5} />
    <rect x={54} y={246} width={52} height={20} rx={4} fill="#fef3c7" stroke={K} strokeWidth={2.5} />
    <text x={80} y={260} fontSize={11} textAnchor="middle" fontWeight={900} fill={K} fontFamily="sans-serif">ВАСЯ</text>
  </g>
);

const Tea = (
  <g>
    <path className="steam" d="M30 30 q-7 -8 0 -15 q7 -8 0 -15" stroke="#e2e8f0" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <path className="steam" style={{ animationDelay: "1.2s" }} d="M48 30 q-7 -8 0 -15 q7 -8 0 -15" stroke="#e2e8f0" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <line x1={54} y1={12} x2={46} y2={76} stroke="#94a3b8" strokeWidth={4} strokeLinecap="round" />
    <path d="M18 34 L62 34 L58 106 L22 106 Z" fill="#fef9c3" fillOpacity={0.55} stroke={K} strokeWidth={3} />
    <path d="M20 48 L60 48 L58 106 L22 106 Z" fill="#b45309" opacity={0.9} />
    <circle cx={36} cy={52} r={8} fill="#fde047" stroke="#ca8a04" strokeWidth={2} />
    <path d="M30 52 L42 52 M36 46 L36 58" stroke="#ca8a04" strokeWidth={1.5} />
    <path d="M62 70 C82 70 82 102 60 102" fill="none" stroke={K} strokeWidth={7} />
    <path d="M62 70 C82 70 82 102 60 102" fill="none" stroke="#cbd5e1" strokeWidth={3} />
    <path d="M15 64 L65 64 L61 112 L19 112 Z" fill="#cbd5e1" stroke={K} strokeWidth={3.5} />
    <path d="M20 76 L60 76 M22 98 L58 98" stroke="#64748b" strokeWidth={2} />
    {[26, 34, 42, 50].map((x) => <path key={x} d={`M${x} 82 l4 5 l-4 5 l-4 -5 Z`} fill="#94a3b8" stroke="#475569" strokeWidth={1} />)}
    <rect x={14} y={110} width={52} height={8} rx={3} fill="#94a3b8" stroke={K} strokeWidth={3} />
  </g>
);

const ZubrPortrait = (
  <g>
    <rect x={2} y={2} width={226} height={186} rx={6} fill="#ca8a04" stroke={K} strokeWidth={5} />
    <rect x={10} y={10} width={210} height={170} rx={3} fill="#eab308" stroke="#a16207" strokeWidth={3} />
    <rect x={18} y={18} width={194} height={154} fill="#bae6fd" stroke={K} strokeWidth={3} />
    <circle cx={180} cy={42} r={12} fill="#fde047" />
    {[30, 56, 82, 150, 176, 200].map((x, i) => (
      <path key={x} d={`M${x} ${130 - (i % 2) * 8} l14 -46 l14 46 Z`} fill={i % 2 ? "#166534" : "#15803d"} stroke={K} strokeWidth={2} />
    ))}
    <rect x={18} y={128} width={194} height={44} fill="#65a30d" />
    <path d="M18 128 L212 128" stroke={K} strokeWidth={2} />
    <g>
      <rect x={92} y={140} width={10} height={24} fill="#3f1d0b" stroke={K} strokeWidth={2} />
      <rect x={108} y={142} width={10} height={22} fill="#3f1d0b" stroke={K} strokeWidth={2} />
      <rect x={140} y={140} width={10} height={24} fill="#3f1d0b" stroke={K} strokeWidth={2} />
      <rect x={154} y={142} width={10} height={22} fill="#3f1d0b" stroke={K} strokeWidth={2} />
      <path d="M168 120 q14 4 10 22" stroke={K} strokeWidth={3} fill="none" />
      <ellipse cx={132} cy={126} rx={42} ry={22} fill="#78350f" stroke={K} strokeWidth={3} />
      <ellipse cx={104} cy={112} rx={26} ry={24} fill="#5b2a0b" stroke={K} strokeWidth={3} />
      <circle cx={80} cy={124} r={16} fill="#5b2a0b" stroke={K} strokeWidth={3} />
      <path d="M70 134 q8 16 18 2" fill="#3f1d0b" stroke={K} strokeWidth={2} />
      <path d="M72 110 q-8 -10 -2 -16 M88 108 q8 -10 2 -16" stroke="#f5f5f4" strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={76} cy={121} r={2.5} fill="#fff" />
    </g>
    <rect x={70} y={176} width={90} height={11} rx={2} fill="#fde68a" stroke={K} strokeWidth={1.5} />
    <text x={115} y={184.5} fontSize={7} textAnchor="middle" fontWeight={900} fill={K} fontFamily="sans-serif">БЕЛОВЕЖСКАЯ ПУЩА</text>
  </g>
);

const MAP_ROUTE = ["minsk", "polotsk", "vitebsk", "mogilev", "svetlogorsk", "gomel", "pinsk", "brest", "grodno", "minsk"];
const routePts = MAP_ROUTE.map((id) => CITIES.find((c) => c.id === id)!).filter(Boolean);
const MapBoard = (
  <g>
    <rect x={2} y={2} width={296} height={226} rx={8} fill="#92400e" stroke={K} strokeWidth={5} />
    <rect x={12} y={12} width={276} height={206} rx={4} fill="#d6a96a" stroke={K} strokeWidth={2.5} />
    {Array.from({ length: 40 }).map((_, i) => (
      <circle key={i} cx={20 + ((i * 53) % 262)} cy={20 + ((i * 37) % 192)} r={1.6} fill="#a16207" opacity={0.5} />
    ))}
    <svg x={18} y={16} width={264} height={198} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
      {REGIONS.map((r) => (
        <path key={r.id} d={r.path} fill={REGION_COLORS[r.id]} stroke="#1e1b2e" strokeWidth={7} fillRule="evenodd" strokeLinejoin="round" />
      ))}
      <polyline points={routePts.map((c) => `${c.x},${c.y}`).join(" ")} fill="none" stroke="#dc2626" strokeWidth={7} strokeDasharray="2 0" />
      {routePts.map((c) => (
        <g key={c.id}>
          <circle cx={c.x} cy={c.y} r={18} fill="#ef4444" stroke={K} strokeWidth={5} />
          <circle cx={c.x - 5} cy={c.y - 5} r={5} fill="#fecaca" />
        </g>
      ))}
    </svg>
    <g transform="rotate(9 250 178)">
      <rect x={222} y={152} width={58} height={50} fill="#fde047" stroke={K} strokeWidth={2.5} />
      <text x={251} y={174} fontSize={12} textAnchor="middle" fontWeight={900} fill="#b91c1c" fontFamily="sans-serif">NEST?</text>
      <text x={251} y={192} fontSize={9} textAnchor="middle" fill={K} fontFamily="sans-serif">🕊 аист</text>
    </g>
    <g transform="rotate(-6 50 190)">
      <rect x={22} y={170} width={56} height={40} fill="#fff" stroke={K} strokeWidth={2} />
      <text x={50} y={186} fontSize={8} textAnchor="middle" fill={K} fontFamily="monospace">185.77.</text>
      <text x={50} y={198} fontSize={8} textAnchor="middle" fill={K} fontFamily="monospace">12.40</text>
    </g>
  </g>
);

const Monitor2 = (
  <g>
    <rect x={5} y={5} width={150} height={100} rx={8} fill="#111827" stroke={K} strokeWidth={5} />
    <rect x={14} y={14} width={132} height={82} rx={3} fill="#0b1220" />
    {[
      [20, 22, 44, "#22c55e"], [20, 32, 70, "#38bdf8"], [28, 42, 56, "#f472b6"], [28, 52, 80, "#facc15"], [20, 62, 38, "#22c55e"], [20, 72, 60, "#38bdf8"],
    ].map(([x, y, w, c], i) => <rect key={i} x={x as number} y={y as number} width={w as number} height={4} rx={2} fill={c as string} />)}
    <polyline points="96,86 106,74 116,80 126,62 138,68" fill="none" stroke="#4ade80" strokeWidth={3} />
    <rect x={20} y={80} width={8} height={6} fill="#22c55e" className="blink" />
    <rect x={70} y={105} width={20} height={20} fill="#374151" stroke={K} strokeWidth={3} />
    <ellipse cx={80} cy={130} rx={40} ry={8} fill="#4b5563" stroke={K} strokeWidth={4} />
  </g>
);

const Cat = (
  <g>
    <g className="tail-wag" style={{ transformOrigin: "92px 104px" }}>
      <path d="M92 104 C122 104 128 72 114 52" stroke={K} strokeWidth={15} fill="none" strokeLinecap="round" />
      <path d="M92 104 C122 104 128 72 114 52" stroke="#9ca3af" strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
    <path d="M30 114 C22 72 44 54 64 54 C84 54 106 72 98 114 Z" fill="#9ca3af" stroke={K} strokeWidth={4} />
    <ellipse cx={64} cy={96} rx={16} ry={18} fill="#e5e7eb" />
    <path d="M36 80 q8 4 10 12 M92 80 q-8 4 -10 12" stroke="#6b7280" strokeWidth={4} fill="none" />
    <ellipse cx={48} cy={114} rx={12} ry={6} fill="#d1d5db" stroke={K} strokeWidth={3} />
    <ellipse cx={80} cy={114} rx={12} ry={6} fill="#d1d5db" stroke={K} strokeWidth={3} />
    <path d="M40 30 L44 4 L62 22 Z" fill="#9ca3af" stroke={K} strokeWidth={4} strokeLinejoin="round" />
    <path d="M88 30 L84 4 L66 22 Z" fill="#9ca3af" stroke={K} strokeWidth={4} strokeLinejoin="round" />
    <path d="M45 24 L46 12 L55 21 Z M83 24 L82 12 L73 21 Z" fill="#f9a8d4" />
    <circle cx={64} cy={42} r={28} fill="#9ca3af" stroke={K} strokeWidth={4} />
    <path d="M56 18 l2 8 M64 16 l0 9 M72 18 l-2 8" stroke="#6b7280" strokeWidth={3} />
    <g className="eye-blink" style={{ transformOrigin: "64px 40px" }}>
      <ellipse cx={52} cy={40} rx={8} ry={9} fill="#fff" stroke={K} strokeWidth={2.5} />
      <ellipse cx={76} cy={40} rx={8} ry={9} fill="#fff" stroke={K} strokeWidth={2.5} />
      <ellipse cx={53} cy={41} rx={4.5} ry={6} fill="#84cc16" />
      <ellipse cx={77} cy={41} rx={4.5} ry={6} fill="#84cc16" />
      <ellipse cx={53} cy={41} rx={2} ry={4.5} fill={K} />
      <ellipse cx={77} cy={41} rx={2} ry={4.5} fill={K} />
    </g>
    <path d="M60 52 L68 52 L64 57 Z" fill="#f472b6" stroke={K} strokeWidth={1.5} />
    <path d="M64 57 q-5 6 -10 2 M64 57 q5 6 10 2" stroke={K} strokeWidth={2} fill="none" />
    <path d="M44 54 L22 50 M44 58 L22 60 M84 54 L106 50 M84 58 L106 60" stroke={K} strokeWidth={1.5} />
    <path d="M42 68 Q64 76 86 68" stroke="#dc2626" strokeWidth={6} fill="none" />
    <circle cx={64} cy={76} r={6} fill="#facc15" stroke={K} strokeWidth={2} />
    <text x={64} y={79} fontSize={7} textAnchor="middle" fontWeight={900} fill={K} fontFamily="sans-serif">B</text>
  </g>
);

const Neon = (
  <g>
    <defs>
      <filter id="neon-glow" x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <line x1={60} y1={0} x2={60} y2={8} stroke={K} strokeWidth={3} />
    <line x1={280} y1={0} x2={280} y2={8} stroke={K} strokeWidth={3} />
    <rect x={4} y={8} width={332} height={58} rx={12} fill="#0f172a" stroke={K} strokeWidth={4} />
    <g className="neon-flicker" filter="url(#neon-glow)">
      <path d="M22 22 L50 22 L50 40 Q50 54 36 60 Q22 54 22 40 Z" fill="none" stroke="#22d3ee" strokeWidth={3} />
      <path d="M29 39 L35 46 L44 33" fill="none" stroke="#22d3ee" strokeWidth={3} />
      <text x={190} y={50} fontSize={34} textAnchor="middle" fontFamily="'Russo One', sans-serif" fill="none" stroke="#f472b6" strokeWidth={2.4}>КИБЕРЩИТ</text>
      <text x={190} y={50} fontSize={34} textAnchor="middle" fontFamily="'Russo One', sans-serif" fill="none" stroke="#fdf2f8" strokeWidth={0.8}>КИБЕРЩИТ</text>
    </g>
  </g>
);

const Coffee = (
  <g>
    <rect x={0} y={148} width={140} height={110} rx={4} fill="#a16207" stroke={K} strokeWidth={5} />
    <line x1={70} y1={150} x2={70} y2={256} stroke={K} strokeWidth={3} />
    <circle cx={60} cy={200} r={4} fill="#fde68a" stroke={K} strokeWidth={2} />
    <circle cx={80} cy={200} r={4} fill="#fde68a" stroke={K} strokeWidth={2} />
    <rect x={14} y={8} width={112} height={140} rx={12} fill="#1f2937" stroke={K} strokeWidth={5} />
    <rect x={14} y={8} width={112} height={42} rx={12} fill="#b91c1c" stroke={K} strokeWidth={5} />
    <rect x={26} y={18} width={52} height={20} rx={3} fill="#052e16" stroke={K} strokeWidth={2} />
    <text x={52} y={32} fontSize={9} textAnchor="middle" fill="#4ade80" fontFamily="monospace" fontWeight={700}>ESPRESSO</text>
    <circle cx={94} cy={28} r={6} fill="#facc15" stroke={K} strokeWidth={2} />
    <circle cx={112} cy={28} r={6} fill="#e5e7eb" stroke={K} strokeWidth={2} />
    <rect x={36} y={60} width={68} height={74} rx={4} fill="#0b0f19" stroke={K} strokeWidth={3} />
    <rect x={62} y={60} width={16} height={14} fill="#9ca3af" stroke={K} strokeWidth={2.5} />
    <path className="steam" d="M64 100 q-4 -6 0 -11 q4 -6 0 -11" stroke="#e2e8f0" strokeWidth={2.5} fill="none" />
    <path className="steam" style={{ animationDelay: "1s" }} d="M76 100 q-4 -6 0 -11 q4 -6 0 -11" stroke="#e2e8f0" strokeWidth={2.5} fill="none" />
    <path d="M54 104 L86 104 L82 126 L58 126 Z" fill="#fff" stroke={K} strokeWidth={3} />
    <path d="M86 108 q10 2 6 12 q-3 4 -8 2" fill="none" stroke={K} strokeWidth={3} />
    <ellipse cx={70} cy={105} rx={15} ry={3} fill="#78350f" />
    <rect x={40} y={126} width={60} height={8} rx={2} fill="#9ca3af" stroke={K} strokeWidth={2.5} />
  </g>
);

const Safe = (
  <g>
    <rect x={14} y={114} width={18} height={14} fill="#334155" stroke={K} strokeWidth={3} />
    <rect x={108} y={114} width={18} height={14} fill="#334155" stroke={K} strokeWidth={3} />
    <rect x={6} y={6} width={128} height={110} rx={8} fill="#475569" stroke={K} strokeWidth={5} />
    <rect x={16} y={16} width={108} height={90} rx={6} fill="#64748b" stroke={K} strokeWidth={3} />
    <circle cx={64} cy={56} r={24} fill="#cbd5e1" stroke={K} strokeWidth={4} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={64 + Math.cos(a) * 17} y1={56 + Math.sin(a) * 17} x2={64 + Math.cos(a) * 22} y2={56 + Math.sin(a) * 22} stroke={K} strokeWidth={2} />;
    })}
    <circle cx={64} cy={56} r={9} fill="#334155" stroke={K} strokeWidth={2.5} />
    <rect x={98} y={44} width={14} height={26} rx={4} fill="#94a3b8" stroke={K} strokeWidth={3} />
    <rect x={36} y={86} width={56} height={14} rx={2} fill="#fde047" stroke={K} strokeWidth={2} />
    <text x={64} y={97} fontSize={10} textAnchor="middle" fontWeight={900} fill={K} fontFamily="sans-serif">УЛИКИ</text>
  </g>
);

const Aquarium = (
  <g>
    <rect x={10} y={150} width={200} height={106} rx={4} fill="#78350f" stroke={K} strokeWidth={5} />
    <line x1={110} y1={152} x2={110} y2={254} stroke={K} strokeWidth={3} />
    <circle cx={98} cy={204} r={4} fill="#fde68a" stroke={K} strokeWidth={2} />
    <circle cx={122} cy={204} r={4} fill="#fde68a" stroke={K} strokeWidth={2} />
    <rect x={6} y={20} width={208} height={132} rx={6} fill="#7dd3fc" fillOpacity={0.75} stroke={K} strokeWidth={5} />
    <path d="M10 36 Q60 30 110 36 T210 36" stroke="#e0f2fe" strokeWidth={3} fill="none" />
    <path d="M10 136 Q60 122 110 132 T210 128 L210 148 L10 148 Z" fill="#fde68a" />
    {[30, 52, 150, 176, 190].map((x, i) => <circle key={x} cx={x} cy={140 - (i % 2) * 3} r={4 + (i % 2)} fill={i % 2 ? "#a8a29e" : "#78716c"} stroke={K} strokeWidth={1.5} />)}
    {[[40, 136], [64, 140], [172, 134]].map(([x, y], i) => (
      <path key={i} className="sway" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 0.7}s` }} d={`M${x} ${y} C${x - 10} ${y - 30} ${x + 10} ${y - 50} ${x} ${y - 80}`} stroke="#16a34a" strokeWidth={7} fill="none" strokeLinecap="round" />
    ))}
    <g className="fish-swim">
      <path d="M40 80 L28 70 L28 90 Z" fill="#f97316" stroke={K} strokeWidth={2} />
      <ellipse cx={54} cy={80} rx={17} ry={11} fill="#fb923c" stroke={K} strokeWidth={2.5} />
      <path d="M50 70 L54 80 L50 90" stroke="#fff" strokeWidth={2} fill="none" />
      <circle cx={63} cy={77} r={3} fill="#fff" />
      <circle cx={64} cy={77} r={1.5} fill={K} />
    </g>
    <g className="fish-swim fish-swim-2">
      <path d="M170 108 L182 100 L182 116 Z" fill="#2563eb" stroke={K} strokeWidth={2} />
      <ellipse cx={158} cy={108} rx={13} ry={8} fill="#facc15" stroke={K} strokeWidth={2.5} />
      <circle cx={151} cy={106} r={2.5} fill="#fff" />
      <circle cx={150.5} cy={106} r={1.2} fill={K} />
    </g>
    {[[110, 0], [120, 1.1], [104, 2.1]].map(([x, d], i) => (
      <circle key={i} className="bubble-rise" style={{ animationDelay: `${d}s` }} cx={x} cy={126} r={4 - i} fill="none" stroke="#f0f9ff" strokeWidth={2} />
    ))}
    <line x1={22} y1={46} x2={22} y2={120} stroke="#fff" strokeWidth={4} opacity={0.5} strokeLinecap="round" />
    <rect x={0} y={10} width={220} height={14} rx={4} fill="#111827" stroke={K} strokeWidth={4} />
  </g>
);

const ExecChair = (
  <g>
    {[[30, 286], [60, 292], [120, 292], [150, 286], [90, 296]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8} fill="#111827" stroke={K} strokeWidth={2.5} />)}
    <path d="M90 244 L30 280 M90 244 L60 286 M90 244 L120 286 M90 244 L150 280 M90 244 L90 290" stroke="#374151" strokeWidth={8} strokeLinecap="round" />
    <rect x={82} y={190} width={16} height={56} fill="#6b7280" stroke={K} strokeWidth={3} />
    <rect x={30} y={8} width={120} height={154} rx={34} fill="#7c2d12" stroke={K} strokeWidth={5} />
    <rect x={44} y={22} width={92} height={124} rx={24} fill="#9a3412" stroke="#451a03" strokeWidth={3} />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={64 + c * 26} cy={50 + r * 34} r={4} fill="#451a03" />))}
    <rect x={8} y={118} width={28} height={58} rx={10} fill="#451a03" stroke={K} strokeWidth={4} />
    <rect x={144} y={118} width={28} height={58} rx={10} fill="#451a03" stroke={K} strokeWidth={4} />
    <rect x={20} y={150} width={140} height={44} rx={18} fill="#9a3412" stroke={K} strokeWidth={5} />
    <path d="M36 164 Q90 176 144 164" stroke="#7c2d12" strokeWidth={3} fill="none" />
  </g>
);

const BasicChair = (
  <g>
    {[[40, 286], [90, 294], [140, 286]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8} fill="#111827" stroke={K} strokeWidth={2.5} />)}
    <path d="M90 244 L40 282 M90 244 L90 290 M90 244 L140 282" stroke="#4b5563" strokeWidth={7} strokeLinecap="round" />
    <rect x={83} y={196} width={14} height={50} fill="#9ca3af" stroke={K} strokeWidth={3} />
    <rect x={44} y={60} width={92} height={100} rx={18} fill="#6b7280" stroke={K} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={54} y1={78 + i * 16} x2={126} y2={78 + i * 16} stroke="#4b5563" strokeWidth={2} />)}
    <rect x={30} y={158} width={120} height={38} rx={14} fill="#6b7280" stroke={K} strokeWidth={5} />
  </g>
);

const Sofa = (
  <g>
    <rect x={56} y={214} width={16} height={22} fill="#422006" stroke={K} strokeWidth={3} />
    <rect x={368} y={214} width={16} height={22} fill="#422006" stroke={K} strokeWidth={3} />
    <rect x={40} y={18} width={178} height={116} rx={26} fill="#0f766e" stroke={K} strokeWidth={5} />
    <rect x={222} y={18} width={178} height={116} rx={26} fill="#0f766e" stroke={K} strokeWidth={5} />
    <rect x={0} y={64} width={64} height={154} rx={26} fill="#115e59" stroke={K} strokeWidth={5} />
    <rect x={376} y={64} width={64} height={154} rx={26} fill="#115e59" stroke={K} strokeWidth={5} />
    <rect x={44} y={122} width={352} height={70} rx={18} fill="#14b8a6" stroke={K} strokeWidth={5} />
    <line x1={220} y1={126} x2={220} y2={190} stroke={K} strokeWidth={3} />
    <rect x={44} y={184} width={352} height={34} rx={8} fill="#0f766e" stroke={K} strokeWidth={5} />
    <g transform="rotate(-12 110 90)">
      <rect x={72} y={56} width={80} height={70} rx={12} fill="#fff" stroke={K} strokeWidth={4} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${92 + i * 20} 72 l8 10 l-8 10 l-8 -10 Z`} fill="#dc2626" />)}
      <path d="M80 104 L144 104" stroke="#dc2626" strokeWidth={4} />
      <path d="M80 112 L144 112" stroke="#dc2626" strokeWidth={2} strokeDasharray="6 4" />
    </g>
    <path d="M360 60 C396 56 420 70 418 110 L418 200 L392 196 L392 120 C392 96 380 86 360 84 Z" fill="#dc2626" stroke={K} strokeWidth={4} />
    {[0, 1, 2].map((i) => <line key={i} x1={398 + i * 7} y1={110} x2={398 + i * 7} y2={196} stroke="#fff" strokeWidth={2.5} />)}
  </g>
);

const Cup = (
  <g>
    <polygon className="blink" points="84,6 87,13 94,14 89,19 90,26 84,22 78,26 79,19 74,14 81,13" fill="#fef08a" stroke="#ca8a04" strokeWidth={1.5} />
    <path d="M20 26 C2 26 2 52 26 56" fill="none" stroke={K} strokeWidth={8} />
    <path d="M80 26 C98 26 98 52 74 56" fill="none" stroke={K} strokeWidth={8} />
    <path d="M20 26 C2 26 2 52 26 56" fill="none" stroke="#eab308" strokeWidth={4} />
    <path d="M80 26 C98 26 98 52 74 56" fill="none" stroke="#eab308" strokeWidth={4} />
    <path d="M18 16 L82 16 C82 62 66 78 50 80 C34 78 18 62 18 16 Z" fill="#facc15" stroke={K} strokeWidth={4} />
    <path d="M28 24 C28 50 34 62 42 68" stroke="#fef9c3" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
    <rect x={44} y={80} width={12} height={18} fill="#eab308" stroke={K} strokeWidth={3} />
    <rect x={28} y={96} width={44} height={10} rx={2} fill="#ca8a04" stroke={K} strokeWidth={3} />
    <rect x={20} y={106} width={60} height={28} rx={3} fill="#1f2937" stroke={K} strokeWidth={3} />
    <rect x={26} y={112} width={48} height={16} rx={2} fill="#fde68a" />
    <text x={50} y={119.5} fontSize={6} textAnchor="middle" fontWeight={900} fill={K} fontFamily="sans-serif">ЛУЧШИЙ</text>
    <text x={50} y={126} fontSize={6} textAnchor="middle" fontWeight={900} fill={K} fontFamily="sans-serif">ОПЕР</text>
  </g>
);

const Server = (
  <g>
    <rect x={18} y={490} width={20} height={8} fill="#111827" />
    <rect x={122} y={490} width={20} height={8} fill="#111827" />
    <rect x={6} y={6} width={148} height={486} rx={8} fill="#111827" stroke={K} strokeWidth={5} />
    <rect x={16} y={14} width={128} height={20} rx={3} fill="#1f2937" />
    <text x={80} y={29} fontSize={12} textAnchor="middle" fill="#38bdf8" fontFamily="monospace" fontWeight={700}>NODE-01 · УПК</text>
    {Array.from({ length: 10 }).map((_, i) => (
      <g key={i}>
        <rect x={18} y={42 + i * 44} width={124} height={36} rx={4} fill="#1f2937" stroke="#374151" strokeWidth={2} />
        <circle cx={32} cy={60 + i * 44} r={4} fill={i % 4 === 3 ? "#ef4444" : "#22c55e"} className="blink" style={{ animationDelay: `${(i * 0.37) % 1.6}s` }} />
        <circle cx={45} cy={60 + i * 44} r={4} fill="#38bdf8" className="blink" style={{ animationDelay: `${(i * 0.61) % 1.6}s` }} />
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={62 + k * 11} y1={50 + i * 44} x2={62 + k * 11} y2={70 + i * 44} stroke="#0b0f19" strokeWidth={3} />)}
      </g>
    ))}
    <path d="M140 120 C160 150 150 200 140 230" stroke="#f59e0b" strokeWidth={4} fill="none" />
    <path d="M140 260 C162 300 150 350 140 380" stroke="#3b82f6" strokeWidth={4} fill="none" />
    <rect x={10} y={38} width={140} height={448} rx={4} fill="#38bdf8" opacity={0.07} />
  </g>
);

const Flag = (
  <g>
    <path d="M18 34 L10 22 L18 0 L26 22 Z" fill="#facc15" stroke={K} strokeWidth={3} />
    <rect x={14} y={32} width={8} height={566} fill="#a16207" stroke={K} strokeWidth={3} />
    <path d="M2 640 L8 596 L28 596 L34 640 Z" fill="#374151" stroke={K} strokeWidth={4} />
    <g className="flag-wave" style={{ transformOrigin: "22px 110px" }}>
      <path d="M22 48 C70 38 112 60 166 48 L166 168 C112 180 70 158 22 168 Z" fill="#c8102e" stroke={K} strokeWidth={3} />
      <path d="M22 128 C70 118 112 140 166 128 L166 168 C112 180 70 158 22 168 Z" fill="#007a33" stroke={K} strokeWidth={3} />
      <path d="M22 48 L42 46 L42 166 L22 168 Z" fill="#fff" stroke={K} strokeWidth={2} />
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M32 ${56 + i * 14} l6 6 l-6 6 l-6 -6 Z`} fill="#c8102e" />
      ))}
    </g>
  </g>
);

/* ========== КАТАЛОГ ========== */

export interface ItemArt {
  vb: [number, number];
  x: number;
  y: number;
  w: number;
  layer: 0 | 1 | 2 | 3; // 0 стена, 1 мебель у стены, 2 на/под столом, 3 передний план
  node: ReactNode;
  preview?: string; // кадр для витрины магазина
}

export const ITEM_ART: Record<string, ItemArt> = {
  zubrportrait: { vb: [230, 190], x: 180, y: 58, w: 210, layer: 0, node: ZubrPortrait },
  cup: { vb: [100, 140], x: 252, y: 256, w: 76, layer: 0, node: Cup },
  map: { vb: [300, 230], x: 950, y: 105, w: 250, layer: 0, node: MapBoard },
  neon: { vb: [340, 70], x: 590, y: 20, w: 340, layer: 0, node: Neon },
  flag: { vb: [170, 640], x: 1205, y: 96, w: 157, layer: 1, node: Flag, preview: "0 -4 172 220" },
  server: { vb: [160, 500], x: 1440, y: 250, w: 150, layer: 1, node: Server, preview: "0 0 160 260" },
  coffee: { vb: [140, 260], x: 1280, y: 462, w: 140, layer: 1, node: Coffee },
  sofa: { vb: [440, 240], x: 40, y: 520, w: 440, layer: 1, node: Sofa },
  tea: { vb: [80, 120], x: 680, y: 508, w: 64, layer: 2, node: Tea },
  monitor2: { vb: [160, 140], x: 930, y: 470, w: 150, layer: 2, node: Monitor2 },
  cat: { vb: [130, 120], x: 1068, y: 488, w: 110, layer: 2, node: Cat },
  safe: { vb: [140, 130], x: 985, y: 672, w: 130, layer: 2, node: Safe },
  chair: { vb: [180, 300], x: 650, y: 600, w: 150, layer: 3, node: ExecChair },
  plant: { vb: [160, 300], x: 478, y: 462, w: 150, layer: 3, node: Plant },
  aquarium: { vb: [220, 260], x: 1210, y: 700, w: 210, layer: 3, node: Aquarium },
};

export function ItemPreview({ id, className }: { id: string; className?: string }) {
  const a = ITEM_ART[id];
  if (!a) return null;
  return (
    <svg viewBox={a.preview ?? `0 0 ${a.vb[0]} ${a.vb[1]}`} className={className} preserveAspectRatio="xMidYMid meet">
      {a.node}
    </svg>
  );
}

/* ========== КОМНАТА ========== */

export interface Tier {
  name: string;
  wall: string;
  wall2: string;
  floor: string;
  floor2: string;
}

function placed(id: string, a: ItemArt, onItem: (id: string) => void) {
  const h = (a.w * a.vb[1]) / a.vb[0];
  return (
    <g key={id} className="office-item" onClick={() => onItem(id)}>
      <svg x={a.x} y={a.y} width={a.w} height={h} viewBox={`0 0 ${a.vb[0]} ${a.vb[1]}`} overflow="visible">
        {a.node}
      </svg>
    </g>
  );
}

export function OfficeRoom({ owned, tier, plate, onItem }: { owned: string[]; tier: Tier; plate: string; onItem: (id: string) => void }) {
  const items = Object.entries(ITEM_ART).filter(([id]) => owned.includes(id));
  const layer = (n: number) => items.filter(([, a]) => a.layer === n).map(([id, a]) => placed(id, a, onItem));
  return (
    <svg viewBox="0 0 1600 1000" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      {/* стены */}
      <rect width={1600} height={704} fill={tier.wall} />
      {Array.from({ length: 17 }).map((_, i) => <line key={i} x1={i * 100} y1={0} x2={i * 100} y2={560} stroke={tier.wall2} strokeWidth={3} opacity={0.6} />)}
      <rect y={560} width={1600} height={136} fill={tier.wall2} />
      <rect y={556} width={1600} height={10} fill="#fff" opacity={0.5} />
      <rect y={690} width={1600} height={16} fill="#78350f" stroke={K} strokeWidth={3} />
      {/* пол */}
      <rect y={704} width={1600} height={296} fill={tier.floor} />
      {Array.from({ length: 21 }).map((_, i) => {
        const xb = -400 + i * 120;
        const xt = 800 + (xb - 800) * 0.62;
        return <line key={i} x1={xt} y1={704} x2={xb} y2={1000} stroke={tier.floor2} strokeWidth={3} />;
      })}
      {[790, 880].map((y) => <line key={y} x1={0} y1={y} x2={1600} y2={y} stroke={tier.floor2} strokeWidth={2} opacity={0.6} />)}
      {/* ковёр с орнаментом */}
      <ellipse cx={780} cy={890} rx={430} ry={78} fill="#b91c1c" stroke={K} strokeWidth={5} />
      <ellipse cx={780} cy={890} rx={380} ry={60} fill="none" stroke="#fef3c7" strokeWidth={4} strokeDasharray="18 10" />
      <ellipse cx={780} cy={890} rx={150} ry={26} fill="#7f1d1d" stroke="#fef3c7" strokeWidth={3} />
      {/* окно */}
      <rect x={596} y={100} width={328} height={304} rx={6} fill="#f8fafc" stroke={K} strokeWidth={6} />
      <rect x={612} y={116} width={296} height={272} fill="#7dd3fc" />
      <circle cx={860} cy={160} r={22} fill="#fde047" />
      <rect x={624} y={250} width={50} height={138} fill="#cbd5e1" stroke={K} strokeWidth={3} />
      <rect x={684} y={210} width={44} height={178} fill="#94a3b8" stroke={K} strokeWidth={3} />
      <path d="M770 300 L810 250 L850 300 L810 350 Z" fill="#38bdf8" stroke={K} strokeWidth={3} />
      <rect x={800} y={340} width={20} height={48} fill="#64748b" stroke={K} strokeWidth={2} />
      <rect x={858} y={270} width={44} height={118} fill="#fca5a5" stroke={K} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={632 + c * 20} y={262 + r * 24} width={12} height={14} fill="#fef08a" />))}
      <line x1={760} y1={116} x2={760} y2={388} stroke={K} strokeWidth={6} />
      <line x1={612} y1={250} x2={908} y2={250} stroke={K} strokeWidth={6} />
      <rect x={586} y={398} width={348} height={16} rx={4} fill="#e2e8f0" stroke={K} strokeWidth={4} />
      {/* памятка на стене */}
      <g transform="rotate(-3 515 190)">
        <rect x={470} y={130} width={92} height={124} fill="#fff" stroke={K} strokeWidth={3} />
        <circle cx={516} cy={136} r={6} fill="#ef4444" stroke={K} strokeWidth={2} />
        <text x={516} y={160} fontSize={11} textAnchor="middle" fontWeight={900} fill="#b91c1c" fontFamily="sans-serif">ПАМЯТКА</text>
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={480} y={170 + i * 12} width={72 - (i % 3) * 12} height={4} rx={2} fill="#94a3b8" />)}
      </g>
      {/* часы */}
      <circle cx={1500} cy={140} r={44} fill="#fff" stroke={K} strokeWidth={6} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={1500 + Math.cos(a) * 34} y1={140 + Math.sin(a) * 34} x2={1500 + Math.cos(a) * 40} y2={140 + Math.sin(a) * 40} stroke={K} strokeWidth={3} />;
      })}
      <line x1={1500} y1={140} x2={1500} y2={110} stroke={K} strokeWidth={5} strokeLinecap="round" />
      <line x1={1500} y1={140} x2={1522} y2={150} stroke="#dc2626" strokeWidth={4} strokeLinecap="round" />
      {/* полка с книгами */}
      <rect x={150} y={360} width={290} height={16} rx={3} fill="#92400e" stroke={K} strokeWidth={4} />
      {[["#2563eb", 0, 58], ["#dc2626", 22, 64], ["#16a34a", 44, 52], ["#7c3aed", 64, 60], ["#f59e0b", 86, 48]].map(([c, dx, h], i) => (
        <rect key={i} x={344 + (dx as number)} y={360 - (h as number)} width={20} height={h as number} fill={c as string} stroke={K} strokeWidth={3} />
      ))}
      <rect x={168} y={334} width={60} height={26} fill="#e2e8f0" stroke={K} strokeWidth={3} />
      <text x={198} y={352} fontSize={11} textAnchor="middle" fontWeight={900} fill={K} fontFamily="sans-serif">УК РБ</text>

      {layer(0)}
      {layer(1)}

      {/* стол */}
      <rect x={640} y={624} width={150} height={172} fill="#78350f" stroke={K} strokeWidth={5} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={640} y1={680 + i * 56} x2={790} y2={680 + i * 56} stroke={K} strokeWidth={3} />
          <rect x={700} y={644 + i * 56} width={30} height={8} rx={4} fill="#fde68a" stroke={K} strokeWidth={2} />
        </g>
      ))}
      <rect x={1124} y={624} width={26} height={172} fill="#78350f" stroke={K} strokeWidth={5} />
      <rect x={790} y={624} width={334} height={44} fill="#92400e" stroke={K} strokeWidth={4} />
      <rect x={610} y={588} width={560} height={38} rx={6} fill="#b45309" stroke={K} strokeWidth={5} />
      <rect x={880} y={632} width={160} height={28} rx={4} fill="#fde68a" stroke={K} strokeWidth={3} />
      <text x={960} y={651} fontSize={13} textAnchor="middle" fontWeight={900} fill={K} fontFamily="sans-serif">{plate}</text>
      {/* базовый монитор, клавиатура, папка */}
      <rect x={770} y={466} width={150} height={104} rx={8} fill="#1f2937" stroke={K} strokeWidth={5} />
      <rect x={780} y={476} width={130} height={84} rx={3} fill="#052e16" />
      <text x={788} y={496} fontSize={12} fill="#4ade80" fontFamily="monospace">&gt; scan…</text>
      <text x={788} y={514} fontSize={12} fill="#4ade80" fontFamily="monospace">&gt; phishing: 3</text>
      <text x={788} y={532} fontSize={12} fill="#4ade80" fontFamily="monospace">&gt; ok_</text>
      <rect x={834} y={570} width={22} height={18} fill="#374151" stroke={K} strokeWidth={3} />
      <rect x={760} y={592} width={150} height={12} rx={3} fill="#374151" stroke={K} strokeWidth={2} />
      <g transform="rotate(-6 1010 592)">
        <rect x={960} y={580} width={90} height={14} rx={2} fill="#fbbf24" stroke={K} strokeWidth={3} />
      </g>

      {layer(2)}

      {!owned.includes("chair") && (
        <g className="office-item" onClick={() => onItem("basic-chair")}>
          <svg x={650} y={600} width={150} height={250} viewBox="0 0 180 300">{BasicChair}</svg>
        </g>
      )}
      {layer(3)}
    </svg>
  );
}
