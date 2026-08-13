import { motion } from 'framer-motion';
import {
  Database,
  Brain,
  Share2,
  Clock,
  FileText,
  Bot,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
}

const features: Feature[] = [
  {
    icon: Database,
    title: 'Multi-Source OSINT',
    desc: 'Aggregate intelligence across 412+ public and commercial sources in a single query — social media, breach data, corporate registries, domain records, and the deep web.',
    tag: 'INGEST',
  },
  {
    icon: Brain,
    title: 'AI Correlation Engine',
    desc: 'Cross-reference entities, aliases, and artifacts with neural matching. Surface non-obvious links between people, assets, and events that manual analysis would miss.',
    tag: 'ANALYZE',
  },
  {
    icon: Share2,
    title: 'Link Analysis Graph',
    desc: 'Interactive entity-relationship graphs render connections across email addresses, phone numbers, domains, and crypto wallets with force-directed visualization.',
    tag: 'VISUALIZE',
  },
  {
    icon: Clock,
    title: 'Timeline Reconstruction',
    desc: 'Chronologically order every artifact — posts, registrations, transactions, and sightings — into a defensible timeline of subject activity and behavior.',
    tag: 'SEQUENCE',
  },
  {
    icon: FileText,
    title: 'Evidence Report Generation',
    desc: 'Export court-ready intelligence reports with source citations, confidence scores, and chain-of-custody metadata in PDF, DOCX, or structured JSON format.',
    tag: 'REPORT',
  },
  {
    icon: Bot,
    title: 'AI Investigation Assistant',
    desc: 'A conversational analyst that proposes next pivots, summarizes findings, and drafts hypotheses — trained on investigative tradecraft and structured analytic techniques.',
    tag: 'ASSIST',
  },
];

const card = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          kicker="Capabilities"
          title="Built for investigators who can't afford to miss a connection"
          subtitle="Every module is engineered to compress hours of manual collection into seconds of structured intelligence."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="group relative overflow-hidden rounded-2xl glass p-7 transition-all duration-300 hover:border-sentinel-cyan/30 hover:bg-sentinel-cyan/[0.03]"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sentinel-cyan/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

              <div className="flex items-center justify-between">
                <div className="relative grid h-12 w-12 place-items-center rounded-xl border border-sentinel-cyan/30 bg-sentinel-cyan/5">
                  <f.icon className="h-6 w-6 text-sentinel-cyan" />
                  <div className="absolute inset-0 rounded-xl opacity-0 shadow-cyan-glow transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sentinel-muted/70">
                  {f.tag}
                </span>
              </div>

              <h3 className="mt-6 font-display text-xl font-semibold text-white">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-sentinel-muted">{f.desc}</p>

              <div className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-sentinel-cyan/0 transition-colors group-hover:text-sentinel-cyan">
                <span className="h-px w-6 bg-sentinel-cyan/40 transition-all group-hover:w-10" />
                MODULE 0{i + 1}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-8 bg-sentinel-cyan" />
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-sentinel-cyan">
          {kicker}
        </span>
      </div>
      <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-relaxed text-sentinel-muted sm:text-lg">{subtitle}</p>
    </motion.div>
  );
}
