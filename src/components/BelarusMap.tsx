"use client";
import { useState } from "react";
import { CITIES, MAP_H, MAP_W, REGIONS, project, type RegionId } from "@/game/mapData";

export const REGION_COLORS: Record<RegionId, string> = {
  vitebsk: "#b9a4fb",
  minsk_obl: "#f9b4d6",
  minsk: "#f472b6",
  grodno: "#fdc08a",
  brest: "#c5ec7a",
  gomel: "#fde58a",
  mogilev: "#fcaaa5",
};

const RIVERS: [number, number][][] = [
  [[30.9, 54.75], [30.45, 54.3], [30.33, 53.9], [30.1, 53.35], [30.2, 52.8], [30.55, 52.2], [30.6, 51.75], [30.55, 51.25]],
  [[27.3, 53.65], [26.6, 53.35], [25.9, 53.75], [25.1, 53.95], [24.25, 53.8], [23.85, 53.65], [24.2, 54.05], [24.0, 54.25]],
  [[31.2, 55.25], [30.2, 55.2], [29.4, 55.4], [28.75, 55.5], [28.0, 55.6], [27.3, 55.8], [26.6, 55.7]],
  [[24.0, 51.85], [25.2, 51.95], [26.1, 52.1], [27.1, 52.15], [28.2, 52.1], [29.2, 52.0], [29.8, 51.65], [30.2, 51.3]],
  [[28.55, 54.85], [28.5, 54.25], [28.9, 53.6], [29.2, 53.15], [29.6, 52.6], [30.0, 52.3]],
];

const DECOR: { lon: number; lat: number; icon: string; label?: string; size?: number }[] = [
  { lon: 23.95, lat: 52.65, icon: "🦬", label: "Беловежская пуща", size: 30 },
  { lon: 24.25, lat: 52.45, icon: "🌲", size: 22 },
  { lon: 23.7, lat: 52.85, icon: "🌲", size: 22 },
  { lon: 26.75, lat: 54.85, icon: "💧", label: "оз. Нарочь", size: 22 },
  { lon: 26.47, lat: 53.45, icon: "🏰", label: "Мир", size: 22 },
  { lon: 28.4, lat: 54.7, icon: "🦌", label: "Березинский", size: 22 },
  { lon: 27.6, lat: 52.2, icon: "🌲", size: 20 },
  { lon: 28.6, lat: 52.3, icon: "🌳", size: 20 },
  { lon: 25.0, lat: 52.0, icon: "🪿", size: 20 },
  { lon: 31.3, lat: 52.0, icon: "🌻", size: 20 },
  { lon: 29.5, lat: 54.8, icon: "🌲", size: 20 },
  { lon: 27.2, lat: 55.4, icon: "🌲", size: 20 },
  { lon: 25.5, lat: 54.5, icon: "🐄", size: 20 },
  { lon: 31.6, lat: 53.6, icon: "🥔", size: 20 },
  { lon: 26.4, lat: 53.95, icon: "🌾", size: 20 },
];

function riverPath(pts: [number, number][]) {
  const p = pts.map(([lo, la]) => project(lo, la));
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    d += ` Q${x0 + (x1 - x0) * 0.5 + (y1 - y0) * 0.15},${y0 + (y1 - y0) * 0.5 - (x1 - x0) * 0.15} ${x1},${y1}`;
  }
  return d;
}

// визуальный сдвиг пинов для очень близких городов
const PIN_SHIFT: Record<string, [number, number]> = {
  polotsk: [16, 10],
  novopolotsk: [-22, -6],
};

export interface CityMarker {
  icon: string;
  color: string;
  label?: string;
  count?: number;
  done?: boolean;
}

interface Props {
  locked?: Set<RegionId>;
  markers?: Record<string, CityMarker>;
  incidents?: { key: string; city: string; onClick: () => void }[];
  onCity?: (id: string) => void;
  selected?: string | null;
  showAllCities?: boolean;
  wrongCity?: string | null;
  className?: string;
}

export function BelarusMap({ locked, markers = {}, incidents = [], onCity, selected, showAllCities, wrongCity, className }: Props) {
  const [hover, setHover] = useState<RegionId | null>(null);
  const allPaths = REGIONS.filter((r) => r.id !== "minsk").map((r) => r.path).join(" ");
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="by-clip">
          <path d={allPaths} />
        </clipPath>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="#64748b" />
          <line x1="0" y1="0" x2="0" y2="14" stroke="#475569" strokeWidth="6" />
        </pattern>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="0" floodColor="#0f172a" floodOpacity="0.55" />
        </filter>
        <radialGradient id="glow">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* подложка-контур страны */}
      <path d={allPaths} fill="#0f172a" stroke="#0f172a" strokeWidth={16} strokeLinejoin="round" filter="url(#shadow)" />
      {REGIONS.map((r) => {
        const isLocked = locked?.has(r.id);
        return (
          <path
            key={r.id}
            d={r.path}
            fillRule="evenodd"
            fill={isLocked ? "url(#hatch)" : REGION_COLORS[r.id]}
            stroke="#1e1b2e"
            strokeWidth={r.id === "minsk" ? 2.5 : 4}
            strokeLinejoin="round"
            className="transition-[filter] duration-200"
            style={{ filter: hover === r.id && !isLocked ? "brightness(1.12) saturate(1.2)" : undefined }}
            onMouseEnter={() => setHover(r.id)}
            onMouseLeave={() => setHover(null)}
          />
        );
      })}
      {/* реки */}
      <g clipPath="url(#by-clip)" pointerEvents="none">
        {RIVERS.map((r, i) => (
          <g key={i}>
            <path d={riverPath(r)} fill="none" stroke="#1e3a8a" strokeWidth={8} strokeLinecap="round" opacity={0.35} />
            <path d={riverPath(r)} fill="none" stroke="#60a5fa" strokeWidth={4.5} strokeLinecap="round" />
          </g>
        ))}
      </g>
      {/* декор */}
      <g pointerEvents="none">
        {DECOR.map((d, i) => {
          const [x, y] = project(d.lon, d.lat);
          return (
            <g key={i} opacity={0.95}>
              <text x={x} y={y} fontSize={d.size ?? 20} textAnchor="middle" dominantBaseline="middle">{d.icon}</text>
              {d.label && (
                <text x={x} y={y + (d.size ?? 20) * 0.9} fontSize={11} textAnchor="middle" className="map-label-sm">{d.label}</text>
              )}
            </g>
          );
        })}
      </g>
      {/* названия областей */}
      <g pointerEvents="none">
        {REGIONS.filter((r) => r.id !== "minsk").map((r) => {
          const isLocked = locked?.has(r.id);
          const dy = r.id === "minsk_obl" ? 70 : 0;
          return (
            <g key={r.id}>
              <text x={r.cx} y={r.cy + dy} textAnchor="middle" className="map-label">{r.name.toUpperCase()}</text>
              {isLocked && (
                <text x={r.cx} y={r.cy + dy + 34} textAnchor="middle" fontSize={28}>🔒</text>
              )}
            </g>
          );
        })}
      </g>
      {/* города */}
      {CITIES.map((c) => {
        const m = markers[c.id];
        const isLocked = locked?.has(c.region);
        if (!m && !showAllCities) {
          return (
            <g key={c.id} pointerEvents="none" opacity={0.75}>
              <circle cx={c.x} cy={c.y} r={4} fill="#fff" stroke="#1e1b2e" strokeWidth={2} />
              <text x={c.x + 7} y={c.y + 4} fontSize={11} className="map-label-sm" textAnchor="start">{c.name}</text>
            </g>
          );
        }
        const isSel = selected === c.id;
        const wrong = wrongCity === c.id;
        const [sx, sy] = PIN_SHIFT[c.id] ?? [0, 0];
        return (
          <g
            key={c.id}
            className={onCity ? "cursor-pointer" : ""}
            onClick={() => onCity?.(c.id)}
            transform={sx || sy ? `translate(${sx} ${sy})` : undefined}
          >
            {isSel && <circle cx={c.x} cy={c.y} r={40} fill="url(#glow)" />}
            {m ? (
              <g className={isLocked ? "" : "pin-bob"} style={{ transformOrigin: `${c.x}px ${c.y}px` }}>
                <path d={`M${c.x} ${c.y} l-16 -26 a19 19 0 1 1 32 0 z`} fill={isLocked ? "#94a3b8" : m.color} stroke="#1e1b2e" strokeWidth={3.5} />
                <text x={c.x} y={c.y - 36} textAnchor="middle" dominantBaseline="middle" fontSize={18}>{isLocked ? "🔒" : m.icon}</text>
                {m.count && m.count > 1 ? (
                  <g>
                    <circle cx={c.x + 16} cy={c.y - 50} r={10} fill="#ef4444" stroke="#1e1b2e" strokeWidth={2.5} />
                    <text x={c.x + 16} y={c.y - 46} textAnchor="middle" fontSize={12} fontWeight={900} fill="#fff">{m.count}</text>
                  </g>
                ) : null}
                {m.done && <text x={c.x - 18} y={c.y - 46} fontSize={14}>✅</text>}
              </g>
            ) : (
              <circle cx={c.x} cy={c.y} r={wrong ? 12 : 8} fill={wrong ? "#ef4444" : isSel ? "#22c55e" : "#fff"} stroke="#1e1b2e" strokeWidth={3} className={wrong ? "shake" : ""} />
            )}
            <text x={c.x} y={c.y + 20} textAnchor="middle" className="map-city">{c.name}</text>
          </g>
        );
      })}
      {/* вызовы дежурной части */}
      {incidents.map((inc) => {
        const c = CITIES.find((x) => x.id === inc.city);
        if (!c) return null;
        return (
          <g key={inc.key} className="cursor-pointer" onClick={inc.onClick}>
            <circle cx={c.x + 22} cy={c.y + 4} r={14} fill="#ef4444" opacity={0.5} className="ping" style={{ transformOrigin: `${c.x + 22}px ${c.y + 4}px` }} />
            <circle cx={c.x + 22} cy={c.y + 4} r={13} fill="#ef4444" stroke="#1e1b2e" strokeWidth={3} />
            <text x={c.x + 22} y={c.y + 9} textAnchor="middle" fontSize={15} fontWeight={900} fill="#fff">!</text>
          </g>
        );
      })}
    </svg>
  );
}
