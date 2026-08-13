import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  BrainCircuit,
  Network,
  FileSearch,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "RDAP Lookup",
  },
  {
    icon: ShieldCheck,
    title: "VirusTotal Analysis",
  },
  {
    icon: BrainCircuit,
    title: "AI Correlation",
  },
  {
    icon: Network,
    title: "Knowledge Graph",
  },
  {
    icon: FileSearch,
    title: "Generating Report",
  },
];

export default function InvestigationLoader() {
  return (
    <div className="glass rounded-2xl p-8">
      <h2 className="mb-8 text-lg font-semibold text-white">
        Running Investigation...
      </h2>

      <div className="space-y-5">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: index * 0.35,
              }}
              className="flex items-center justify-between rounded-xl border border-cyan-500/10 bg-slate-900/40 p-4"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-cyan-400" />

                <span className="text-sm text-white">
                  {step.title}
                </span>
              </div>

              {index < 2 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : index === 2 ? (
                <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-slate-600" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}