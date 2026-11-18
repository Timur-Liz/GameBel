"use client";
import { tone, isMuted } from "./sound";
import { CHARACTERS } from "./data";

export type VoiceMode = "babble" | "tts" | "off";
const KEY = "cybershield_voice_mode";
let mode: VoiceMode | null = null;
const listeners = new Set<(m: VoiceMode) => void>();

export function getVoiceMode(): VoiceMode {
  if (mode) return mode;
  if (typeof window === "undefined") return "babble";
  const v = localStorage.getItem(KEY) as VoiceMode | null;
  mode = v === "tts" || v === "off" || v === "babble" ? v : "babble";
  return mode;
}

export function setVoiceMode(m: VoiceMode) {
  mode = m;
  try {
    localStorage.setItem(KEY, m);
  } catch {
    /* ignore */
  }
  if (m !== "tts") stopSpeak();
  listeners.forEach((l) => l(m));
}

export function onVoiceMode(fn: (m: VoiceMode) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

interface Profile {
  pitch: number;
  rate: number;
  base: number; // базовая частота «бормотания»
  female: boolean;
}

const PROFILES: Record<string, Partial<Profile>> = {
  kravets: { pitch: 0.55, rate: 0.92, base: 150, female: false },
  alesya: { pitch: 1.35, rate: 1.12, base: 520, female: true },
  zubr: { pitch: 0.35, rate: 0.95, base: 110, female: false },
  stalnaya: { pitch: 0.85, rate: 0.95, base: 330, female: true },
  babushka: { pitch: 1.5, rate: 0.82, base: 600, female: true },
  aist: { pitch: 0.2, rate: 0.85, base: 90, female: false },
  edik: { pitch: 0.9, rate: 1.15, base: 220, female: false },
  kirill: { pitch: 1.05, rate: 1.25, base: 260, female: false },
  vitaly: { pitch: 0.6, rate: 1.05, base: 160, female: false },
  maxim: { pitch: 0.8, rate: 0.95, base: 200, female: false },
  player: { pitch: 1, rate: 1.05, base: 300 },
  narrator: { pitch: 0.9, rate: 1, base: 240, female: false },
  male: { pitch: 0.75, rate: 1.05, base: 180, female: false },
  female: { pitch: 1.25, rate: 1.05, base: 460, female: true },
};

export function profileOf(who: string, playerFemale = false): Profile {
  const p = PROFILES[who];
  const c = CHARACTERS[who];
  const female = p?.female ?? (who === "player" ? playerFemale : !!c?.face?.female);
  return {
    pitch: p?.pitch ?? (female ? 1.25 : 0.85),
    rate: p?.rate ?? 1.05,
    base: p?.base ?? (female ? 440 : 190),
    female,
  };
}

/** «Бормотание» как в Animal Crossing — короткий тон на каждую букву */
export function babble(who: string, ch: string, playerFemale = false) {
  if (getVoiceMode() !== "babble" || isMuted()) return;
  if (!/[a-zа-яё0-9]/i.test(ch)) return;
  const p = profileOf(who, playerFemale);
  const code = ch.toLowerCase().charCodeAt(0);
  const vowel = /[аеёиоуыэюяaeiou]/i.test(ch);
  const f = p.base * (1 + ((code % 7) - 3) * 0.06) * (vowel ? 1.15 : 1);
  tone(f, 0.045, vowel ? "triangle" : "square", 0.022);
}

function pickVoice(female: boolean): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ru"));
  if (!all.length) return null;
  const femaleRe = /(female|milena|irina|svetlana|alena|elena|anna|ekaterina|daria|dariya|tatyana|katya|полина|алёна)/i;
  const maleRe = /(male|pavel|yuri|dmitr|maxim|ivan|nikolai|aleksandr|artem)/i;
  const want = all.find((v) => (female ? femaleRe.test(v.name) && !/\bmale\b/i.test(v.name) : maleRe.test(v.name) && !/female/i.test(v.name)));
  return want ?? all[0];
}

function clean(text: string) {
  return text
    .replace(/\([^)]*\)/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[«»<>!\-—]{2,}/g, " ")
    .trim();
}

export function speak(text: string, who: string, playerFemale = false) {
  if (getVoiceMode() !== "tts" || isMuted() || !ttsSupported()) return;
  const t = clean(text);
  if (!t) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(t);
  const p = profileOf(who, playerFemale);
  u.lang = "ru-RU";
  const v = pickVoice(p.female);
  if (v) u.voice = v;
  u.pitch = Math.max(0, Math.min(2, p.pitch));
  u.rate = p.rate;
  u.volume = 1;
  synth.speak(u);
}

export function stopSpeak() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/** Проговорить фразу «бормотанием» (без печати текста) */
export function babbleText(text: string, who: string, playerFemale = false) {
  if (getVoiceMode() !== "babble") return;
  const chars = text.slice(0, 70).split("");
  chars.forEach((ch, i) => setTimeout(() => babble(who, ch, playerFemale), i * 38));
}
