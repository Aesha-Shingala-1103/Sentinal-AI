import { motion } from 'framer-motion';
import { ShieldCheck, Target, Network, Database, TrendingUp, AlertTriangle } from 'lucide-react';

interface SummaryCardsProps {
  riskScore: number;
  confidence: number;
  entities: number;
  sources: number;
}

const ICONS = [ShieldCheck, Target, Network, Database];

export default function SummaryCards({ riskScore, confidence, entities, sources }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Risk Score',
      value: riskScore,
      suffix: '/100',
      icon: ShieldCheck,
      accent: riskScore > 70 ? '#FF3B5C' : '#FFB020',
      bar: true,
    },
    {
      label: 'Confidence Score',
      value: confidence,
      suffix: '%',
      icon: Target,
      accent: '#00F5A0',
      bar: true,
    },
    { label: 'Entities Found', value: entities, suffix: '', icon: Network, accent: '#00E5FF', bar: false },
    { label: 'Sources Queried', value: sources, suffix: '', icon: Database, accent: '#00E5FF', bar: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = ICONS[idx];
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * idx, duration: 0.4 }}
            whileHover={{ y: -3 }}
            className="glass glass-hover group relative overflow-hidden rounded-xl p-4"
          >
            <div
              className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25"
              style={{ background: card.accent }}
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium tracking-wider text-slate-500">
                  {card.label.toUpperCase()}
                </p>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span
                    className="font-mono text-2xl font-bold"
                    style={{ color: card.accent }}
                  >
                    {card.value}
                  </span>
                  <span className="text-sm text-slate-600">{card.suffix}</span>
                </div>
              </div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg border"
                style={{
                  borderColor: `${card.accent}33`,
                  background: `${card.accent}14`,
                }}
              >
                <Icon className="h-4.5 w-4.5" style={{ color: card.accent }} />
              </div>
            </div>
            {card.bar && (
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${card.value}%` }}
                  transition={{ delay: 0.2 + 0.08 * idx, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: card.accent,
                    boxShadow: `0 0 8px ${card.accent}`,
                  }}
                />
              </div>
            )}
            {!card.bar && (
              <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-600">
                <TrendingUp className="h-3 w-3 text-cyan-500/60" />
                <span>Live aggregate</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function RiskBadge({ score }: { score: number }) {
  const level = score > 75 ? 'CRITICAL' : score > 50 ? 'ELEVATED' : 'MODERATE';
  const color = score > 75 ? '#FF3B5C' : score > 50 ? '#FFB020' : '#00E5FF';
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider"
      style={{ background: `${color}1a`, color, border: `1px solid ${color}40` }}
    >
      <AlertTriangle className="h-3 w-3" />
      {level}
    </div>
  );
}
