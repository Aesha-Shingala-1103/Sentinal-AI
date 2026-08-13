import { Shield, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-14">
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-sentinel-cyan/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-sentinel-cyan/40 bg-sentinel-cyan/5">
                <Shield className="h-5 w-5 text-sentinel-cyan" />
              </div>
              <span className="font-display text-lg font-semibold text-white">
                Sentinel<span className="text-sentinel-cyan"> AI</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sentinel-muted">
              AI-Powered Open Source Intelligence Platform. One search. Complete intelligence.
              Built for analysts who need defensible answers fast.
            </p>
            <div className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-sentinel-success/80">
              <Lock className="h-3 w-3" />
              SOC 2 Type II · AES-256 · Zero-Retention API
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-sentinel-cyan">Platform</h4>
            <ul className="mt-4 space-y-3 text-sm text-sentinel-muted">
              <li><a href="#features" className="transition-colors hover:text-sentinel-cyan">Features</a></li>
              <li><a href="#how-it-works" className="transition-colors hover:text-sentinel-cyan">How It Works</a></li>
              <li><a href="#sources" className="transition-colors hover:text-sentinel-cyan">Intelligence Sources</a></li>
              <li><a href="#hero" className="transition-colors hover:text-sentinel-cyan">Launch Investigation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-sentinel-cyan">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-sentinel-muted">
              <li><a href="#" className="transition-colors hover:text-sentinel-cyan">Terms of Use</a></li>
              <li><a href="#" className="transition-colors hover:text-sentinel-cyan">Privacy Policy</a></li>
              <li><a href="#" className="transition-colors hover:text-sentinel-cyan">Acceptable Use</a></li>
              <li><a href="#" className="transition-colors hover:text-sentinel-cyan">Data Provenance</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-widest text-sentinel-muted/60">
            © 2026 Sentinel AI · All rights reserved
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-sentinel-muted/60">
            Built for authorized investigative use only
          </p>
        </div>
      </div>
    </footer>
  );
}
