import type { GameState } from "./types";
import { rankOf, SHOP, UNIFORMS } from "./data";
import { CASES, SIDE_CASES } from "./incidents";
import { IS_STATIC } from "@/lib/paths";

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  desc: string;
  reward: number;
  check: (s: GameState) => boolean;
}

const mainDone = (s: GameState) => CASES.filter((c) => s.completed[c.id]).length;
const threeStars = (s: GameState) => Object.values(s.completed).filter((r) => r.stars >= 3).length;

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: "first_case", name: "Первое дело", icon: "🔰", desc: "Раскрыть первое дело", reward: 50, check: (s) => mainDone(s) >= 1 },
  { id: "five_cases", name: "Опытный опер", icon: "🕵️", desc: "Раскрыть 5 дел", reward: 100, check: (s) => mainDone(s) >= 5 },
  { id: "ten_cases", name: "Гроза мошенников", icon: "⚡", desc: "Раскрыть 10 дел", reward: 200, check: (s) => mainDone(s) >= 10 },
  { id: "all_cases", name: "Все дела раскрыты", icon: "🗂️", desc: "Раскрыть все основные дела", reward: 500, check: (s) => mainDone(s) >= CASES.length },
  { id: "perfect", name: "Без единой ошибки", icon: "💯", desc: "Пройти дело со 100% точностью", reward: 100, check: (s) => Object.values(s.completed).some((r) => r.best >= 0.999) },
  { id: "perfect5", name: "Перфекционист", icon: "⭐", desc: "Получить 3 звезды в 5 делах", reward: 200, check: (s) => threeStars(s) >= 5 },
  { id: "traveler", name: "Путешественник", icon: "🧭", desc: "Раскрыть дела в 10 разных городах", reward: 200, check: (s) => new Set(CASES.filter((c) => s.completed[c.id]).map((c) => c.city)).size >= 10 },
  { id: "inc10", name: "Дежурный", icon: "🚨", desc: "Принять 10 вызовов 102", reward: 80, check: (s) => s.stats.incidents >= 10 },
  { id: "inc50", name: "Голос 102", icon: "📟", desc: "Принять 50 вызовов 102", reward: 300, check: (s) => s.stats.incidents >= 50 },
  { id: "calls5", name: "Не на того напали", icon: "📵", desc: "Правильно разобраться в 5 звонках", reward: 150, check: (s) => (s.stats.callsWon ?? 0) >= 5 },
  { id: "protect100", name: "Защитник", icon: "🛡️", desc: "Защитить 100 граждан", reward: 80, check: (s) => s.stats.protectedPeople >= 100 },
  { id: "protect1000", name: "Щит Беларуси", icon: "🇧🇾", desc: "Защитить 1000 граждан", reward: 400, check: (s) => s.stats.protectedPeople >= 1000 },
  { id: "rich", name: "Первая тысяча", icon: "💰", desc: "Заработать 1000 BYN", reward: 50, check: (s) => s.stats.earned >= 1000 },
  { id: "shop5", name: "Уютный кабинет", icon: "🛋️", desc: "Купить 5 предметов в кабинет", reward: 100, check: (s) => SHOP.filter((i) => s.owned.includes(i.id)).length >= 5 },
  { id: "shopall", name: "Купил всё", icon: "🛍️", desc: "Купить все предметы для кабинета", reward: 500, check: (s) => SHOP.every((i) => s.owned.includes(i.id)) },
  { id: "fashion", name: "Модник", icon: "👔", desc: "Собрать 3 комплекта формы", reward: 100, check: (s) => 1 + UNIFORMS.filter((u) => s.owned.includes("u:" + u.id)).length >= 3 },
  { id: "captain", name: "Капитан!", icon: "🎖️", desc: "Получить звание капитана", reward: 150, check: (s) => rankOf(s.xp) >= 4 },
  { id: "colonel", name: "Полковник", icon: "🏅", desc: "Получить звание полковника", reward: 1000, check: (s) => rankOf(s.xp) >= 7 },
  { id: "nest", name: "Гнездо разорено", icon: "🦅", desc: "Завершить операцию «Гнездо»", reward: 300, check: (s) => !!s.completed["nest"] },
  { id: "sides", name: "Свой среди своих", icon: "🤝", desc: "Пройти все побочные истории", reward: 200, check: (s) => SIDE_CASES.every((c) => s.completed[c.id]) },
  { id: "class", name: "Командный игрок", icon: "🏫", desc: "Вступить в школьный класс", reward: 50, check: (s) => !!s.classCode },
];

// в статической версии нет школьных классов
export const ACHIEVEMENTS: Achievement[] = IS_STATIC ? ALL_ACHIEVEMENTS.filter((a) => a.id !== "class") : ALL_ACHIEVEMENTS;

export function newAchievements(s: GameState): Achievement[] {
  const have = new Set(s.achievements ?? []);
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.check(s));
}
