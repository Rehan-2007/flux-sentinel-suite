// Browser Web Speech API helpers (TTS + STT)
// All client-side, no API keys required.

type AnyWindow = typeof window & {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
};

export function getSpeechRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const w = window as AnyWindow;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as AnyWindow;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

// Lazily pick a "JARVIS-like" voice: prefer English male voices.
let cachedVoice: SpeechSynthesisVoice | null = null;
function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred =
    voices.find((v) => /Google UK English Male/i.test(v.name)) ||
    voices.find((v) => /Daniel/i.test(v.name) && v.lang.startsWith("en")) ||
    voices.find((v) => /Microsoft.*(Guy|Ryan|George)/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith("en-GB")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0];
  cachedVoice = preferred;
  return preferred;
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    opts.onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 1.0;
    u.pitch = 0.85;
    u.volume = 1;
    u.onstart = () => opts.onStart?.();
    u.onend = () => opts.onEnd?.();
    u.onerror = () => opts.onEnd?.();
    window.speechSynthesis.speak(u);
  } catch {
    opts.onEnd?.();
  }
}

export function cancelSpeak() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Warm voices list (some browsers populate async)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}
