import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Maximize2 } from 'lucide-react';
import { GRAPH_NODES, GRAPH_EDGES, type GraphNode } from './data';

const NODE_STYLE: Record<GraphNode['type'], { fill: string; stroke: string; r: number }> = {
  subject: { fill: 'rgba(0,229,255,0.25)', stroke: '#00E5FF', r: 9 },
  email: { fill: 'rgba(122,139,176,0.15)', stroke: '#7a8bb0', r: 6 },
  phone: { fill: 'rgba(122,139,176,0.15)', stroke: '#7a8bb0', r: 6 },
  domain: { fill: 'rgba(61,220,151,0.15)', stroke: '#3ddc97', r: 6 },
  wallet: { fill: 'rgba(255,181,71,0.15)', stroke: '#ffb547', r: 6 },
  social: { fill: 'rgba(122,139,176,0.15)', stroke: '#7a8bb0', r: 6 },
  person: { fill: 'rgba(255,84,112,0.15)', stroke: '#ff5470', r: 6 },
};

export default function GraphView() {
  const [hover, setHover] = useState<string | null>(null);

  const connectedIds = new Set<string>();
  if (hover) {
    connectedIds.add(hover);
    GRAPH_EDGES.forEach((e) => {
      if (e.from === hover) connectedIds.add(e.to);
      if (e.to === hover) connectedIds.add(e.from);
    });
  }

  return (
    <div className="relative overflow-hidden rounded-2xl glass glass-reflection">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-sentinel-cyan" />
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-sentinel-cyan">Link Analysis Graph</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-sentinel-muted">{GRAPH_NODES.length} nodes · {GRAPH_EDGES.length} edges</span>
          <button className="grid h-7 w-7 place-items-center rounded-md border border-white/10 text-sentinel-muted transition-colors hover:border-sentinel-cyan/40 hover:text-sentinel-cyan">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative aspect-[16/10] w-full bg-sentinel-bg/40">
        <div className="absolute inset-0 grid-bg opacity-20" />

        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {GRAPH_EDGES.map((e, i) => {
            const a = GRAPH_NODES.find((n) => n.id === e.from)!;
            const b = GRAPH_NODES.find((n) => n.id === e.to)!;
            const active = hover && (e.from === hover || e.to === hover);
            return (
              <motion.line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={active ? '#00E5FF' : 'rgba(122,139,176,0.25)'}
                strokeWidth={active ? 0.6 : 0.3}
                strokeDasharray="0.6 0.6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.06 }}
              />
            );
          })}

          {GRAPH_NODES.map((n, i) => {
            const s = NODE_STYLE[n.type];
            const dim = hover && !connectedIds.has(n.id);
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: dim ? 0.25 : 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              >
                {n.type === 'subject' && (
                  <circle cx={n.x} cy={n.y} r={s.r + 4} fill="none" stroke={s.stroke} strokeWidth={0.3} opacity={0.4}>
                    <animate attributeName="r" values={`${s.r + 2};${s.r + 6};${s.r + 2}`} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={n.x} cy={n.y} r={s.r} fill={s.fill} stroke={s.stroke} strokeWidth={0.5} />
                {hover === n.id && (
                  <circle cx={n.x} cy={n.y} r={s.r + 2} fill="none" stroke={s.stroke} strokeWidth={0.4} opacity={0.8} />
                )}
              </motion.g>
            );
          })}
        </svg>

        {GRAPH_NODES.map((n) => {
          const dim = hover && !connectedIds.has(n.id);
          return (
            <div
              key={n.id}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-wider transition-opacity ${
                dim ? 'opacity-20' : 'opacity-100'
              }`}
              style={{ left: `${n.x}%`, top: `${n.y + 8}%` }}
            >
              <span className={n.type === 'subject' ? 'text-sentinel-cyan' : 'text-sentinel-muted'}>
                {n.label}
              </span>
            </div>
          );
        })}

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-lg border border-white/5 bg-sentinel-bg/70 px-3 py-2 backdrop-blur-md">
          {[
            { c: '#00E5FF', l: 'Subject' },
            { c: '#3ddc97', l: 'Domain' },
            { c: '#ffb547', l: 'Wallet' },
            { c: '#ff5470', l: 'Person' },
            { c: '#7a8bb0', l: 'Identifier' },
          ].map((x) => (
            <div key={x.l} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: x.c }} />
              <span className="font-mono text-[9px] uppercase tracking-wider text-sentinel-muted">{x.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
