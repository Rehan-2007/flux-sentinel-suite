import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const LINES = [
  "INITIALIZING J.A.R.V.I.S CORE...",
  "LOADING NEURAL MATRICES [████████████] 100%",
  "BIOMETRIC HANDSHAKE: AUTHENTICATED",
  "ENCRYPTION LAYER: AES-512 / QUANTUM",
  "STARK INDUSTRIES SECURE LINK ESTABLISHED",
  "ALL SYSTEMS ONLINE — WELCOME BACK, SIR",
];

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (shown < LINES.length) {
      const id = setTimeout(() => setShown((s) => s + 1), 380);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => { setDone(true); setTimeout(onDone, 600); }, 700);
    return () => clearTimeout(id);
  }, [shown, onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          <div className="grid-bg scan-lines absolute inset-0 opacity-40" />
          <div className="relative w-[640px] max-w-[92vw]">
            <div className="mb-6 text-center">
              <div className="font-display text-5xl font-black tracking-[0.3em] text-cyan neon-text">J.A.R.V.I.S</div>
              <div className="mt-1 text-[10px] tracking-[0.4em] text-muted-foreground">JUST · A · RATHER · VERY · INTELLIGENT · SYSTEM</div>
            </div>
            <div className="glass corner-frame rounded-lg p-5 font-mono text-[12px] text-cyan">
              {LINES.slice(0, shown).map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="py-0.5">
                  <span className="mr-2 text-muted-foreground">{`>`}</span>{l}
                </motion.div>
              ))}
              {shown < LINES.length && <div className="mt-1 inline-block h-3 w-2 animate-pulse bg-cyan" />}
            </div>
            <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div className="h-full bg-cyan shadow-[0_0_10px_var(--color-cyan)]"
                animate={{ width: `${(shown / LINES.length) * 100}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
