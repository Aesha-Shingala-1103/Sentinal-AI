import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Crosshair, CheckCircle2 } from 'lucide-react';
import { SEARCH_TYPES, type SearchType } from './data';

interface Props {
  onInvestigate: (type: SearchType, query: string) => void;
  investigating: boolean;
}

export default function InvestigationSearch({ onInvestigate, investigating }: Props) {
  const [type, setType] = useState<SearchType>('username');
  const [query, setQuery] = useState('ghost_op_47');

  const activeType = SEARCH_TYPES.find((t) => t.id === type)!;

  return (
    <section className="relative overflow-hidden rounded-2xl glass glass-reflection p-6 md:p-8">
      <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-sentinel-cyan/40" />
      <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-sentinel-cyan/40" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-sentinel-cyan/40" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-sentinel-cyan/40" />

      <div className="mb-5 flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-sentinel-cyan" />
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-sentinel-cyan">Investigation Search</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {SEARCH_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            disabled={investigating}
            className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
              type === t.id
                ? 'border border-sentinel-cyan/50 bg-sentinel-cyan/10 text-sentinel-cyan'
                : 'border border-white/10 bg-white/[0.02] text-sentinel-muted hover:border-white/20 hover:text-sentinel-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (query.trim() && !investigating) onInvestigate(type, query.trim()); }}
        className="relative flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sentinel-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeType.placeholder}
            disabled={investigating}
            className="w-full rounded-lg border border-white/10 bg-sentinel-bg/60 py-3 pl-10 pr-4 font-mono text-sm text-sentinel-text placeholder:text-sentinel-muted/50 transition-colors focus:border-sentinel-cyan/50 focus:outline-none disabled:opacity-60"
          />
        </div>
        <motion.button
          type="submit"
          disabled={investigating || !query.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-sentinel-cyan px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-sentinel-bg transition-all hover:shadow-cyan-glow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {investigating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <Crosshair className="h-4 w-4" />
              Investigate
            </>
          )}
          <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
        </motion.button>
      </form>

      <AnimatePresence>
        {investigating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 rounded-lg border border-sentinel-cyan/20 bg-sentinel-cyan/[0.03] p-4"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-sentinel-cyan" />
              <span className="font-mono text-xs uppercase tracking-widest text-sentinel-cyan">
                Fanning out across 412 sources…
              </span>
            </div>
            <div className="mt-3 space-y-1.5 font-mono text-[11px] text-sentinel-muted">
              {['Resolving entity identifiers', 'Querying breach corpora', 'Correlating on-chain activity', 'Building relationship graph'].map((line, i) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.25 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-3 w-3 text-sentinel-success" />
                  {line}
                </motion.div>
              ))}
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-sentinel-cyan/40 via-sentinel-cyan to-sentinel-cyan/40"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
