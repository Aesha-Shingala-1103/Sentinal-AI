import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowLeft } from 'lucide-react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import InvestigationSearch from './InvestigationSearch';
import SummaryCards from './SummaryCards';
import GraphView from './GraphView';
import Timeline from './Timeline';
import SourcesTable from './SourcesTable';
import CopilotPanel from './CopilotPanel';
import { SUMMARY_CARDS, type SearchType } from './data';

export default function Dashboard({ onExit }: { onExit: () => void }) {
  const [active, setActive] = useState('dashboard');
  const [investigating, setInvestigating] = useState(false);
  const [lastQuery, setLastQuery] = useState<{ type: SearchType; query: string } | null>(null);

  const handleInvestigate = (type: SearchType, query: string) => {
    setLastQuery({ type, query });
    setInvestigating(true);
    setTimeout(() => setInvestigating(false), 2600);
  };

  return (
    <div className="min-h-screen bg-sentinel-bg">
      <TopNav />
      <div className="flex">
        <Sidebar active={active} onSelect={setActive} />

        <main className="flex-1 px-4 py-5 md:px-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-semibold text-white md:text-2xl">
                {active === 'dashboard' ? 'Investigation Dashboard' : active.charAt(0).toUpperCase() + active.slice(1)}
              </h1>
              <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-sentinel-muted">
                <span className="text-sentinel-cyan">CASE-2026-0417</span>
                <span>·</span>
                <span>Subject: ghost_op_47</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-sentinel-success">
                  <Activity className="h-3 w-3" /> Live
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onExit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-sentinel-muted transition-colors hover:border-sentinel-cyan/40 hover:text-sentinel-cyan"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Exit
              </button>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-sentinel-muted">Last sync</span>
                <span className="font-mono text-xs text-sentinel-text">2m ago</span>
              </div>
            </div>
          </div>

          <InvestigationSearch onInvestigate={handleInvestigate} investigating={investigating} />

          <div className="mt-5">
            <SummaryCards cards={[...SUMMARY_CARDS]} />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <GraphView />
            </div>
            <div className="xl:col-span-1 xl:h-[560px]">
              <CopilotPanel />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Timeline />
            <div className="lg:col-span-1">
              <SourcesTable />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 font-mono text-[10px] uppercase tracking-wider text-sentinel-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sentinel-success">
                <span className="h-1.5 w-1.5 rounded-full bg-sentinel-success" /> Secure channel
              </span>
              <span>Audit logging active</span>
              <span>Zero-retention API</span>
            </div>
            <AnimatePresence>
              {lastQuery && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sentinel-cyan"
                >
                  Last query: {lastQuery.type} · {lastQuery.query}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
