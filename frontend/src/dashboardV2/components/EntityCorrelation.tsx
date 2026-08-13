import { motion } from "framer-motion";
import { Network, Link2, Target } from "lucide-react";

interface Entity {
  id: string;
  type: string;
  value: string;
  sources: string[];
}

interface Relationship {
  source: string;
  target: string;
  relation: string;
  confidence: number;
}

interface Pivot {
  value: string;
  score: number;
}

interface Props {
  correlation?: {
    entities: Entity[];
    relationships: Relationship[];
    pivot_points: Pivot[];
  };
  onPivot?: (query: string) => void;
}

export default function EntityCorrelation({
  correlation,
  onPivot,
}: Props) {
  if (!correlation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md p-6"
    >
      {/* Header */}

      <div className="mb-5 flex items-center gap-2">
        <Network className="text-cyan-400" size={20} />
        <h2 className="text-lg font-semibold text-white">
          Entity Correlation
        </h2>
      </div>

      {/* Entities */}

      <div className="mb-6">
        <h3 className="mb-3 text-sm text-cyan-300">
          Identifiers
        </h3>

        <div className="space-y-2">
          {correlation.entities.map((entity) => (
            <div
              key={entity.id}
              className="flex justify-between rounded-lg bg-slate-800/60 px-3 py-2"
            >
              <div>
                <div className="font-medium text-white">
                  {entity.value}
                </div>

                <div className="text-xs uppercase text-slate-400">
                  {entity.type}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-1">

                {entity.sources.map((source) => (

                    <span
                    key={source}
                    className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300"
                    >
                    {source}
                    </span>

                ))}

                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relationships */}

      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm text-cyan-300">
          <Link2 size={15} />
          Relationships
        </h3>

        <div className="space-y-2">
          {correlation.relationships.length === 0 ? (
            <p className="text-sm text-slate-500">
              No correlated relationships discovered.
            </p>
          ) : (
            correlation.relationships.map((r, index) => (
              <div
                key={index}
                className="rounded-lg bg-slate-800/60 px-3 py-2"
              >
                <div className="text-sm text-white">
                  {r.source} → {r.relation} → {r.target}
                </div>

                <div className="mt-1 text-xs text-cyan-400">
                  Confidence: {r.confidence}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pivot Targets */}

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm text-cyan-300">
          <Target size={15} />
          Suggested Pivot Targets
        </h3>

        <div className="space-y-2">
          {correlation.pivot_points.length === 0 ? (
            <p className="text-sm text-slate-500">
              No pivot targets detected.
            </p>
          ) : (
            correlation.pivot_points.map((pivot) => (
              <div
                key={pivot.value}
                className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2"
              >
                <div>
                  <div className="font-medium text-white">
                    🔥 {pivot.value}
                  </div>

                  <div className="text-xs text-cyan-400">
                    Score: {pivot.score}
                  </div>
                </div>

                <button
                  onClick={() => onPivot?.(pivot.value)}
                  className="rounded-lg bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-cyan-400"
                >
                  Investigate
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}