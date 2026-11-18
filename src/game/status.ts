import type { GameCase, GameState } from "./types";
import { RANKS, REGION_RANK, rankOf } from "./data";
import { ALL_CASES } from "./incidents";
import { CITIES } from "./mapData";

export function caseStatus(c: GameCase, s: GameState) {
  const r = rankOf(s.xp);
  const city = CITIES.find((x) => x.id === c.city)!;
  const needRank = Math.max(c.minRank, c.side ? 0 : REGION_RANK[city.region]);
  const missing = c.requires.filter((id) => !s.completed[id]);
  if (r < needRank) return { ok: false, reason: `Нужно звание: ${RANKS[needRank].short}` };
  if (missing.length) return { ok: false, reason: `Сначала: ${missing.map((m) => "«" + ALL_CASES.find((x) => x.id === m)?.title + "»").join(", ")}` };
  return { ok: true, reason: "" };
}
