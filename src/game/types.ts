export type BgId =
  | "office"
  | "interrogation"
  | "apartment"
  | "street"
  | "factory"
  | "cafe"
  | "basement"
  | "night"
  | "school"
  | "server";

export interface Line {
  who: string; // id персонажа или "player" / "narrator"
  text: string;
  caption?: string; // большая надпись в стиле «АНЯ ОБОРАЧИВАЕТСЯ»
}

export interface DialogueStep {
  type: "dialogue";
  bg?: BgId;
  lines: Line[];
}

export interface ChoiceStep {
  type: "choice";
  bg?: BgId;
  who: string;
  question: string;
  options: { text: string; correct: boolean; feedback: string }[];
  hint?: string;
}

export interface HotspotStep {
  type: "hotspot";
  title: string;
  intro: string;
  frame: "sms" | "email" | "site" | "chat";
  meta: { from?: string; subject?: string; url?: string };
  parts: { t: string; flag?: string }[];
  hint?: string;
}

export interface SortStep {
  type: "sort";
  title: string;
  intro: string;
  bins: [string, string];
  items: { text: string; bin: 0 | 1; why: string }[];
  hint?: string;
}

export interface PasswordStep {
  type: "password";
  title: string;
  intro: string;
  banned: string[];
  minLen: number;
  hint?: string;
}

export interface TerminalStep {
  type: "terminal";
  title: string;
  intro: string;
  tasks: { goal: string; cmd: string; output: string[] }[];
  hint?: string;
}

export interface LogsStep {
  type: "logs";
  title: string;
  intro: string;
  lines: string[];
  bad: number[];
  explain: string;
  hint?: string;
}

export interface OrderStep {
  type: "order";
  title: string;
  intro: string;
  items: string[]; // в правильном порядке
  hint?: string;
}

export interface Evidence {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export interface InterrogationStep {
  type: "interrogation";
  suspect: string;
  title: string;
  intro: string;
  evidence: Evidence[];
  rounds: {
    statements: { text: string; press: string }[];
    answer: { s: number; e: string };
    breakText: string;
  }[];
  confession: string;
  hint?: string;
}

export interface InputStep {
  type: "input";
  title: string;
  intro: string;
  puzzle: string;
  question: string;
  answers: string[];
  helper?: string;
  hint?: string;
}

export interface SelectStep {
  type: "select";
  title: string;
  intro: string;
  items: { label: string; icon: string; ok: boolean; why?: string }[];
  hint?: string;
}

export interface MapPickStep {
  type: "mappick";
  title: string;
  intro: string;
  clues: string[];
  answer: string;
  hint?: string;
}

export interface CallLine {
  text: string;
  flag?: string; // красный флаг, который раскрывается этой репликой
  options: { t: string; leak?: string; reply?: string }[];
}

export interface CallScript {
  id: string;
  caller: string;
  number: string;
  voice: string; // id персонажа для голоса или "male"/"female"
  legit: boolean;
  lines: CallLine[];
  outro: string;
}

export interface CallStep {
  type: "call";
  title: string;
  intro: string;
  script: CallScript;
  hint?: string;
}

export type Step =
  | DialogueStep
  | ChoiceStep
  | HotspotStep
  | SortStep
  | PasswordStep
  | TerminalStep
  | LogsStep
  | OrderStep
  | InterrogationStep
  | InputStep
  | SelectStep
  | MapPickStep
  | CallStep;

export interface GameCase {
  id: string;
  city: string; // id города из mapData
  title: string;
  tagline: string;
  icon: string;
  minRank: number;
  requires: string[];
  xp: number;
  money: number;
  article: string;
  lessons: string[];
  unlocks: string[]; // персонажи для досье
  steps: Step[];
  final?: boolean;
  side?: { giver: string; teaser: string };
}

export interface CaseResult {
  stars: number;
  best: number;
}

export interface GameState {
  v: 1;
  id: string;
  name: string;
  gender: "m" | "f";
  xp: number;
  money: number;
  day: number;
  completed: Record<string, CaseResult>;
  owned: string[];
  uniform: string;
  stats: { cases: number; incidents: number; mistakes: number; earned: number; protectedPeople: number; callsWon?: number; callsPlayed?: number };
  lastPayday: number;
  seenRank: number;
  introDone: boolean;
  lessons: string[];
  dossier: string[];
  achievements?: string[];
  classCode?: string | null;
  className?: string | null;
}
