import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  Settings,
  Shield,
  X,
} from 'lucide-react';
import { getSourcesHealth } from '../../services/api';

interface SidebarProps {
  active: string;
  onSelect: (item: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'investigations', label: 'Investigations', icon: Search },
  { id: 'saved', label: 'Saved Cases', icon: Bookmark },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ active, onSelect, mobileOpen, onCloseMobile }: SidebarProps) {
  const [sourceStats, setSourceStats] = useState<{ total: number; healthy: number } | null>(null);

  useEffect(() => {
    getSourcesHealth()
      .then((data) => setSourceStats({ total: data.total, healthy: data.healthy }))
      .catch(() => setSourceStats(null));
  }, [active]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : undefined }}
        className={`fixed z-40 h-full w-64 glass border-r border-cyan-500/10 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-cyan-500/30 blur-md" />
                <Shield className="relative h-7 w-7 text-cyan-500" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-widest text-white">
                  SENTINEL
                </span>
                <span className="text-[10px] font-medium tracking-[0.3em] text-cyan-500/80">
                  AI · INTEL
                </span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="text-slate-400 hover:text-cyan-500 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-4 flex-1 space-y-1 px-3">
            {NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.3 }}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-500'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-cyan-500"
                    />
                  )}
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="px-4 py-5">
            <div className="glass rounded-xl p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-accent-green" />
                <span className="text-[11px] font-semibold tracking-wider text-accent-green">
                  SYSTEM ONLINE
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {sourceStats
                  ? `${sourceStats.healthy}/${sourceStats.total} sources healthy`
                  : "14 sources active · 3 regions"}
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
