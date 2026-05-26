// Browser Web Speech API helpers (TTS + STT)
import { getJarvisSettings } from "./jarvis-settings";

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

function resolveVoice(uri: string | null): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  if (uri) {
    const v = voices.find((v) => v.voiceURI === uri);
    if (v) return v;
  }
  return (
    voices.find((v) => /Google UK English Male/i.test(v.name)) ||
    voices.find((v) => /Daniel/i.test(v.name) && v.lang.startsWith("en")) ||
    voices.find((v) => /Microsoft.*(Guy|Ryan|George)/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith("en-GB")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0]
  );
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}) {
  const cfg = getJarvisSettings();
  if (!cfg.ttsEnabled || typeof window === "undefined" || !window.speechSynthesis) {
    opts.onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = resolveVoice(cfg.voiceURI);
    if (v) u.voice = v;
    u.rate = cfg.rate;
    u.pitch = cfg.pitch;
    u.volume = cfg.volume;
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
