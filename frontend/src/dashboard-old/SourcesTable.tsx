import { motion } from 'framer-motion';
import { Database, ChevronRight } from 'lucide-react';
import { SOURCES, type SourceRow } from './data';

const STATUS_STYLE: Record<SourceRow['status'], { label: string; dot: string; text: string }> = {
  fresh: { label: 'Fresh', dot: 'bg-sentinel-success', text: 'text-sentinel-success' },
  cached: { label: 'Cached', dot: 'bg-sentinel-cyan', text: 'text-sentinel-cyan' },
  error: { label: 'Error', dot: 'bg-sentinel-error', text: 'text-sentinel-error' },
};

function ConfBar({ v }: { v: number }) {
  const tone = v >= 90 ? 'bg-sentinel-success' : v >= 75 ? 'bg-sentinel-cyan' : 'bg-sentinel-warning';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className={`h-full ${tone}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${v}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <span className="font-mono text-xs text-sentinel-muted">{v}%</span>
    </div>
  );
}

export default function SourcesTable() {
  return (
    <div className="overflow-hidden rounded-2xl glass glass-reflection">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-sentinel-cyan" />
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-sentinel-cyan">Intelligence Sources</h3>
        </div>
        <span className="font-mono text-[10px] text-sentinel-muted">{SOURCES.length} sources · 412 total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-white/5 font-mono text-[10px] uppercase tracking-wider text-sentinel-muted">
              <th className="px-5 py-2.5 font-normal">Source</th>
              <th className="px-5 py-2.5 font-normal">Category</th>
              <th className="px-5 py-2.5 font-normal">Hits</th>
              <th className="px-5 py-2.5 font-normal">Confidence</th>
              <th className="px-5 py-2.5 font-normal">Last Seen</th>
              <th className="px-5 py-2.5 font-normal">Status</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s, i) => {
              const st = STATUS_STYLE[s.status];
              return (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="group border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.02]">
                        <s.icon className="h-4 w-4 text-sentinel-cyan" />
                      </div>
                      <span className="text-sm font-medium text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-sentinel-muted">{s.category}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-sm text-sentinel-text">{s.hits}</span>
                  </td>
                  <td className="px-5 py-3"><ConfBar v={s.confidence} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-sentinel-muted">{s.lastSeen}</td>
                  <td className="px-5 py-3">
                    <div className={`flex items-center gap-2 ${st.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      <span className="font-mono text-[10px] uppercase tracking-wider">{st.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <ChevronRight className="h-4 w-4 text-sentinel-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
