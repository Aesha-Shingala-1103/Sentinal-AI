import { motion } from 'framer-motion';
import { Mail, AtSign, Globe, Github, ShieldCheck, Clock, type LucideIcon } from 'lucide-react';

interface FloatCard {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  meta: string;
  x: string;
  y: string;
  delay: number;
  floatDur: number;
}

const cards: FloatCard[] = [
  { id: 'email', icon: Mail, label: 'Email', value: 'g47@protonmail.com', meta: '3 breaches', x: '6%', y: '22%', delay: 0.8, floatDur: 7 },
  { id: 'username', icon: AtSign, label: 'Username', value: 'ghost_op_47', meta: '12 platforms', x: '78%', y: '16%', delay: 1.0, floatDur: 8 },
  { id: 'domain', icon: Globe, label: 'Domain', value: 'shadowcraft.io', meta: 'Njalla · privacy', x: '4%', y: '66%', delay: 1.2, floatDur: 9 },
  { id: 'github', icon: Github, label: 'GitHub', value: 'ghost-op', meta: '18 repos', x: '82%', y: '58%', delay: 1.4, floatDur: 7.5 },
  { id: 'ssl', icon: ShieldCheck, label: 'SSL Certificate', value: 'shadowcraft.io', meta: 'Let\'s Encrypt · 90d', x: '12%', y: '84%', delay: 1.6, floatDur: 8.5 },
  { id: 'timeline', icon: Clock, label: 'Timeline', value: '5 events', meta: '2024 — 2026', x: '76%', y: '82%', delay: 1.8, floatDur: 6.5 },
];

export default function FloatingIntelCards() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      {cards.map((c) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, scale: 0.7, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: c.delay, ease: [0.22, 1, 0.36, 1] as const }}
          className="absolute"
          style={{ left: c.x, top: c.y }}
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: c.floatDur, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.06 }}
            className="group pointer-events-auto w-52 rounded-xl glass glass-reflection p-3.5 transition-all duration-300 hover:border-sentinel-cyan/40 hover:shadow-cyan-glow"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-sentinel-cyan/30 bg-sentinel-cyan/5">
                <c.icon className="h-4 w-4 text-sentinel-cyan" />
                <div className="absolute inset-0 rounded-lg opacity-0 shadow-cyan-glow transition-opacity group-hover:opacity-100" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[9px] uppercase tracking-widest text-sentinel-muted">{c.label}</div>
                <div className="truncate font-display text-xs font-semibold text-white">{c.value}</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-sentinel-success" />
              <span className="font-mono text-[9px] text-sentinel-muted">{c.meta}</span>
            </div>
            <motion.div
              className="absolute inset-x-0 top-0 h-px bg-sentinel-cyan/60"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              animate={{ y: [0, 56] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
