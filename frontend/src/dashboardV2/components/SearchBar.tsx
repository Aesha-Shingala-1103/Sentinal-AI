import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Loader2, Zap } from 'lucide-react';
import { detectType } from '../utils/detectType';

interface SearchBarProps {
  onInvestigate: (query: string,type:string) => void;
  loading: boolean;
}

export default function SearchBar({ onInvestigate, loading }: SearchBarProps) {
  const [query, setQuery] = useState('');

const submit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!query.trim() || loading) return;

  const type = detectType(query);

  onInvestigate(query.trim(), type);
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass glass-hover relative overflow-hidden rounded-2xl p-5"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-500 shadow-[0_0_8px_#00E5FF]" />
          <span className="text-[11px] font-semibold tracking-[0.2em] text-cyan-500/90">
            INVESTIGATION SEARCH
          </span>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <div className="group relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Email, Username, Domain, Phone, Wallet"
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/90 pl-11 pr-4 text-sm font-medium text-white placeholder:text-slate-500 caret-cyan-400 transition-all focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading || !query.trim()}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 text-sm font-semibold text-navy-950 shadow-cyan-glow transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" strokeWidth={2.5} />
                Investigate
              </>
            )}
          </motion.button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {['shadowbroker@proton.me', '@ghost_w1re', '0x7A3b...9F2c'].map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="rounded-md border border-white/5 bg-navy-800/50 px-2.5 py-1 font-mono text-[11px] text-slate-500 transition-colors hover:border-cyan-500/30 hover:text-cyan-500"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
