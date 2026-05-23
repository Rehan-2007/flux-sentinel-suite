import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Particles } from "@/components/jarvis/Particles";
import { AIOrb } from "@/components/jarvis/AIOrb";
import { SystemPanel } from "@/components/jarvis/SystemPanel";
import { RightPanel } from "@/components/jarvis/RightPanel";
import { ChatTerminal } from "@/components/jarvis/ChatTerminal";
import { BootSequence } from "@/components/jarvis/BootSequence";
import { ActivationOverlay } from "@/components/jarvis/ActivationOverlay";
import { ShieldCheck, Power, Settings, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "J.A.R.V.I.S — AI Operating System" },
      { name: "description", content: "A next-generation holographic AI assistant interface inspired by JARVIS." },
    ],
  }),
});

function Index() {
  const [booted, setBooted] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleWake = () => {
    setActivated(true);
    setTimeout(() => setActivated(false), 2000);
  };

  return (
    <>
      {!booted && <BootSequence onDone={() => setBooted(true)} />}
      <div className="relative h-screen w-screen overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="scan-lines pointer-events-none absolute inset-0 z-10 opacity-50" />
        <Particles />

        {/* Top bar */}
        <header className="relative z-20 flex items-center justify-between border-b border-border/60 px-6 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-7">
              <div className="absolute inset-0 animate-spin-slow rounded-full border border-cyan border-t-transparent" />
              <div className="absolute inset-1.5 rounded-full bg-cyan shadow-[0_0_14px_var(--color-cyan)]" />
            </div>
            <span className="font-display text-sm font-bold tracking-[0.4em] text-cyan neon-text">J.A.R.V.I.S</span>
            <span className="ml-2 text-[10px] tracking-[0.3em] text-muted-foreground">v7.2.1 // STARK OS</span>
          </div>
          <nav className="hidden gap-6 text-[11px] tracking-[0.25em] text-muted-foreground md:flex">
            {["OVERVIEW", "SUITS", "DEFENSE", "WORKSHOP", "ARCHIVE"].map((n, i) => (
              <button key={n} className={`transition hover:text-cyan ${i === 0 ? "text-cyan neon-text" : ""}`}>{n}</button>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-neon" /> SECURE</div>
            <div className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-cyan" /> 42.1 TF/s</div>
            <Settings className="h-4 w-4 cursor-pointer hover:text-cyan" />
            <Power className="h-4 w-4 cursor-pointer hover:text-danger" />
          </div>
        </header>

        {/* Main grid */}
        <main className="relative z-20 grid h-[calc(100vh-58px)] grid-cols-12 gap-4 p-4">
          {/* Left */}
          <aside className="col-span-12 lg:col-span-3 overflow-y-auto">
            <SystemPanel />
          </aside>

          {/* Center */}
          <section className="col-span-12 lg:col-span-6 flex flex-col gap-4">
            <div className="glass corner-frame relative flex flex-1 items-center justify-center overflow-hidden rounded-lg">
              <div className="scan-lines absolute inset-0 pointer-events-none" />
              {/* circuit accents */}
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
              <div className="absolute top-3 left-3 font-display text-[10px] tracking-[0.3em] text-cyan neon-text">CORE // ACTIVE</div>
              <div className="absolute top-3 right-3 font-display text-[10px] tracking-[0.3em] text-muted-foreground">PWR 98.4%</div>
              <div className="absolute bottom-3 left-3 font-display text-[10px] tracking-[0.3em] text-muted-foreground">LAT 0.003ms</div>
              <div className="absolute bottom-3 right-3 font-display text-[10px] tracking-[0.3em] text-neon">● NOMINAL</div>
              <AIOrb listening={listening} speaking={speaking} />
            </div>
            <div className="h-[300px]">
              <ChatTerminal onListenChange={setListening} onSpeakChange={setSpeaking} onWakeDetected={handleWake} />
            </div>
          </section>

          {/* Right */}
          <aside className="col-span-12 lg:col-span-3 overflow-y-auto pr-1">
            <RightPanel />
          </aside>
        </main>
      </div>
      <ActivationOverlay active={activated} />
    </>
  );
}
