import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Particles } from "@/components/jarvis/Particles";
import { AIOrb } from "@/components/jarvis/AIOrb";
import { SystemPanel } from "@/components/jarvis/SystemPanel";
import { RightPanel } from "@/components/jarvis/RightPanel";
import { ChatTerminal } from "@/components/jarvis/ChatTerminal";
import { BootSequence } from "@/components/jarvis/BootSequence";
import { ActivationOverlay } from "@/components/jarvis/ActivationOverlay";
import { SettingsPanel } from "@/components/jarvis/SettingsPanel";
import { Settings, Power } from "lucide-react";
import { useJarvisSettings } from "@/lib/jarvis-settings";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "J.A.R.V.I.S — AI Operating System" },
      { name: "description", content: "A next-generation holographic AI assistant interface inspired by JARVIS." },
    ],
  }),
});

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Index() {
  const [booted, setBooted] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activated, setActivated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const cfg = useJarvisSettings();
  const now = useNow();

  // Keyboard shortcut: , opens settings
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") { e.preventDefault(); setSettingsOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleWake = () => {
    setActivated(true);
    setTimeout(() => setActivated(false), 2000);
  };

  const statusChunks: Array<[string, string, string]> = [
    ["JARVIS", "ONLINE", "neon"],
    ["CORE", "ONLINE", "neon"],
    ["AI", "claude-sonnet-4.5", "cyan"],
    ["VOICE", cfg.ttsEnabled ? "READY" : "MUTED", cfg.ttsEnabled ? "cyan" : "muted"],
    ["UPLINK", "SECURE", "neon"],
  ];

  const tickers = [
    ["ETH", "3553.82", "+0.2%"],
    ["SOL", "176.62", "+0.84%"],
    ["ADA", "0.49", "+1.03%"],
    ["STRK", "868.20", "+0.81%"],
    ["AAPL", "734.08", "+0.07%"],
    ["NVDA", "617.92", "+0.08%"],
    ["TSLA", "412.55", "-0.21%"],
    ["BTC", "94,210", "+0.42%"],
  ];

  return (
    <>
      {!booted && <BootSequence onDone={() => setBooted(true)} />}
      <div className="relative h-screen w-screen overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="scan-lines pointer-events-none absolute inset-0 z-10 opacity-50" />
        <Particles />

        {/* Top bar */}
        <header className="relative z-20 flex items-center justify-between gap-4 border-b border-border/60 px-5 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-4 overflow-x-auto">
            {statusChunks.map(([label, val, color]) => (
              <div key={label} className="flex items-center gap-2 whitespace-nowrap font-display text-[10px] tracking-[0.3em]">
                <span className={`h-1.5 w-1.5 rounded-full ${color === "neon" ? "bg-neon animate-pulse shadow-[0_0_8px_var(--color-neon)]" : color === "cyan" ? "bg-cyan animate-pulse shadow-[0_0_8px_var(--color-cyan)]" : "bg-muted-foreground/50"}`} />
                <span className="text-muted-foreground">{label}</span>
                <span className={color === "neon" ? "text-neon neon-text" : color === "cyan" ? "text-cyan neon-text" : "text-muted-foreground"}>{val}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 whitespace-nowrap text-[10px] tracking-[0.25em] text-muted-foreground">
            <div><span className="text-muted-foreground/70">LOCAL </span><span className="font-mono text-cyan">{now.toLocaleTimeString("en-GB")}</span></div>
            <div className="hidden md:block"><span className="text-muted-foreground/70">DATE </span><span className="font-mono text-foreground">{now.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span></div>
            <div className="hidden lg:block"><span className="text-muted-foreground/70">VER </span><span className="font-mono text-cyan">JARVIS OS v3.14.1</span></div>
            <button onClick={() => setSettingsOpen(true)} className="rounded-md border border-border/60 p-1.5 hover:border-cyan/60 hover:text-cyan" title="Settings (⌘/Ctrl + ,)">
              <Settings className="h-3.5 w-3.5" />
            </button>
            <button className="rounded-md border border-border/60 p-1.5 hover:border-danger/60 hover:text-danger" title="Power">
              <Power className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Main grid */}
        <main className="relative z-20 grid h-[calc(100vh-58px-32px)] grid-cols-12 gap-4 p-4">
          {/* Left */}
          <aside className="col-span-12 lg:col-span-3 overflow-y-auto">
            <SystemPanel />
          </aside>

          {/* Center */}
          <section className="col-span-12 lg:col-span-6 flex flex-col gap-4">
            <div className="glass corner-frame relative flex flex-1 items-center justify-center overflow-hidden rounded-lg">
              <div className="scan-lines absolute inset-0 pointer-events-none" />
              <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 800 600" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cw" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.85 0.18 200)" />
                    <stop offset="100%" stopColor="oklch(0.65 0.25 300)" />
                  </linearGradient>
                </defs>
                <path d="M0 80 H180 L220 120 H380" stroke="url(#cw)" strokeWidth="1" fill="none" />
                <path d="M800 520 H620 L580 480 H420" stroke="url(#cw)" strokeWidth="1" fill="none" />
                <path d="M0 540 H120 L160 500 H240 L280 540 H400" stroke="url(#cw)" strokeWidth="1" fill="none" />
                <path d="M800 60 H680 L640 100 H520" stroke="url(#cw)" strokeWidth="1" fill="none" />
              </svg>
              <div className="absolute top-3 left-3 font-display text-[10px] tracking-[0.3em] text-cyan neon-text">// CORE INTELLIGENCE</div>
              <div className="absolute top-3 right-3 font-display text-[10px] tracking-[0.3em] text-muted-foreground">CLAUDE · SONNET 4.5</div>
              <div className="absolute bottom-3 left-3 font-display text-[10px] tracking-[0.3em] text-muted-foreground">LAT 0.003ms</div>
              <div className="absolute bottom-3 right-3 font-display text-[10px] tracking-[0.3em] text-neon">● NOMINAL</div>
              <AIOrb listening={listening} speaking={speaking} />
            </div>
            <div className="h-[300px]">
              <ChatTerminal
                onListenChange={setListening}
                onSpeakChange={setSpeaking}
                onWakeDetected={handleWake}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </div>
          </section>

          {/* Right */}
          <aside className="col-span-12 lg:col-span-3 overflow-y-auto pr-1">
            <RightPanel />
          </aside>
        </main>

        {/* Bottom ticker / vocal cortex */}
        <footer className="relative z-20 flex h-8 items-center gap-4 border-t border-border/60 bg-background/40 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 whitespace-nowrap font-display text-[10px] tracking-[0.3em]">
            <span className="text-cyan neon-text">// VOCAL CORTEX</span>
            <span className={`flex items-center gap-1 ${speaking ? "text-neon" : listening ? "text-danger" : "text-muted-foreground"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${speaking ? "animate-pulse bg-neon" : listening ? "animate-pulse bg-danger" : "bg-muted-foreground/60"}`} />
              {speaking ? "SPEAKING" : listening ? "LISTENING" : "STANDBY"}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee flex gap-8 whitespace-nowrap font-mono text-[10px]">
              {[...tickers, ...tickers].map(([s, v, c], i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{s}</span>
                  <span className="text-foreground">{v}</span>
                  <span className={String(c).startsWith("-") ? "text-danger" : "text-neon"}>{c}</span>
                </span>
              ))}
            </div>
          </div>
        </footer>
      </div>
      <ActivationOverlay active={activated} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
