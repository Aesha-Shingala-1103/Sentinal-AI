import { motion } from 'framer-motion';
import { ShieldAlert, Gauge, Database, Share2, type LucideIcon } from 'lucide-react';

interface Card {
  id: string;
  label: string;
  value: number;
  suffix: string;
  tone: string;
  hint: string;
}

const ICONS: Record<string, LucideIcon> = {
  risk: ShieldAlert,
  confidence: Gauge,
  sources: Database,
  relationships: Share2,
};

const TONE: Record<string, { ring: string; text: string; bar: string }> = {
  warning: { ring: 'border-sentinel-warning/30', text: 'text-sentinel-warning', bar: 'bg-sentinel-warning' },
  success: { ring: 'border-sentinel-success/30', text: 'text-sentinel-success', bar: 'bg-sentinel-success' },
  cyan: { ring: 'border-sentinel-cyan/30', text: 'text-sentinel-cyan', bar: 'bg-sentinel-cyan' },
};

export default function SummaryCards({ cards }: { cards: Card[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = ICONS[c.id];
        const tone = TONE[c.tone];
        const pct = c.id === 'sources' ? 100 : c.value;
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-xl glass glass-reflection p-5 transition-all hover:border-white/15"
          >
            <div className="flex items-center justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-lg border ${tone.ring} bg-white/[0.02]`}>
                <Icon className={`h-5 w-5 ${tone.text}`} />
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-widest ${tone.text}`}>{c.hint}</span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-white">{c.value}</span>
              <span className="font-mono text-sm text-sentinel-muted">{c.suffix}</span>
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-sentinel-muted">{c.label}</div>

            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className={`h-full ${tone.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
