import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props { listening: boolean; speaking: boolean; }

export function AIOrb({ listening, speaking }: Props) {
  const [bars, setBars] = useState<number[]>(Array(48).fill(0.2));
  useEffect(() => {
    const id = setInterval(() => {
      setBars((prev) => prev.map(() => {
        const base = speaking ? 0.5 : listening ? 0.35 : 0.18;
        return base + Math.random() * (speaking ? 0.5 : listening ? 0.4 : 0.15);
      }));
    }, 90);
    return () => clearInterval(id);
  }, [listening, speaking]);

  const intensity = speaking ? 1.15 : listening ? 1.05 : 1;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 460, height: 460 }}>
      {/* outer rotating rings */}
      <div className="absolute inset-0 animate-spin-slow">
        <svg viewBox="0 0 460 460" className="h-full w-full text-cyan opacity-70">
          <circle cx="230" cy="230" r="220" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 8" />
          <circle cx="230" cy="230" r="220" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="60 600" />
        </svg>
      </div>
      <div className="absolute inset-8 animate-spin-reverse">
        <svg viewBox="0 0 400 400" className="h-full w-full text-accent opacity-60">
          <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 4" />
          <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 120" />
          <text x="200" y="14" fill="currentColor" fontSize="8" textAnchor="middle" fontFamily="Orbitron">JARVIS // CORE v7.2.1</text>
        </svg>
      </div>
      <div className="absolute inset-16 animate-spin-slow" style={{ animationDuration: "30s" }}>
        <svg viewBox="0 0 320 320" className="h-full w-full text-primary">
          <circle cx="160" cy="160" r="150" fill="none" stroke="currentColor" strokeWidth="1" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={160 + Math.cos(a) * 150} cy={160 + Math.sin(a) * 150} r="2" fill="currentColor" />;
          })}
        </svg>
      </div>

      {/* waveform ring */}
      <svg viewBox="0 0 240 240" className="absolute inset-0 m-auto h-[240px] w-[240px]">
        {bars.map((v, i) => {
          const angle = (i / bars.length) * Math.PI * 2;
          const r1 = 100;
          const r2 = 100 + v * 18 * intensity;
          const x1 = 120 + Math.cos(angle) * r1;
          const y1 = 120 + Math.sin(angle) * r1;
          const x2 = 120 + Math.cos(angle) * r2;
          const y2 = 120 + Math.sin(angle) * r2;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="oklch(0.85 0.18 200)" strokeWidth="2" strokeLinecap="round" opacity={0.85} />;
        })}
      </svg>

      {/* core */}
      <motion.div
        animate={{ scale: speaking ? [1, 1.08, 1] : listening ? [1, 1.04, 1] : [1, 1.02, 1] }}
        transition={{ duration: speaking ? 0.6 : 2, repeat: Infinity, ease: "easeInOut" }}
        className="animate-pulse-glow relative h-44 w-44 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 30%, oklch(0.95 0.15 200), oklch(0.6 0.22 240) 40%, oklch(0.3 0.2 280) 75%, oklch(0.1 0.1 280))",
          boxShadow: "inset 0 0 40px oklch(0.9 0.2 220 / 0.6), inset 0 -20px 60px oklch(0.3 0.2 290 / 0.8), 0 0 80px oklch(0.7 0.2 230 / 0.6)",
        }}
      >
        <div className="absolute inset-3 rounded-full opacity-80" style={{
          background: "conic-gradient(from 0deg, transparent, oklch(0.9 0.2 200 / 0.5), transparent, oklch(0.7 0.25 300 / 0.5), transparent)",
        }} />
        <div className="absolute inset-0 rounded-full mix-blend-screen" style={{
          background: "radial-gradient(circle at 30% 25%, oklch(1 0 0 / 0.5), transparent 35%)",
        }} />
      </motion.div>

      {/* status */}
      <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-xs tracking-[0.4em] text-cyan neon-text">
        {speaking ? "● SPEAKING" : listening ? "● LISTENING" : "● STANDBY"}
      </div>
    </div>
  );
}
