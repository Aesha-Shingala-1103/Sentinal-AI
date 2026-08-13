import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Bell, ChevronDown, Command } from 'lucide-react';

export default function TopNav() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: 'n1', title: 'Investigation complete', detail: 'ghost_op_47 · 412 sources', time: '2m', tone: 'success' },
    { id: 'n2', title: 'New relationship found', detail: 'bc1q...4f9a ↔ exchange', time: '6m', tone: 'cyan' },
    { id: 'n3', title: 'Source degraded', detail: 'PimEyes rate-limited', time: '14m', tone: 'warning' },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-sentinel-bg/80 px-4 backdrop-blur-2xl md:px-6">
      <div className="flex items-center gap-3">
        <div className="relative grid h-9 w-9 place-items-center rounded-lg border border-sentinel-cyan/40 bg-sentinel-cyan/5">
          <Shield className="h-5 w-5 text-sentinel-cyan" />
          <div className="absolute inset-0 rounded-lg shadow-cyan-glow" />
        </div>
        <div className="hidden sm:block">
          <div className="font-display text-sm font-semibold leading-tight text-white">
            Sentinel<span className="text-sentinel-cyan"> AI</span>
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-sentinel-muted">
            Intel Console v4.2
          </div>
        </div>
      </div>

      <div className="relative mx-2 hidden flex-1 max-w-md md:mx-6 md:block">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition-colors focus-within:border-sentinel-cyan/40">
          <Search className="h-4 w-4 text-sentinel-muted" />
          <input
            placeholder="Search investigations, entities, reports…"
            className="w-full bg-transparent text-sm text-sentinel-text placeholder:text-sentinel-muted/60 focus:outline-none"
          />
          <kbd className="hidden items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-sentinel-muted lg:flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-sentinel-muted transition-colors hover:border-sentinel-cyan/40 hover:text-sentinel-cyan"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sentinel-error" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl glass shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-sentinel-cyan">Notifications</span>
                  <span className="font-mono text-[10px] text-sentinel-muted">{notifications.length} new</span>
                </div>
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/[0.02]">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sentinel-${n.tone}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white">{n.title}</div>
                      <div className="truncate text-xs text-sentinel-muted">{n.detail}</div>
                    </div>
                    <span className="font-mono text-[10px] text-sentinel-muted">{n.time}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 transition-colors hover:border-sentinel-cyan/40"
          >
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-sentinel-cyan/30 to-sentinel-cyan/5 font-mono text-xs font-semibold text-sentinel-cyan">
              AK
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-medium leading-tight text-white">A. Kovač</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-sentinel-muted">Lead Analyst · TS/SCI</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-sentinel-muted" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl glass shadow-2xl"
              >
                <div className="border-b border-white/5 px-4 py-3">
                  <div className="text-sm font-medium text-white">A. Kovač</div>
                  <div className="font-mono text-[10px] text-sentinel-muted">a.kovac@sentinel.ai</div>
                </div>
                {['My Investigations', 'Account Settings', 'API Keys', 'Audit Log', 'Sign Out'].map((m) => (
                  <div key={m} className="cursor-pointer px-4 py-2.5 text-sm text-sentinel-muted transition-colors hover:bg-white/[0.02] hover:text-sentinel-cyan">
                    {m}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
