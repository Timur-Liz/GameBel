"use client";

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}
export function isMuted() {
  return muted;
}

export function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.05, delay = 0) {
  if (muted || typeof window === "undefined") return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime + delay;
    o.start(t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.stop(t + dur + 0.02);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  click: () => tone(660, 0.05, "square", 0.03),
  type: () => tone(1200 + Math.random() * 300, 0.015, "square", 0.012),
  ok: () => {
    tone(660, 0.1, "triangle", 0.08);
    tone(990, 0.15, "triangle", 0.08, 0.1);
  },
  bad: () => {
    tone(200, 0.2, "sawtooth", 0.06);
    tone(150, 0.25, "sawtooth", 0.06, 0.15);
  },
  coin: () => {
    tone(988, 0.08, "square", 0.05);
    tone(1319, 0.2, "square", 0.05, 0.08);
  },
  fanfare: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, "triangle", 0.08, i * 0.14));
  },
  objection: () => {
    tone(300, 0.08, "sawtooth", 0.08);
    tone(600, 0.3, "sawtooth", 0.08, 0.08);
  },
  boot: () => {
    [262, 330, 392, 523, 659].forEach((f, i) => tone(f, 0.3, "sine", 0.06, i * 0.12));
  },
  notify: () => {
    tone(880, 0.08, "sine", 0.05);
    tone(1175, 0.12, "sine", 0.05, 0.09);
  },
};
