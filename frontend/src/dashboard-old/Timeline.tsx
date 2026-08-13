import { motion } from 'framer-motion';
import { Clock, FileText, Eye, KeyRound, ArrowDownLeft, type LucideIcon } from 'lucide-react';
import { TIMELINE, type TimelineEvent } from './data';

const ICON: Record<TimelineEvent['type'], LucideIcon> = {
  registration: FileText,
  post: FileText,
  transaction: ArrowDownLeft,
  sighting: Eye,
  breach: KeyRound,
};

const TONE: Record<TimelineEvent['type'], string> = {
  registration: 'text-sentinel-cyan border-sentinel-cyan/30 bg-sentinel-cyan/5',
  post: 'text-sentinel-muted border-white/15 bg-white/[0.03]',
  transaction: 'text-sentinel-warning border-sentinel-warning/30 bg-sentinel-warning/5',
  sighting: 'text-sentinel-error border-sentinel-error/30 bg-sentinel-error/5',
  breach: 'text-sentinel-error border-sentinel-error/30 bg-sentinel-error/5',
};

export default function Timeline() {
  return (
    <div className="relative overflow-hidden rounded-2xl glass glass-reflection">
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
        <Clock className="h-4 w-4 text-sentinel-cyan" />
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-sentinel-cyan">Timeline Reconstruction</h3>
      </div>

      <div className="relative p-5">
        <div className="absolute left-[34px] top-5 bottom-5 w-px bg-gradient-to-b from-sentinel-cyan/40 via-white/10 to-transparent" />

        <div className="space-y-5">
          {TIMELINE.map((e, i) => {
            const Icon = ICON[e.type];
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex gap-4"
              >
                <div className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${TONE[e.type]}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-sentinel-muted">{e.date}</span>
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-white">{e.title}</div>
                  <div className="mt-1 text-xs leading-relaxed text-sentinel-muted">{e.detail}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
