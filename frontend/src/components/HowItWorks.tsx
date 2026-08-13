import { motion } from 'framer-motion';
import { Search, Layers, FileCheck2, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './Features';

interface Step {
  icon: LucideIcon;
  step: string;
  title: string;
  desc: string;
  detail: string;
}

const steps: Step[] = [
  {
    icon: Search,
    step: '01',
    title: 'Initiate Query',
    desc: 'Enter a single identifier — email, username, domain, phone, wallet address, or image hash. Sentinel fans out across 412+ sources in parallel.',
    detail: 'INPUT → fanout across 412 collectors',
  },
  {
    icon: Layers,
    step: '02',
    title: 'Correlate & Resolve',
    desc: 'The AI engine resolves aliases, links entities, scores confidence, and builds a unified subject profile with a force-directed relationship graph.',
    detail: 'ENTITY RESOLUTION · confidence-weighted',
  },
  {
    icon: FileCheck2,
    step: '03',
    title: 'Deliver Intelligence',
    desc: 'Review the interactive graph, timeline, and AI summary. Export a cited evidence report ready for operational, legal, or executive use.',
    detail: 'OUTPUT → PDF · DOCX · JSON · graph export',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28">
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-sentinel-cyan/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          kicker="Workflow"
          title="From a single clue to a complete picture in three moves"
          subtitle="Sentinel compresses the traditional intelligence cycle — collection, processing, analysis, production — into one continuous flow."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative"
            >
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-12 z-10 hidden h-px w-6 bg-sentinel-cyan/30 lg:block" />
              )}

              <div className="corner-bracket relative h-full rounded-2xl glass p-8">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-sentinel-cyan/30 bg-sentinel-cyan/5">
                    <s.icon className="h-6 w-6 text-sentinel-cyan" />
                  </div>
                  <span className="font-display text-5xl font-bold text-white/5">{s.step}</span>
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-sentinel-muted">{s.desc}</p>

                <div className="mt-6 rounded-md border border-white/5 bg-sentinel-bg/50 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-sentinel-cyan/70">
                  {s.detail}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
