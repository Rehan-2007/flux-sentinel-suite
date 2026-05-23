import { AnimatePresence, motion } from "framer-motion";

interface Props { active: boolean; }

export function ActivationOverlay({ active }: Props) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" />
          <div className="scan-lines absolute inset-0 opacity-60" />

          {/* sweeping rings */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.4, 2.2], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity }}
            className="absolute h-[320px] w-[320px] rounded-full border-2 border-cyan"
            style={{ boxShadow: "0 0 80px var(--color-cyan)" }}
          />
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.4, 2.2], opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity, delay: 0.4 }}
            className="absolute h-[320px] w-[320px] rounded-full border border-accent"
          />

          <motion.div
            initial={{ y: 30, opacity: 0, letterSpacing: "0.1em" }}
            animate={{ y: 0, opacity: 1, letterSpacing: "0.5em" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative text-center"
          >
            <div className="font-display text-xs tracking-[0.6em] text-cyan/80 mb-3">WAKE PHRASE DETECTED</div>
            <div className="font-display text-5xl md:text-7xl font-bold text-cyan neon-text" style={{ textShadow: "0 0 30px var(--color-cyan), 0 0 60px var(--color-cyan)" }}>
              J.A.R.V.I.S
            </div>
            <div className="mt-4 font-display text-sm tracking-[0.5em] text-neon">● ACTIVATED</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.4 }}
              className="mt-6 h-px bg-gradient-to-r from-transparent via-cyan to-transparent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
