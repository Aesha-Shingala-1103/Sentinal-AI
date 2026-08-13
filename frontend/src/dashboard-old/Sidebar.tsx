import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderSearch,
  Bookmark,
  FileText,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const items: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'investigations', label: 'Investigations', icon: FolderSearch, badge: '3' },
  { id: 'saved', label: 'Saved Cases', icon: Bookmark },
  { id: 'reports', label: 'Reports', icon: FileText, badge: '12' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-white/5 bg-sentinel-bg/60 p-3 backdrop-blur-2xl md:flex">
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id)}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-sentinel-cyan/10 text-sentinel-cyan'
                  : 'text-sentinel-muted hover:bg-white/[0.03] hover:text-sentinel-text'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-sentinel-cyan"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <it.icon className={`h-4 w-4 ${isActive ? 'text-sentinel-cyan' : 'text-sentinel-muted group-hover:text-sentinel-text'}`} />
              <span className="flex-1 text-left font-medium">{it.label}</span>
              {it.badge && (
                <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-sentinel-muted">
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-sentinel-success" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-sentinel-success">Secure Session</span>
        </div>
        <div className="mt-2 font-mono text-[10px] leading-relaxed text-sentinel-muted">
          E2E encrypted · audit logged · zero-retention
        </div>
      </div>
    </aside>
  );
}
