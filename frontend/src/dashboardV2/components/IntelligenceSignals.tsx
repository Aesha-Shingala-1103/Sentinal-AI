import { motion } from "framer-motion";
import {
  ImageIcon,
  Fingerprint,
  Link2,
  ExternalLink,
  Info,
} from "lucide-react";

interface IntelligenceSignalsProps {
  imageCorrelation?: any;
  syntheticIdentity?: any;
  relatedCases?: any[];
  onOpenRelatedCase?: (id: string) => void;
}

const LEVEL_COLORS: Record<string, string> = {
  High: "text-red-400 border-red-500/30 bg-red-500/10",
  Moderate: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  Low: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  None: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  Unknown: "text-slate-400 border-white/10 bg-white/5",
};

export default function IntelligenceSignals({
  imageCorrelation,
  syntheticIdentity,
  relatedCases,
  onOpenRelatedCase,
}: IntelligenceSignalsProps) {
  const hasImageData =
    imageCorrelation?.enabled &&
    (imageCorrelation.images?.length > 0 || imageCorrelation.matches?.length > 0);
  const hasSyntheticSignals = syntheticIdentity?.signals?.length > 0;
  const hasRelatedCases = relatedCases && relatedCases.length > 0;

  if (!hasImageData && !hasSyntheticSignals && !hasRelatedCases) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 gap-5 lg:grid-cols-3"
    >
      {/* --- Synthetic Identity Signals --- */}
      {syntheticIdentity && (
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Identity Signals</h3>
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                LEVEL_COLORS[syntheticIdentity.level] ?? LEVEL_COLORS.Unknown
              }`}
            >
              {syntheticIdentity.level ?? "Unknown"}
            </span>
          </div>

          {hasSyntheticSignals ? (
            <div className="space-y-2">
              {syntheticIdentity.signals.map((s: any, i: number) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/5 bg-navy-800/50 px-3 py-2 text-[11px] text-slate-300"
                >
                  {s.detail}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No fake-identity pattern signals detected.
            </p>
          )}

          {syntheticIdentity.disclaimer && (
            <div className="mt-3 flex items-start gap-1.5 text-[10px] text-slate-500">
              <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <span>{syntheticIdentity.disclaimer}</span>
            </div>
          )}
        </div>
      )}

      {/* --- Image Intelligence --- */}
      {imageCorrelation?.enabled && (
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-pink-400" />
            <h3 className="text-sm font-semibold text-white">Image Intelligence</h3>
          </div>

          {imageCorrelation.images?.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {imageCorrelation.images
                .filter((img: any) => img.ok)
                .map((img: any, i: number) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={img.label}
                    title={img.label}
                    className="h-12 w-12 rounded-lg border border-white/10 object-cover"
                  />
                ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No discovered profile photos to compare.
            </p>
          )}

          {imageCorrelation.matches?.length > 0 && (
            <div className="space-y-2">
              {imageCorrelation.matches.map((m: any, i: number) => (
                <div
                  key={i}
                  className="rounded-lg border border-pink-500/20 bg-pink-500/5 px-3 py-2 text-[11px] text-pink-200"
                >
                  Same photo on <strong>{m.a}</strong> and{" "}
                  <strong>{m.b}</strong> — {m.confidence}% match confidence
                </div>
              ))}
            </div>
          )}

          {imageCorrelation.reverse_search && (
            <div className="mt-3 border-t border-white/5 pt-3">
              <p className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-500">
                Reverse image search
              </p>
              {imageCorrelation.reverse_search.success ? (
                <div className="space-y-1">
                  {(imageCorrelation.reverse_search.data?.pages_with_matching_images ?? [])
                    .slice(0, 4)
                    .map((p: any, i: number) => (
                      <a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-[11px] text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{p.title || p.url}</span>
                      </a>
                    ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  {imageCorrelation.reverse_search.error ??
                    "Not configured (set GOOGLE_VISION_API_KEY)."}
                </p>
              )}
            </div>
          )}

          {!imageCorrelation.reverse_search_configured && !imageCorrelation.reverse_search && (
            <p className="mt-3 text-[10px] text-slate-500">
              True reverse-image search (find other pages using this photo)
              requires GOOGLE_VISION_API_KEY on the backend.
            </p>
          )}
        </div>
      )}

      {/* --- Related Cases (cross-case pattern linking) --- */}
      {hasRelatedCases && (
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Linked to Past Cases
            </h3>
          </div>

          <div className="space-y-2">
            {relatedCases!.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenRelatedCase?.(c.id)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-left text-[11px] text-amber-200 transition-colors hover:bg-amber-500/10"
              >
                <span className="truncate font-mono">{c.query}</span>
                <span className="flex-shrink-0 rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] uppercase text-slate-400">
                  {c.type}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-3 text-[10px] text-slate-500">
            These saved cases share a discovered entity with this
            investigation — same email, wallet, domain, or profile.
          </p>
        </div>
      )}
    </motion.div>
  );
}
