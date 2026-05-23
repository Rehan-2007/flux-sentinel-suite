import { Mic, MicOff, Send, Sparkles, Search, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeechRecognition, isSpeechRecognitionSupported, speak, cancelSpeak } from "@/lib/speech";

interface Msg { role: "user" | "ai"; text: string; }

interface Props {
  onListenChange: (v: boolean) => void;
  onSpeakChange: (v: boolean) => void;
  onWakeDetected: () => void;
}

const RESPONSES = [
  "Of course, sir. Routing through the Mark VII subsystems now.",
  "Analysis complete. I've isolated three anomalies in sector four.",
  "Initiating full diagnostic sweep. ETA: forty-two seconds.",
  "I've taken the liberty of preparing the requested report.",
  "All systems nominal. Shall I engage the perimeter defense grid?",
];

const WAKE_PATTERNS = [/\bjarvis\b/i, /\bjar vis\b/i, /\bhey jarvis\b/i];

export function ChatTerminal({ onListenChange, onSpeakChange, onWakeDetected }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Good evening. All systems are online and operating at peak efficiency. Say 'JARVIS' to activate voice command." },
  ]);
  const [input, setInput] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [wakeArmed, setWakeArmed] = useState(false);
  const [supported] = useState(() => isSpeechRecognitionSupported());
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const wakeRecRef = useRef<any>(null);
  const cmdRecRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const wakeArmedRef = useRef(false);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => { onListenChange(listening); listeningRef.current = listening; }, [listening, onListenChange]);
  useEffect(() => { wakeArmedRef.current = wakeArmed; }, [wakeArmed]);

  const replyAndSpeak = useCallback((userText: string) => {
    setTyping(true);
    setTimeout(() => {
      const reply = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
      setMessages((m) => [...m, { role: "ai", text: reply }]);
      setTyping(false);
      speak(reply, {
        onStart: () => onSpeakChange(true),
        onEnd: () => onSpeakChange(false),
      });
    }, 700);
  }, [onSpeakChange]);

  const send = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setInterim("");
    replyAndSpeak(t);
  }, [replyAndSpeak]);

  // ===== Command recognition (mic button) =====
  const stopCommand = useCallback(() => {
    try { cmdRecRef.current?.stop(); } catch { /* noop */ }
  }, []);

  const startCommand = useCallback(() => {
    if (!supported) { setError("Speech recognition not supported in this browser. Try Chrome."); return; }
    cancelSpeak();
    onSpeakChange(false);
    // pause wake while command is active
    try { wakeRecRef.current?.stop(); } catch { /* noop */ }

    const rec = getSpeechRecognition();
    if (!rec) return;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    cmdRecRef.current = rec;
    let finalText = "";

    rec.onstart = () => { setListening(true); setError(null); };
    rec.onresult = (e: any) => {
      let interimStr = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimStr += r[0].transcript;
      }
      setInterim(interimStr);
      if (finalText) setInput(finalText.trim());
    };
    rec.onerror = (e: any) => {
      setError(e.error === "not-allowed" ? "Microphone permission denied." : `Mic error: ${e.error}`);
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      const toSend = (finalText || "").trim();
      if (toSend) send(toSend);
      // resume wake
      if (wakeArmedRef.current) startWake();
    };

    try { rec.start(); } catch { /* already running */ }
  }, [supported, onSpeakChange, send]);

  // ===== Wake word recognition (continuous) =====
  const startWake = useCallback(() => {
    if (!supported) return;
    if (listeningRef.current) return;
    try { wakeRecRef.current?.stop(); } catch { /* noop */ }
    const rec = getSpeechRecognition();
    if (!rec) return;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    wakeRecRef.current = rec;

    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript: string = e.results[i][0].transcript || "";
        if (WAKE_PATTERNS.some((p) => p.test(transcript))) {
          onWakeDetected();
          try { rec.stop(); } catch { /* noop */ }
          setTimeout(() => startCommand(), 1400);
          return;
        }
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed") {
        setError("Microphone permission denied for wake word.");
        setWakeArmed(false);
      }
    };
    rec.onend = () => {
      // auto-restart while armed and not in command mode
      if (wakeArmedRef.current && !listeningRef.current) {
        setTimeout(() => { try { rec.start(); } catch { /* noop */ } }, 250);
      }
    };
    try { rec.start(); } catch { /* noop */ }
  }, [supported, onWakeDetected, startCommand]);

  const toggleWake = () => {
    if (!supported) { setError("Speech recognition not supported in this browser. Try Chrome."); return; }
    if (wakeArmed) {
      setWakeArmed(false);
      try { wakeRecRef.current?.stop(); } catch { /* noop */ }
    } else {
      setWakeArmed(true);
      setError(null);
      startWake();
    }
  };

  const toggleMic = () => {
    if (listening) stopCommand();
    else startCommand();
  };

  // cleanup
  useEffect(() => () => {
    try { wakeRecRef.current?.stop(); } catch { /* noop */ }
    try { cmdRecRef.current?.stop(); } catch { /* noop */ }
    cancelSpeak();
  }, []);

  return (
    <div className="glass corner-frame flex h-full flex-col overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan" />
          <span className="font-display text-[11px] tracking-[0.3em] text-cyan neon-text">CONVERSE // TERMINAL</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <button
            onClick={toggleWake}
            className={`flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-display tracking-[0.25em] transition ${
              wakeArmed ? "border-neon/60 bg-neon/10 text-neon" : "border-border hover:border-cyan/60 hover:text-cyan"
            }`}
            title="Toggle wake-word listening"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${wakeArmed ? "animate-pulse bg-neon" : "bg-muted-foreground/50"}`} />
            WAKE: {wakeArmed ? "ARMED" : "OFF"}
          </button>
          <span className="hidden sm:inline">NEURAL LINK STABLE</span>
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
          {interim && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} className="flex justify-end">
              <div className="max-w-[78%] rounded-md border border-dashed border-accent/30 bg-accent/5 px-3 py-2 text-sm italic text-muted-foreground">
                {interim}
                <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-accent align-middle" />
              </div>
            </motion.div>
          )}
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

      {error && (
        <div className="flex items-center gap-2 border-t border-danger/40 bg-danger/10 px-3 py-1.5 text-[10px] text-danger">
          <AlertCircle className="h-3 w-3" /> {error}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border-t border-border p-3"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-cyan" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening…" : "Issue a command, sir..."}
            className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          <button
            type="button"
            onClick={toggleMic}
            className={`group relative rounded-full p-2 transition ${listening ? "bg-danger/20" : "bg-cyan/10 hover:bg-cyan/20"}`}
            title={listening ? "Stop listening" : "Start voice command"}
          >
            {listening && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-danger/40" />
                <span className="absolute -inset-1 animate-pulse rounded-full border border-danger/60" />
              </>
            )}
            {listening
              ? <MicOff className="h-4 w-4 text-danger" />
              : <Mic className="h-4 w-4 text-cyan" />}
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
