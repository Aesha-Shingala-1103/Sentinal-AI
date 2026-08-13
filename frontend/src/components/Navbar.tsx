import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Sources', href: '#sources' },
];

export default function Navbar({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-lg border border-sentinel-cyan/40 bg-sentinel-cyan/5">
            <Shield className="h-5 w-5 text-sentinel-cyan" />
            <div className="absolute inset-0 rounded-lg shadow-cyan-glow" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Sentinel<span className="text-sentinel-cyan"> AI</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-widest text-sentinel-muted transition-colors hover:text-sentinel-cyan"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); onLaunch(); }}
            className="rounded-md border border-sentinel-cyan/40 bg-sentinel-cyan/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-sentinel-cyan transition-all hover:bg-sentinel-cyan/20 hover:shadow-cyan-glow"
          >
            Launch Investigation
          </a>
        </div>

        <button
          className="text-sentinel-cyan md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="glass overflow-hidden border-t border-white/5 md:hidden"
        >
          <div className="flex flex-col gap-4 px-6 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-mono text-xs uppercase tracking-widest text-sentinel-muted"
              >
                {l.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
