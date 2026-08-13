import { AnimatePresence, motion } from "framer-motion";
import { X, Database, ShieldCheck } from "lucide-react";

interface Source {
  source: string;
  success: boolean;
  data: any;
  error: string | null;
}

interface Props {
  source: Source | null;
  onClose: () => void;
}

export default function SourceDetailsDrawer({
  source,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {source && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 450 }}
            animate={{ x: 0 }}
            exit={{ x: 450 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="fixed right-0 top-0 z-50 h-screen w-[450px] overflow-y-auto border-l border-cyan-500/20 bg-slate-950 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-slate-950/95 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <Database className="text-cyan-400" />

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {source.source}
                  </h2>

                  <p className="text-xs text-slate-400">
                    Intelligence Source Details
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X className="text-slate-300" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-6 p-5">
              {/* Status */}
              <div className="rounded-xl border border-cyan-500/20 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-cyan-400" />

                  <span className="font-medium text-white">
                    Status
                  </span>
                </div>

                <p
                  className={`mt-3 font-semibold ${
                    source.success
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {source.success ? "SUCCESS" : "FAILED"}
                </p>

                {source.error && (
                  <p className="mt-2 text-sm text-red-400">
                    {source.error}
                  </p>
                )}
              </div>

              {/* Parsed Data */}
              <div className="rounded-xl border border-cyan-500/20 p-4">
                <h3 className="mb-3 text-sm font-semibold text-cyan-400">
                  Parsed Data
                </h3>

                {source.data ? (
                  <div className="space-y-3">
                    {Object.entries(source.data).map(([key, value]) => (
                      <div
                        key={key}
                        className="border-b border-white/5 pb-2"
                      >
                        <p className="text-xs uppercase text-slate-500">
                          {key}
                        </p>

                        <p className="mt-1 break-words text-sm text-slate-200">
                          {Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">
                    No data returned.
                  </p>
                )}
              </div>

              {/* Raw JSON */}
              <div className="rounded-xl border border-cyan-500/20 p-4">
                <h3 className="mb-3 text-sm font-semibold text-cyan-400">
                  Raw JSON
                </h3>

                <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-green-300">
                  {JSON.stringify(source.data, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}