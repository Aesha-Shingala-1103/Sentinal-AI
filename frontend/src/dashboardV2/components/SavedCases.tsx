import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Trash2, Tag, StickyNote, ExternalLink, Loader2, Download, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { listCases, deleteCase, getCase, exportCaseUrl, authorizedDownload } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface SavedCasesProps {
  onOpenCase: (query: string, type: string, result: any) => void;
}

const RISK_COLORS: Record<string, string> = {
  Critical: "text-red-400 border-red-500/30 bg-red-500/10",
  High: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  Medium: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  Low: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
};

export default function SavedCases({ onOpenCase }: SavedCasesProps) {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await listCases();
      setCases(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Could not load saved cases.");
      setCases([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleOpen = async (id: string) => {
    setLoadingId(id);
    try {
      const full = await getCase(id);
      onOpenCase(full.query, full.type, full.result);
      toast.success("Case loaded.");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not load case.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCase(id);
      setCases((prev) => (prev ?? []).filter((c) => c.id !== id));
      toast.success("Case deleted.");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not delete case.");
    }
  };

  const handleDownload = async (id: string, query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await authorizedDownload(exportCaseUrl(id, "json"), `${query}_case.json`);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not download case.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass glass-hover rounded-2xl p-5"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <Bookmark className="h-4.5 w-4.5 text-amber-400" />
        <div>
          <h2 className="text-sm font-semibold text-white">Saved Cases</h2>
          <p className="text-[11px] text-slate-500">
            Investigations saved for later review, tagging, and notes
          </p>
        </div>
      </div>

      {!user && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300/90">
          <LogIn className="h-3.5 w-3.5 flex-shrink-0" />
          You're browsing anonymously — these cases are only tied to this
          browser session. Sign in to access them from any device.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
          <p className="mt-1 text-xs text-red-300/70">
            Case storage requires MONGO_URI to be configured on the backend.
          </p>
        </div>
      )}

      {!error && cases === null && (
        <div className="flex items-center gap-2 py-8 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading cases...
        </div>
      )}

      {!error && cases !== null && cases.length === 0 && (
        <div className="py-8 text-center text-sm text-slate-500">
          No saved cases yet. Run an investigation and click{" "}
          <span className="text-cyan-400">Save Case</span> to store it here.
        </div>
      )}

      {!error && cases !== null && cases.length > 0 && (
        <div className="space-y-2.5">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => handleOpen(c.id)}
              className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-navy-800/60 px-4 py-3 text-left transition-colors hover:border-cyan-500/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-mono text-sm text-white">
                    {c.query}
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                    {c.type}
                  </span>
                  {c.risk_level && (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        RISK_COLORS[c.risk_level] ??
                        "text-slate-400 border-white/10"
                      }`}
                    >
                      {c.risk_level}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                  <span>{new Date(c.updated_at).toLocaleString()}</span>

                  {c.tags?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {c.tags.join(", ")}
                    </span>
                  )}

                  {c.notes && (
                    <span className="flex items-center gap-1 truncate">
                      <StickyNote className="h-3 w-3" />
                      {c.notes}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDownload(c.id, c.query, e)}
                  title="Download JSON"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                >
                  <Download className="h-4 w-4" />
                </button>

                {loadingId === c.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                ) : (
                  <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-cyan-400" />
                )}

                <button
                  onClick={(e) => handleDelete(c.id, e)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                  title="Delete case"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
