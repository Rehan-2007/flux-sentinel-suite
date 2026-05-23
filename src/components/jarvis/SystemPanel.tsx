import { Cpu, MemoryStick, Wifi, Thermometer, BatteryCharging, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Stat { icon: typeof Cpu; label: string; value: number; unit: string; color: string; }

function useTick(initial: number, range: [number, number]) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      setV(() => Math.max(range[0], Math.min(range[1], initial + (Math.random() - 0.5) * 30)));
    }, 1200);
    return () => clearInterval(id);
  }, [initial, range]);
  return Math.round(v);
}

export function SystemPanel() {
  const cpu = useTick(42, [10, 95]);
  const gpu = useTick(67, [10, 95]);
  const ram = useTick(58, [20, 90]);
  const net = useTick(120, [10, 400]);
  const tmp = useTick(54, [40, 78]);
  const bat = useTick(82, [60, 100]);

  const stats: Stat[] = [
    { icon: Cpu, label: "CPU", value: cpu, unit: "%", color: "var(--color-cyan)" },
    { icon: Activity, label: "GPU", value: gpu, unit: "%", color: "var(--color-neon)" },
    { icon: MemoryStick, label: "RAM", value: ram, unit: "%", color: "oklch(0.7 0.2 280)" },
    { icon: Wifi, label: "NET", value: net, unit: "Mb", color: "var(--color-cyan)" },
    { icon: Thermometer, label: "TEMP", value: tmp, unit: "°C", color: "var(--color-danger)" },
    { icon: BatteryCharging, label: "BAT", value: bat, unit: "%", color: "var(--color-neon)" },
  ];

  return (
    <div className="glass corner-frame relative space-y-4 overflow-hidden rounded-lg p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs tracking-[0.3em] text-cyan neon-text">SYSTEM // VITALS</h3>
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_var(--color-cyan)]" />
      </div>
      <div className="space-y-3">
        {stats.map((s) => {
          const pct = s.unit === "Mb" ? Math.min(100, (s.value / 400) * 100) : s.value;
          return (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <s.icon className="h-3 w-3" style={{ color: s.color }} />
                  <span className="font-display tracking-wider">{s.label}</span>
                </span>
                <span className="font-mono tabular-nums" style={{ color: s.color }}>
                  {s.value}<span className="ml-0.5 text-muted-foreground">{s.unit}</span>
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-secondary/50">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ background: `linear-gradient(90deg, ${s.color}, oklch(0.95 0.2 280))`, boxShadow: `0 0 10px ${s.color}` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* radar */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-[10px] tracking-[0.3em] text-muted-foreground">RADAR // SCAN</span>
          <span className="text-[10px] text-cyan">ACTIVE</span>
        </div>
        <div className="relative mx-auto h-32 w-32 rounded-full border border-cyan/40">
          <div className="absolute inset-2 rounded-full border border-cyan/20" />
          <div className="absolute inset-6 rounded-full border border-cyan/20" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-cyan/20" />
          <div className="absolute top-1/2 left-0 h-px w-full bg-cyan/20" />
          <div className="animate-radar absolute inset-0 origin-center">
            <div className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-top-left -translate-y-px"
              style={{ background: "conic-gradient(from 0deg, transparent, oklch(0.85 0.18 200 / 0.5))" }} />
          </div>
          {[[20, 30], [70, 60], [40, 80]].map(([x, y], i) => (
            <div key={i} className="absolute h-1.5 w-1.5 animate-pulse rounded-full bg-cyan shadow-[0_0_6px_var(--color-cyan)]"
              style={{ left: `${x}%`, top: `${y}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
