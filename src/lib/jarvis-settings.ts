// Persistent JARVIS settings (voice + wake-word) with a tiny subscribable store.
import { useEffect, useSyncExternalStore } from "react";

export interface JarvisSettings {
  ttsEnabled: boolean;
  voiceURI: string | null; // null = auto pick
  rate: number;            // 0.5 - 2
  pitch: number;           // 0 - 2
  volume: number;          // 0 - 1
  wakePhrases: string[];   // lower-case phrases
  sensitivity: number;     // 1 (strict) - 5 (loose fuzzy)
  cooldownMs: number;      // min ms between wake triggers
  commandTimeoutMs: number;// auto-stop command mic after silence
}

const KEY = "jarvis.settings.v1";

const defaults: JarvisSettings = {
  ttsEnabled: true,
  voiceURI: null,
  rate: 1.0,
  pitch: 0.85,
  volume: 1,
  wakePhrases: ["jarvis", "hey jarvis", "ok jarvis"],
  sensitivity: 2,
  cooldownMs: 2500,
  commandTimeoutMs: 6000,
};

function read(): JarvisSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

let state: JarvisSettings = read();
const listeners = new Set<() => void>();

export function getJarvisSettings(): JarvisSettings {
  return state;
}

export function setJarvisSettings(patch: Partial<JarvisSettings>) {
  state = { ...state, ...patch };
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* noop */ }
  listeners.forEach((l) => l());
}

export function resetJarvisSettings() {
  state = { ...defaults };
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* noop */ }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function useJarvisSettings() {
  return useSyncExternalStore(subscribe, () => state, () => defaults);
}

// Fuzzy wake match. sensitivity:
//   1 = exact word boundary, 2 = contains, 3+ = allow one-char typos / split chars
export function matchesWake(transcript: string, phrases: string[], sensitivity: number): boolean {
  const t = transcript.toLowerCase().trim();
  if (!t) return false;
  for (const raw of phrases) {
    const p = raw.toLowerCase().trim();
    if (!p) continue;
    if (sensitivity <= 1) {
      if (new RegExp(`\\b${p.replace(/\s+/g, "\\s+")}\\b`, "i").test(t)) return true;
    } else if (sensitivity === 2) {
      if (t.includes(p)) return true;
      // tolerate spacing inside the word ("jar vis")
      if (t.replace(/\s+/g, "").includes(p.replace(/\s+/g, ""))) return true;
    } else {
      // looser: allow up to (sensitivity-2) char edits
      const flat = t.replace(/[^a-z]/g, "");
      const pf = p.replace(/[^a-z]/g, "");
      if (flat.includes(pf)) return true;
      if (levenshtein(flat.slice(0, pf.length + 2), pf) <= sensitivity - 2) return true;
    }
  }
  return false;
}

function levenshtein(a: string, b: string): number {
  if (!a) return b.length; if (!b) return a.length;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    dp[i][j] = a[i - 1] === b[j - 1]
      ? dp[i - 1][j - 1]
      : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  }
  return dp[a.length][b.length];
}

// React helper for getting available voices (re-renders when populated).
export function useVoices(): SpeechSynthesisVoice[] {
  const get = () => (typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
  const sub = (cb: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return () => { /* noop */ };
    const handler = () => cb();
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handler);
  };
  const voices = useSyncExternalStore(sub, get, () => []);
  // kick a get on mount in case voices populate before mount
  useEffect(() => { get(); }, []);
  return voices;
}
