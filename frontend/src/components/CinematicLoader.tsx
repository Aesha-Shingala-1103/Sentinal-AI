import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Shield, Radar } from 'lucide-react';

const PHASES = [
  'Initializing Intelligence Engine…',
  'Querying RDAP…',
  'Querying GitHub…',
  'Querying Certificate Transparency…',
  'Building Relationship Graph…',
  'Running AI Correlation…',
  'Generating Intelligence Report…',
];

const PHASE_DURATION = 850;

export default function CinematicLoader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (phase < PHASES.length) {
      const t = setTimeout(() => setPhase((p) => p + 1), PHASE_DURATION);
      return () => clearTimeout(t);
    } else {
      setDone(true);
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  const progress = Math.min(100, Math.round((phase / PHASES.length) * 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-sentinel-bg/95 backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sentinel-cyan/15"
            style={{ animation: `pulse-ring 3s cubic-bezier(0.4,0,0.6,1) ${i * 1}s infinite` }}
          />
        ))}
      </div>

      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-sentinel-cyan/50 to-transparent"
        initial={{ top: '0%' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 w-full max-w-lg px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-8 flex flex-col items-center"
        >
          <div className="relative grid h-20 w-20 place-items-center rounded-2xl border border-sentinel-cyan/40 bg-sentinel-cyan/5">
            <Shield className="h-10 w-10 text-sentinel-cyan" />
            <motion.div
              className="absolute inset-0 rounded-2xl border border-sentinel-cyan/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute inset-0 rounded-2xl shadow-cyan-glow-lg" />
          </div>
          <div className="mt-4 font-display text-xl font-semibold text-white">
            Sentinel<span className="text-sentinel-cyan"> AI</span>
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-sentinel-cyan">
            <Radar className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
            Intelligence Engine Booting
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-sentinel-muted">
            <span>System Initialization</span>
            <span className="text-sentinel-cyan">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-sentinel-cyan/40 via-sentinel-cyan to-sentinel-cyan/40"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {PHASES.map((p, i) => {
            const state = i < phase ? 'done' : i === phase ? 'active' : 'pending';
            return (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-all ${
                  state === 'active'
                    ? 'border-sentinel-cyan/30 bg-sentinel-cyan/[0.04]'
                    : state === 'done'
                    ? 'border-white/5 bg-white/[0.01]'
                    : 'border-white/5 bg-transparent opacity-40'
                }`}
              >
                <div className="shrink-0">
                  {state === 'done' && <CheckCircle2 className="h-4 w-4 text-sentinel-success" />}
                  {state === 'active' && <Loader2 className="h-4 w-4 animate-spin text-sentinel-cyan" />}
                  {state === 'pending' && <div className="h-4 w-4 rounded-full border border-white/15" />}
                </div>
                <span
                  className={`font-mono text-xs ${
                    state === 'done' ? 'text-sentinel-muted' : state === 'active' ? 'text-sentinel-cyan' : 'text-sentinel-muted'
                  }`}
                >
                  {p}
                </span>
                {state === 'active' && (
                  <motion.span
                    className="ml-auto flex gap-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1 w-1 rounded-full bg-sentinel-cyan"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                      />
                    ))}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center font-mono text-xs uppercase tracking-widest text-sentinel-success"
            >
              ✓ Intelligence Report Ready · Entering Console
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
