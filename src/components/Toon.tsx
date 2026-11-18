"use client";
import { useState } from "react";
import type { FaceParams } from "@/game/data";
import { asset } from "@/lib/paths";
import { CHARACTERS, RANKS, UNIFORMS, rankOf } from "@/game/data";
import type { GameState } from "@/game/types";

interface ToonProps extends FaceParams {
  accent?: string;
  tie?: string;
  cap?: string;
  boards?: { stars: number; big: boolean; color: string } | null;
  hood?: boolean;
  mood?: "neutral" | "happy" | "shock";
  className?: string;
}

const S = "#111";

function Star({ x, y, r }: { x: number; y: number; r: number }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`);
  }
  return <polygon points={pts.join(" ")} fill="#facc15" stroke="#7c5a00" strokeWidth={0.8} />;
}

function Board({ x, flip, stars, big, color }: { x: number; flip: boolean; stars: number; big: boolean; color: string }) {
  const positions = big
    ? [[0, -6], [0, 8], [0, 22]].slice(0, stars)
    : [[-5, 0], [5, 0], [0, 12], [0, 24]].slice(0, stars);
  return (
    <g transform={`translate(${x} 168) rotate(${flip ? 14 : -14})`}>
      <rect x={-14} y={-14} width={28} height={50} rx={6} fill={color} stroke={S} strokeWidth={3.5} />
      <line x1={0} y1={-12} x2={0} y2={34} stroke="#facc15" strokeWidth={big ? 2.5 : 0} />
      {positions.map(([px, py], i) => (
        <Star key={i} x={px} y={py + 2} r={big ? 6.5 : 4} />
      ))}
    </g>
  );
}

export function Toon(p: ToonProps) {
  const mood = p.mood ?? "neutral";
  const hairBack = p.style === "long" || p.style === "ponytail";
  return (
    <svg viewBox="0 0 200 240" className={p.className} xmlns="http://www.w3.org/2000/svg">
      {/* волосы сзади */}
      {hairBack && <path d="M48 90 Q44 170 70 190 L130 190 Q156 170 152 90 Z" fill={p.hair} stroke={S} strokeWidth={4} />}
      {/* тело */}
      <path d="M14 240 Q16 162 100 150 Q184 162 186 240 Z" fill={p.shirt} stroke={S} strokeWidth={5} />
      {p.hood && <path d="M58 156 Q100 190 142 156" fill="none" stroke={S} strokeWidth={4} />}
      {p.hood && (
        <>
          <line x1={88} y1={176} x2={86} y2={214} stroke="#e5e7eb" strokeWidth={4} />
          <line x1={112} y1={176} x2={114} y2={214} stroke="#e5e7eb" strokeWidth={4} />
        </>
      )}
      {!p.hood && (
        <>
          <path d="M78 152 L100 182 L122 152 Z" fill={p.accent ? "#f8fafc" : p.shirt} stroke={S} strokeWidth={3.5} />
          {p.tie && <path d="M95 168 L105 168 L110 218 L100 230 L90 218 Z" fill={p.tie} stroke={S} strokeWidth={3} />}
        </>
      )}
      {p.boards && p.boards.stars > 0 && (
        <>
          <Board x={42} flip={false} {...p.boards} />
          <Board x={158} flip {...p.boards} />
        </>
      )}
      {/* шея */}
      <rect x={86} y={130} width={28} height={26} fill={p.skin} stroke={S} strokeWidth={4} />
      {/* уши */}
      <ellipse cx={50} cy={98} rx={9} ry={12} fill={p.skin} stroke={S} strokeWidth={4} />
      <ellipse cx={150} cy={98} rx={9} ry={12} fill={p.skin} stroke={S} strokeWidth={4} />
      {/* голова */}
      <ellipse cx={100} cy={92} rx={50} ry={54} fill={p.skin} stroke={S} strokeWidth={5} />
      {/* щёки */}
      <ellipse cx={70} cy={112} rx={10} ry={6} fill="#fb7185" opacity={0.55} />
      <ellipse cx={130} cy={112} rx={10} ry={6} fill="#fb7185" opacity={0.55} />
      {/* глаза */}
      <circle cx={80} cy={90} r={mood === "shock" ? 15 : 13} fill="#fff" stroke={S} strokeWidth={3.5} />
      <circle cx={120} cy={90} r={mood === "shock" ? 15 : 13} fill="#fff" stroke={S} strokeWidth={3.5} />
      <circle cx={82} cy={92} r={mood === "shock" ? 3 : 4.5} fill={S} />
      <circle cx={118} cy={92} r={mood === "shock" ? 3 : 4.5} fill={S} />
      {p.glasses && (
        <g fill="none" stroke={S} strokeWidth={3.5}>
          <circle cx={80} cy={90} r={18} />
          <circle cx={120} cy={90} r={18} />
          <line x1={98} y1={90} x2={102} y2={90} />
        </g>
      )}
      {/* нос */}
      <ellipse cx={100} cy={106} rx={7} ry={6} fill="#f4a3a3" stroke={S} strokeWidth={3} />
      {/* усы / борода */}
      {p.beard && <path d="M58 112 Q100 168 142 112 Q130 150 100 152 Q70 150 58 112 Z" fill={p.hair} stroke={S} strokeWidth={3.5} />}
      {p.mustache && <path d="M78 118 Q100 108 122 118 Q112 128 100 120 Q88 128 78 118 Z" fill={p.hair === "#d4d4d8" ? "#a1a1aa" : p.hair} stroke={S} strokeWidth={3} />}
      {/* рот */}
      {mood === "happy" && <path d="M84 124 Q100 140 116 124 Z" fill="#7f1d1d" stroke={S} strokeWidth={3} />}
      {mood === "neutral" && <path d="M88 128 Q100 134 112 128" fill="none" stroke={S} strokeWidth={3.5} strokeLinecap="round" />}
      {mood === "shock" && <ellipse cx={100} cy={130} rx={7} ry={9} fill="#7f1d1d" stroke={S} strokeWidth={3} />}
      {/* причёска */}
      {p.style === "short" && <path d="M50 82 Q52 34 100 34 Q150 34 150 82 Q136 58 100 56 Q66 58 50 82 Z" fill={p.hair} stroke={S} strokeWidth={4} />}
      {p.style === "spiky" && <path d="M50 82 L52 46 L66 54 L72 30 L88 46 L100 24 L112 46 L128 30 L134 54 L148 46 L150 82 Q130 60 100 58 Q70 60 50 82 Z" fill={p.hair} stroke={S} strokeWidth={4} strokeLinejoin="round" />}
      {p.style === "curly" && (
        <g fill={p.hair} stroke={S} strokeWidth={3.5}>
          {[56, 72, 88, 104, 120, 136, 146, 52].map((x, i) => (
            <circle key={i} cx={x} cy={i === 6 || i === 7 ? 70 : 46 + (i % 2) * 6} r={15} />
          ))}
        </g>
      )}
      {(p.style === "long" || p.style === "ponytail") && <path d="M48 92 Q46 36 100 36 Q154 36 152 92 Q140 62 112 56 Q96 72 60 70 Q52 80 48 92 Z" fill={p.hair} stroke={S} strokeWidth={4} />}
      {p.style === "ponytail" && <path d="M146 60 Q186 70 172 130 Q164 100 148 84 Z" fill={p.hair} stroke={S} strokeWidth={4} />}
      {p.style === "bun" && (
        <>
          <circle cx={100} cy={30} r={18} fill={p.hair} stroke={S} strokeWidth={4} />
          <path d="M50 86 Q50 38 100 38 Q150 38 150 86 Q130 54 100 54 Q70 54 50 86 Z" fill={p.hair} stroke={S} strokeWidth={4} />
        </>
      )}
      {p.style === "bald" && <path d="M52 84 Q54 66 62 60 L60 92 Z M148 84 Q146 66 138 60 L140 92 Z" fill={p.hair} stroke={S} strokeWidth={3} />}
      {p.style === "cap" && (
        <>
          <path d="M50 76 Q52 30 100 30 Q148 30 150 76 Z" fill={p.shirt} stroke={S} strokeWidth={4} />
          <path d="M100 70 Q150 66 176 80 Q150 86 100 78 Z" fill={p.shirt} stroke={S} strokeWidth={4} />
        </>
      )}
      {/* фуражка */}
      {p.cap && (
        <g>
          <path d="M40 58 Q100 8 160 58 L150 66 L50 66 Z" fill={p.cap} stroke={S} strokeWidth={4} />
          <rect x={48} y={60} width={104} height={12} fill="#b91c1c" stroke={S} strokeWidth={3.5} />
          <path d="M54 72 Q100 92 146 72 L140 80 Q100 96 60 80 Z" fill="#111" />
          <circle cx={100} cy={46} r={7} fill="#facc15" stroke={S} strokeWidth={2.5} />
        </g>
      )}
    </svg>
  );
}

export function PlayerToon({ s, className, mood, uniformId }: { s: GameState; className?: string; mood?: "neutral" | "happy" | "shock"; uniformId?: string }) {
  const u = UNIFORMS.find((x) => x.id === (uniformId ?? s.uniform)) ?? UNIFORMS[0];
  const r = RANKS[rankOf(s.xp)];
  const female = s.gender === "f";
  return (
    <Toon
      className={className}
      skin="#f6d3b3"
      hair={female ? "#6b3f1d" : "#4a2c17"}
      style={u.cap ? "short" : female ? "ponytail" : "short"}
      shirt={u.body}
      accent={u.boards ? u.accent : undefined}
      tie={u.tie}
      cap={u.cap}
      hood={u.id === "hoodie"}
      boards={u.boards ? { stars: r.stars, big: r.big, color: u.id === "daily" ? "#1e3a8a" : u.id === "tactical" ? "#0f172a" : u.id === "field" ? "#365314" : "#1e3a8a" } : null}
      female={female}
      mood={mood}
    />
  );
}

// Запасные мультяшные лица, если файлы картинок (папка public) отсутствуют
const FALLBACK: Record<string, FaceParams & { cap?: string; tie?: string; boards?: { stars: number; big: boolean; color: string } }> = {
  kravets: { skin: "#f2c9a5", hair: "#9ca3af", style: "bald", shirt: "#bfdbfe", mustache: true, tie: "#1e3a8a", boards: { stars: 1, big: true, color: "#1e3a8a" } },
  alesya: { skin: "#f6d5bd", hair: "#9333ea", style: "long", shirt: "#111827", glasses: true, female: true },
  zubr: { skin: "#e9b48e", hair: "#78350f", style: "short", shirt: "#1e293b", beard: true },
  stalnaya: { skin: "#f5d0b5", hair: "#facc15", style: "bun", shirt: "#1e3a8a", female: true, boards: { stars: 3, big: true, color: "#1e3a8a" } },
  babushka: { skin: "#f1c7a5", hair: "#dc2626", style: "bun", shirt: "#15803d", glasses: true, female: true },
  aist: { skin: "#1f2937", hair: "#000000", style: "cap", shirt: "#0b0b0b" },
  edik: { skin: "#eebf9c", hair: "#111827", style: "short", shirt: "#7c3aed", mustache: true, tie: "#facc15" },
  kirill: { skin: "#f0c8a6", hair: "#78350f", style: "bun", shirt: "#0d9488" },
};

function ImgPortrait({ id, src, alt, className, mood }: { id: string; src: string; alt: string; className?: string; mood?: "neutral" | "happy" | "shock" }) {
  // цепочка: файл из public → встроенная копия → SVG-персонаж
  const [cur, setCur] = useState(asset(src));
  const [failed, setFailed] = useState(false);
  const fb = FALLBACK[id];
  const onError = () => {
    if (cur.startsWith("data:")) return setFailed(true);
    import("@/game/embeddedArt")
      .then((m) => (m.ART[src] ? setCur(m.ART[src]) : setFailed(true)))
      .catch(() => setFailed(true));
  };
  if (failed && fb) return <Toon className={className} {...fb} mood={mood} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={cur} alt={alt} onError={onError} className={`${className ?? ""} object-contain object-bottom`} draggable={false} />;
}

export function Portrait({ id, s, className, mood }: { id: string; s: GameState; className?: string; mood?: "neutral" | "happy" | "shock" }) {
  if (id === "player") return <PlayerToon s={s} className={className} mood={mood} />;
  const c = CHARACTERS[id];
  if (!c) return null;
  if (c.img) return <ImgPortrait id={id} src={c.img} alt={c.name} className={className} mood={mood} />;
  if (c.face) return <Toon className={className} {...c.face} mood={mood} />;
  return null;
}
