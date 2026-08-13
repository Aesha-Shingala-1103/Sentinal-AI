import { motion } from "framer-motion";
import { Clock, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface TimelineItem {
  date: string;
  title: string;
  source?: string;
}

interface TimelineProps {
  timeline: TimelineItem[];
}

const SEVERITY = {
  critical: { color: "#FF3B5C", icon: AlertTriangle, label: "Critical" },
  warn: { color: "#FFB020", icon: AlertCircle, label: "Warning" },
  info: { color: "#00E5FF", icon: Info, label: "Info" },
} as const;

export default function Timeline({ timeline }: TimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass glass-hover rounded-2xl"
    >
      <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-3.5">
        <Clock className="h-4.5 w-4.5 text-cyan-500" />

        <h2 className="text-sm font-semibold tracking-wide text-white">
          Timeline
        </h2>

        <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-500">
          {timeline.length} events
        </span>
      </div>

      <div className="relative px-5 py-5">
        <div className="absolute left-[31px] top-5 bottom-5 w-px bg-gradient-to-b from-cyan-500/40 via-white/10 to-transparent" />

        <div className="space-y-5">
          {timeline.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">
              No timeline available.
            </p>
          ) : (
            timeline.map((event, idx) => {
              const s = SEVERITY.info;
              const Icon = s.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: idx * 0.08,
                    duration: 0.35,
                  }}
                  className="relative flex gap-4"
                >
                  <div
                    className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-navy-900"
                    style={{
                      borderColor: `${s.color}66`,
                      boxShadow: `0 0 10px ${s.color}40`,
                    }}
                  >
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{ color: s.color }}
                    />
                  </div>

                  <div className="flex-1 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider"
                        style={{
                          background: `${s.color}1a`,
                          color: s.color,
                        }}
                      >
                        {event.source ?? "SYSTEM"}
                      </span>

                      <span className="font-mono text-[11px] text-slate-500">
                        {event.date}
                      </span>
                    </div>

                    <h3 className="mt-1 text-sm font-medium text-slate-200">
                      {event.title}
                    </h3>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}