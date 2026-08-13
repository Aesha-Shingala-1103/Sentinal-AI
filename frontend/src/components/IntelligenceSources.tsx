import { motion } from 'framer-motion';
import {
  Globe,
  Users,
  Fingerprint,
  Building2,
  Bitcoin,
  Image,
  Mail,
  Network,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from './Features';

interface Source {
  icon: LucideIcon;
  name: string;
  count: string;
  desc: string;
}

const sources: Source[] = [
  { icon: Globe, name: 'Web & Deep Web', count: '180+', desc: 'Indexed pages, paste sites, forums, and darknet marketplaces.' },
  { icon: Users, name: 'Social Media', count: '32', desc: 'Profiles, connections, geolocations, and historical posts across major platforms.' },
  { icon: Fingerprint, name: 'Identity & Breach', count: '14B+', desc: 'Credential dumps and breach corpora for exposure assessment.' },
  { icon: Building2, name: 'Corporate Registries', count: '64', desc: 'Filings, officers, beneficial ownership, and jurisdictional records.' },
  { icon: Bitcoin, name: 'Crypto & Wallets', count: '8', desc: 'On-chain tracing across BTC, ETH, and major chains with cluster attribution.' },
  { icon: Image, name: 'Facial & Image', count: '6', desc: 'Reverse image search and facial-feature matching against open indexes.' },
  { icon: Mail, name: 'Email & Phone', count: '48', desc: 'Reverse lookups, breach linkage, and carrier-level enrichment.' },
  { icon: Network, name: 'Infrastructure', count: '60+', desc: 'DNS history, SSL certificates, WHOIS, and passive DNS resolution.' },
];

export default function IntelligenceSources({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="sources" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          kicker="Intelligence Sources"
          title="A single query reaches further than any one tool could alone"
          subtitle="Sentinel orchestrates collection across hundreds of vetted sources — so an investigator types once and reads everything."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-xl glass p-5 transition-all duration-300 hover:border-sentinel-cyan/30"
            >
              <div className="flex items-start justify-between">
                <s.icon className="h-7 w-7 text-sentinel-cyan transition-transform group-hover:scale-110" />
                <span className="font-display text-2xl font-bold text-sentinel-cyan/30 transition-colors group-hover:text-sentinel-cyan/60">
                  {s.count}
                </span>
              </div>
              <h3 className="mt-4 font-display text-sm font-semibold text-white">{s.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-sentinel-muted">{s.desc}</p>

              <div className="mt-4 h-px w-full bg-gradient-to-r from-sentinel-cyan/40 to-transparent opacity-30 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl glass-cyan p-8 sm:flex-row"
        >
          <div>
            <h3 className="font-display text-xl font-semibold text-white">
              Ready to run your first investigation?
            </h3>
            <p className="mt-2 text-sm text-sentinel-muted">
              Provisioned access for analysts, incident response teams, and authorized investigators.
            </p>
          </div>
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); onLaunch(); }}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-sentinel-cyan px-6 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-sentinel-bg transition-all hover:shadow-cyan-glow-lg"
          >
            Launch Investigation
          </a>
        </motion.div>
      </div>
    </section>
  );
}
