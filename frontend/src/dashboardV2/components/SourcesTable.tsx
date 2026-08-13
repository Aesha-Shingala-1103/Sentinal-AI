import { motion } from 'framer-motion';
import { useState } from "react";
import SourceDetailsDrawer from "../../components/SourceDetailsDrawer";
import { Database, ShieldCheck, AlertCircle } from 'lucide-react';

interface Source {
  source: string;
  success: boolean;
  data: any;
  error: string | null;
}

interface SourcesTableProps {
  sources: Source[];
}

function ReliabilityBar({ value }: { value: number }) {
  const color =
    value > 90
      ? '#00F5A0'
      : value > 70
      ? '#00E5FF'
      : '#FFB020';

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7 }}
          className="h-full rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>

      <span className="font-mono text-[11px] text-slate-400">
        {value}%
      </span>
    </div>
  );
}

export default function SourcesTable({
  sources,
}: SourcesTableProps) {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass glass-hover overflow-hidden rounded-2xl"
    >
      <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-3.5">
        <Database className="h-4.5 w-4.5 text-cyan-500" />

        <h2 className="text-sm font-semibold tracking-wide text-white">
          Intelligence Sources
        </h2>

        <span className="rounded bg-cyan-500/10 px-2 py-1 text-[10px] font-medium text-cyan-500">
          {sources.length} queried
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-600">
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Records</th>
              <th className="px-5 py-3">Error</th>
              <th className="px-5 py-3">Reliability</th>
            </tr>
          </thead>

          <tbody>
            {sources.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-slate-500"
                >
                  No investigation performed yet.
                </td>
              </tr>
            ) : (
              sources.map((row, idx) => (
                <motion.tr
  onClick={() => setSelectedSource(row)}
                  key={row.source}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{
                    backgroundColor: 'rgba(0,229,255,0.03)',
                  }}
                  className="cursor-pointer border-b border-white/5 hover:bg-cyan-500/5"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-cyan-500" />

                      <span className="font-medium text-white">
                        {row.source}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        row.success
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {row.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-mono text-cyan-400">
                      {row.data
                        ? Object.keys(row.data).length
                        : 0}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {row.error ? (
                      <div className="flex items-center gap-2 text-xs text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        {row.error}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <ReliabilityBar
                      value={row.success ? 100 : 20}
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <SourceDetailsDrawer
  source={selectedSource}
  onClose={() => setSelectedSource(null)}
/>
    </motion.div>
  );
}