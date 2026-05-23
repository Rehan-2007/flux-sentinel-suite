import { Mic, Send, Sparkles, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Msg { role: "user" | "ai"; text: string; }

interface Props {
  onListenChange: (v: boolean) => void;
  onSpeakChange: (v: boolean) => void;
}

const RESPONSES = [
  "Of course, sir. Routing through the Mark VII subsystems now.",
  "Analysis complete. I've isolated three anomalies in sector four.",
  "Initiating full diagnostic sweep. ETA: forty-two seconds.",
  "I've taken the liberty of preparing the requested report.",
  "All systems nominal. Shall I engage the perimeter defense grid?",
];

export function ChatTerminal({ onListenChange, onSpeakChange }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Good evening. All systems are online and operating at peak efficiency." },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => { onListenChange(listening); }, [listening, onListenChange]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    onSpeakChange(true);
    setTimeout(() => {
      const reply = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
      setMessages((m) => [...m, { role: "ai", text: reply }]);
      setTyping(false);
      setTimeout(() => onSpeakChange(false), 1500);
    }, 1100);
  };

  const toggleMic = () => {
    setListening((l) => !l);
    if (!listening) {
      setTimeout(() => {
        setListening(false);
        send("Run a full systems diagnostic.");
      }, 2200);
    }
  };

  return (
    <div className="glass corner-frame flex h-full flex-col overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan" />
          <span className="font-display text-[11px] tracking-[0.3em] text-cyan neon-text">CONVERSE // TERMINAL</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
          NEURAL LINK STABLE
        </div>
      </div>

      <div ref={scrollRef} className="scan-lines flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[78%] rounded-md border px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "border-accent/40 bg-accent/10 text-foreground"
                  : "border-cyan/40 bg-cyan/5 text-foreground"
              }`}>
                <div className={`mb-0.5 font-display text-[9px] tracking-[0.3em] ${m.role === "user" ? "text-accent" : "text-cyan"}`}>
                  {m.role === "user" ? "USER" : "J.A.R.V.I.S"}
                </div>
                {m.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="rounded-md border border-cyan/40 bg-cyan/5 px-3 py-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border-t border-border p-3"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-cyan" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Issue a command, sir..."
            className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          <button
            type="button"
            onClick={toggleMic}
            className={`group relative rounded-full p-2 transition ${listening ? "bg-danger/20" : "bg-cyan/10 hover:bg-cyan/20"}`}
          >
            {listening && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-danger/40" />
                <span className="absolute -inset-1 animate-pulse rounded-full border border-danger/60" />
              </>
            )}
            <Mic className={`h-4 w-4 ${listening ? "text-danger" : "text-cyan"}`} />
          </button>
          <button type="submit" className="rounded-md border border-cyan/40 bg-cyan/10 p-2 text-cyan transition hover:bg-cyan/20 hover:shadow-[0_0_15px_var(--color-cyan)]">
            <Send className="h-4 w-4" />
          </button>
        </div>
        {listening && (
          <div className="mt-2 flex items-center gap-2 text-[10px] text-danger">
            <span className="font-display tracking-[0.3em]">● RECORDING</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="w-0.5 animate-pulse bg-danger" style={{ height: `${4 + Math.random() * 14}px`, animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
