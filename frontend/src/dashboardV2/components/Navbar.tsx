import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Shield, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return(
    <>
    <header className="sticky top-0 z-20 glass border-b border-cyan-500/10">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-cyan-500 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Shield className="h-6 w-6 text-cyan-500" strokeWidth={2.2} />
              <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md" />
            </div>
            <div className="hidden flex-col leading-none sm:flex">
              <span className="text-sm font-bold tracking-widest text-white">
                SENTINEL AI
              </span>
              <span className="text-[10px] tracking-[0.25em] text-cyan-500/70">
                INVESTIGATION DASHBOARD
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 md:px-8">
          <div className="group relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-500" />
            <input
              type="text"
              placeholder="Quick search across cases…"
              className="h-9 w-full rounded-lg border border-white/5 bg-navy-800/60 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 transition-all focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <NotificationBell />

          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-navy-800/60 py-1.5 pl-1.5 pr-3 transition-colors hover:border-cyan-500/30"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/15">
                  <User className="h-4 w-4 text-cyan-500" />
                </div>
                <div className="hidden flex-col items-start leading-tight sm:flex">
                  <span className="text-xs font-semibold text-slate-200">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500">{user.email}</span>
                </div>
              </motion.button>

              {menuOpen && (
                <div
                  className="glass absolute right-0 top-full z-30 mt-2 w-44 rounded-xl border border-white/10 p-1.5"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20"
            >
              <User className="h-3.5 w-3.5" />
              Sign in
            </motion.button>
          )}
        </div>
      </div>
    </header>  

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>  
  );
}
