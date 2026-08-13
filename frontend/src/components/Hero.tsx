import { motion } from 'framer-motion';
import { ArrowRight, Radar, Crosshair } from 'lucide-react';
import CyberBackground from './CyberBackground';
import HoloGlobe from './HoloGlobe';
import FloatingIntelCards from './FloatingIntelCards';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <CyberBackground />
      <FloatingIntelCards />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-[1.2fr_1fr]">
        <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
          <motion.div variants={item} className="mb-8 flex justify-center lg:justify-start">
            <div className="glass-cyan inline-flex items-center gap-2 rounded-full px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sentinel-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sentinel-success" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-sentinel-cyan">
                System Online · Threat Intel Active
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl"
          >
            <span className="text-gradient">Sentinel AI</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-2xl font-display text-lg text-sentinel-text/90 sm:text-xl md:text-2xl lg:mx-0"
          >
            AI-Powered Open Source Intelligence Platform
          </motion.p>

          <motion.p
            variants={item}
            className="mx-auto mt-4 font-mono text-sm uppercase tracking-[0.3em] text-sentinel-cyan sm:text-base lg:mx-0"
          >
            One Search. Complete Intelligence.
          </motion.p>

          <motion.div variants={item} className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <motion.a
              href="#how-it-works"
              onClick={(e) => { e.preventDefault(); onLaunch(); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-sentinel-cyan px-7 py-3.5 font-mono text-sm font-semibold uppercase tracking-widest text-sentinel-bg transition-all hover:shadow-cyan-glow-xl"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
              Launch Investigation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-7 py-3.5 font-mono text-sm uppercase tracking-widest text-sentinel-text transition-all hover:border-sentinel-cyan/50 hover:text-sentinel-cyan hover:shadow-cyan-glow"
            >
              <Crosshair className="h-4 w-4" />
              View Capabilities
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] sm:grid-cols-4 lg:mx-0"
          >
            {[
              { label: 'Sources', value: '412+' },
              { label: 'Entities', value: '1.8B' },
              { label: 'Avg. Query', value: '3.2s' },
              { label: 'Uptime', value: '99.99%' },
            ].map((s) => (
              <div key={s.label} className="bg-sentinel-bg/40 px-4 py-4 text-left transition-colors hover:bg-sentinel-cyan/[0.03]">
                <div className="font-display text-2xl font-semibold text-sentinel-cyan">{s.value}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-sentinel-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hidden justify-center lg:flex"
        >
          <HoloGlobe />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-6 hidden font-mono text-[10px] uppercase tracking-widest text-sentinel-muted/60 md:block">
        <div className="flex items-center gap-2">
          <Radar className="h-3 w-3 text-sentinel-cyan" />
          SCAN ACTIVE · GRID 47.2N 122.3W
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-6 right-6 hidden font-mono text-[10px] uppercase tracking-widest text-sentinel-muted/60 md:block">
        v4.2.1 · SECURE CHANNEL
      </div>
    </section>
  );
}
