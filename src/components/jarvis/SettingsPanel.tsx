import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Volume2, VolumeX, Mic, RotateCcw, Plus, Trash2, Play } from "lucide-react";
import {
  getJarvisSettings,
  resetJarvisSettings,
  setJarvisSettings,
  useJarvisSettings,
  useVoices,
} from "@/lib/jarvis-settings";
import { cancelSpeak, speak } from "@/lib/speech";

interface Props { open: boolean; onClose: () => void; }

export function SettingsPanel({ open, onClose }: Props) {
  const cfg = useJarvisSettings();
  const voices = useVoices();
  const [newPhrase, setNewPhrase] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const otherVoices = voices.filter((v) => !v.lang.toLowerCase().startsWith("en"));

  const addPhrase = () => {
    const p = newPhrase.trim().toLowerCase();
    if (!p) return;
    if (cfg.wakePhrases.includes(p)) { setNewPhrase(""); return; }
    setJarvisSettings({ wakePhrases: [...cfg.wakePhrases, p] });
    setNewPhrase("");
  };

  const previewVoice = () => {
    cancelSpeak();
    // ensure latest settings used
    setTimeout(() => speak("Voice diagnostic online. Standing by for your command, sir."), 30);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-cyan/40 bg-background/95 backdrop-blur-xl shadow-[0_0_60px_oklch(0.65_0.2_220_/_0.4)]"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="scan-lines pointer-events-none absolute inset-0 opacity-40" />
            <header className="relative flex items-center justify-between border-b border-cyan/30 px-5 py-3">
              <div>
                <div className="font-display text-[10px] tracking-[0.4em] text-muted-foreground">// CONFIG</div>
                <h2 className="font-display text-sm tracking-[0.3em] text-cyan neon-text">VOICE &amp; WAKE</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-md border border-border/60 p-1.5 text-muted-foreground hover:border-danger/50 hover:text-danger"
                aria-label="Close settings"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="relative flex-1 space-y-6 overflow-y-auto p-5 text-sm">
              {/* TTS toggle */}
              <section className="space-y-3">
                <SectionTitle>SPEECH SYNTHESIS</SectionTitle>
                <button
                  onClick={() => { if (cfg.ttsEnabled) cancelSpeak(); setJarvisSettings({ ttsEnabled: !cfg.ttsEnabled }); }}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 transition ${
                    cfg.ttsEnabled ? "border-neon/50 bg-neon/5 text-neon" : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2 font-display tracking-[0.2em] text-xs">
                    {cfg.ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    TTS {cfg.ttsEnabled ? "ENABLED" : "MUTED"}
                  </span>
                  <span className={`h-2 w-2 rounded-full ${cfg.ttsEnabled ? "bg-neon animate-pulse shadow-[0_0_8px_var(--color-neon)]" : "bg-muted-foreground/40"}`} />
                </button>

                {/* Voice */}
                <label className="block">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-display tracking-[0.3em] text-muted-foreground">
                    <span>VOICE</span>
                    <button onClick={previewVoice} className="flex items-center gap-1 text-cyan hover:underline">
                      <Play className="h-3 w-3" /> PREVIEW
                    </button>
                  </div>
                  <select
                    value={cfg.voiceURI ?? ""}
                    onChange={(e) => setJarvisSettings({ voiceURI: e.target.value || null })}
                    className="w-full rounded-md border border-border bg-background/80 px-2 py-2 font-mono text-xs text-foreground outline-none focus:border-cyan"
                  >
                    <option value="">Auto (JARVIS-like)</option>
                    {englishVoices.length > 0 && (
                      <optgroup label="English">
                        {englishVoices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>{v.name} — {v.lang}</option>
                        ))}
                      </optgroup>
                    )}
                    {otherVoices.length > 0 && (
                      <optgroup label="Other">
                        {otherVoices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>{v.name} — {v.lang}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </label>

                <Slider label="RATE"   min={0.5} max={2}   step={0.05} value={cfg.rate}   onChange={(v) => setJarvisSettings({ rate: v })} />
                <Slider label="PITCH"  min={0}   max={2}   step={0.05} value={cfg.pitch}  onChange={(v) => setJarvisSettings({ pitch: v })} />
                <Slider label="VOLUME" min={0}   max={1}   step={0.05} value={cfg.volume} onChange={(v) => setJarvisSettings({ volume: v })} />
              </section>

              {/* Wake settings */}
              <section className="space-y-3">
                <SectionTitle>WAKE WORD</SectionTitle>

                <div>
                  <div className="mb-1.5 font-display text-[10px] tracking-[0.3em] text-muted-foreground">PHRASES</div>
                  <div className="space-y-1.5">
                    {cfg.wakePhrases.map((p) => (
                      <div key={p} className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-1.5">
                        <span className="flex items-center gap-2 font-mono text-xs">
                          <Mic className="h-3 w-3 text-cyan" /> {p}
                        </span>
                        <button
                          onClick={() => setJarvisSettings({ wakePhrases: cfg.wakePhrases.filter((x) => x !== p) })}
                          className="text-muted-foreground hover:text-danger"
                          aria-label={`Remove ${p}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); addPhrase(); }} className="mt-2 flex gap-2">
                    <input
                      value={newPhrase}
                      onChange={(e) => setNewPhrase(e.target.value)}
                      placeholder="add phrase (e.g. friday)"
                      className="flex-1 rounded-md border border-border bg-background/80 px-2 py-1.5 font-mono text-xs outline-none focus:border-cyan"
                    />
                    <button type="submit" className="rounded-md border border-cyan/40 bg-cyan/10 px-2.5 text-cyan hover:bg-cyan/20">
                      <Plus className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                <Slider
                  label="SENSITIVITY"
                  min={1} max={5} step={1} value={cfg.sensitivity}
                  onChange={(v) => setJarvisSettings({ sensitivity: v })}
                  format={(v) => (["STRICT", "NORMAL", "RELAXED", "FUZZY", "PARANOID"][Math.round(v) - 1] ?? String(v))}
                  hint="Lower = fewer false activations"
                />
                <Slider
                  label="COOLDOWN"
                  min={500} max={8000} step={250} value={cfg.cooldownMs}
                  onChange={(v) => setJarvisSettings({ cooldownMs: v })}
                  format={(v) => `${(v / 1000).toFixed(2)}s`}
                  hint="Min delay between wake triggers"
                />
                <Slider
                  label="COMMAND TIMEOUT"
                  min={2000} max={15000} step={500} value={cfg.commandTimeoutMs}
                  onChange={(v) => setJarvisSettings({ commandTimeoutMs: v })}
                  format={(v) => `${(v / 1000).toFixed(1)}s`}
                  hint="Auto-stop mic after silence"
                />
              </section>

              <button
                onClick={resetJarvisSettings}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border/60 px-3 py-2 text-xs text-muted-foreground transition hover:border-danger/60 hover:text-danger"
              >
                <RotateCcw className="h-3.5 w-3.5" /> RESET TO DEFAULTS
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-[11px] tracking-[0.3em] text-cyan neon-text">// {children}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-cyan/40 to-transparent" />
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange, format, hint }: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; format?: (v: number) => string; hint?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-display tracking-[0.3em]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-cyan">{format ? format(value) : value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="jarvis-range w-full"
      />
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground/70">{hint}</div>}
    </div>
  );
}

// Helper utility: call from anywhere to read settings imperatively.
export { getJarvisSettings };
