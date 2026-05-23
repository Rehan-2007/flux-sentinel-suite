import { Bell, Calendar, Cloud, Play, SkipBack, SkipForward, Terminal as TermIcon } from "lucide-react";
import { useEffect, useState } from "react";

const commands = [
  "> initialize neural matrix",
  "> deploy security protocols",
  "> scan perimeter sectors 1-7",
  "> sync home automation grid",
  "> analyze energy consumption",
];

export function RightPanel() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      {/* Clock */}
      <div className="glass corner-frame relative overflow-hidden rounded-lg p-5">
        <div className="scan-lines absolute inset-0 pointer-events-none" />
        <div className="font-display text-[10px] tracking-[0.4em] text-muted-foreground">LOCAL // TIME</div>
        <div className="mt-1 font-display text-3xl font-bold text-cyan neon-text tabular-nums">
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </div>
        <div className="text-xs text-muted-foreground">
          {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {/* Weather */}
      <div className="glass corner-frame rounded-lg p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-xs tracking-[0.3em] text-cyan neon-text">WEATHER</span>
          <Cloud className="h-4 w-4 text-cyan" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-4xl text-foreground">22°</div>
            <div className="text-xs text-muted-foreground">Malibu, CA</div>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            <div>Humidity 64%</div>
            <div>Wind 12 km/h</div>
            <div>UV 5</div>
          </div>
        </div>
      </div>

      {/* Tasks/Notifications */}
      <div className="glass corner-frame rounded-lg p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-xs tracking-[0.3em] text-cyan neon-text">AI // TASKS</span>
          <Bell className="h-3.5 w-3.5 text-cyan animate-pulse" />
        </div>
        <ul className="space-y-2 text-[11px]">
          {[
            { t: "Patent draft analysis", s: "78%" },
            { t: "Mark VII calibration", s: "ACTIVE" },
            { t: "Stark Tower diagnostics", s: "QUEUED" },
            { t: "Pepper's call at 18:30", s: "SCHED" },
          ].map((x) => (
            <li key={x.t} className="flex items-center justify-between border-l-2 border-cyan/60 bg-cyan/5 px-2 py-1.5">
              <span className="text-foreground/90">{x.t}</span>
              <span className="font-display text-[10px] tracking-wider text-cyan">{x.s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Music */}
      <div className="glass corner-frame rounded-lg p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-xs tracking-[0.3em] text-cyan neon-text">AUDIO</span>
          <span className="text-[10px] text-muted-foreground">NOW PLAYING</span>
        </div>
        <div className="text-sm text-foreground">Shoot to Thrill</div>
        <div className="text-[11px] text-muted-foreground">AC/DC — Black Ice</div>
        <div className="mt-3 flex items-center justify-center gap-4 text-cyan">
          <button className="rounded-full p-1.5 hover:bg-cyan/10"><SkipBack className="h-4 w-4" /></button>
          <button className="rounded-full border border-cyan/60 p-2 shadow-[0_0_15px_var(--color-cyan)]"><Play className="h-4 w-4 fill-current" /></button>
          <button className="rounded-full p-1.5 hover:bg-cyan/10"><SkipForward className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Commands log */}
      <div className="glass corner-frame rounded-lg p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-xs tracking-[0.3em] text-cyan neon-text">RECENT // CMD</span>
          <TermIcon className="h-3.5 w-3.5 text-cyan" />
        </div>
        <div className="space-y-1 font-mono text-[10.5px] text-muted-foreground">
          {commands.map((c, i) => <div key={i} className="animate-flicker">{c}</div>)}
        </div>
      </div>

      <div className="glass corner-frame flex items-center gap-3 rounded-lg p-3">
        <Calendar className="h-4 w-4 text-cyan" />
        <span className="text-[11px] text-muted-foreground">Next: Board meeting · 14:00</span>
      </div>
    </div>
  );
}
