import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import Sidebar from "./components/SideBar";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import SummaryCards from "./components/SummaryCards";
import LinkAnalysis from "./components/LinkAnalysis";
import Timeline from "./components/Timeline";
import SourcesTable from "./components/SourcesTable";
import Copilot from "./components/Copilot";
import ExportBar from "./components/ExportBar";
import InvestigationLoader from "./components/InvestigationLoader";
import EntityCorrelation from "./components/EntityCorrelation";
import SavedCases from "./components/SavedCases";
import IntelligenceSignals from "./components/IntelligenceSignals";
import { detectType } from "./utils/detectType";

import SourceDetailsDrawer from "../components/SourceDetailsDrawer";
import { investigate as investigateAPI, getCase } from "../services/api";

interface DashboardProps {
  onExit: () => void;
}

export default function Dashboard({}: DashboardProps) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [loading, setLoading] = useState(false);
  const [hasResults, setHasResults] = useState(true);

  const [query, setQuery] = useState("shadowbroker@proton.me");
  const [queryType, setQueryType] = useState("email");

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedSource, setSelectedSource] = useState<any | null>(null);

  const investigate = async (q: string, type: string) => {
    setQuery(q);
    setQueryType(type);
    setLoading(true);
    setHasResults(false);
    setError(null);
    setActiveNav("dashboard");

    toast.loading("Running investigation...", {
      id: "investigation",
    });
                

    try {
      const data = await investigateAPI(q, type);

      setResult(data);
      setHasResults(true);

      toast.success("Investigation completed!", {
        id: "investigation",
      });
    } catch (err) {
      console.error(err);

      setError("Investigation failed.");

      toast.error("Investigation failed.", {
        id: "investigation",
      });
    } finally {
      setLoading(false);
    }
  };

  const openSavedCase = (q: string, type: string, savedResult: any) => {
    setQuery(q);
    setQueryType(type);
    setResult(savedResult);
    setHasResults(true);
    setActiveNav("dashboard");
  };

  const openRelatedCase = async (caseId: string) => {
    try {
      const full = await getCase(caseId);
      openSavedCase(full.query, full.type, full.result);
    } catch (err) {
      console.error(err);
      toast.error("Could not open related case.");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-navy-950">
      <Sidebar
        active={activeNav}
        onSelect={(id) => {
          setActiveNav(id);
          setMobileSidebar(false);
        }}
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onOpenSidebar={() => setMobileSidebar(true)} />

        <main className="relative flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
          <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />

          <div className="relative mx-auto max-w-7xl space-y-5 p-4 md:p-6">

            {activeNav === "saved" ? (
              <SavedCases onOpenCase={openSavedCase} />
            ) : (
              <>
            {hasResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-slate-500"
              >
                <span className="font-mono text-cyan-400">{query}</span>
                <span>•</span>
                <span>
                  Investigation ID: INV-{Date.now().toString().slice(-6)}
                </span>
              </motion.div>
            )}

            <SearchBar
              onInvestigate={investigate}
              loading={loading}
            />

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <InvestigationLoader />
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <SummaryCards
  riskScore={result?.risk?.score ?? 0}
  confidence={95}
  entities={result?.graph?.nodes?.length ?? 0}
  sources={result?.sources?.length ?? 0}
/>

                  <LinkAnalysis
                    graph={result?.graph ?? { nodes: [], edges: [] }}
                  />


<EntityCorrelation
  correlation={result?.correlation}
  onPivot={(value) => investigate(value, detectType(value))}
/>

                  <IntelligenceSignals
                    imageCorrelation={result?.image_correlation}
                    syntheticIdentity={result?.synthetic_identity}
                    relatedCases={result?.related_cases}
                    onOpenRelatedCase={openRelatedCase}
                  />

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    <Timeline
                      timeline={result?.timeline ?? []}
                    />

                    <Copilot
                      summary={result?.summary ?? {}}
                    />

                  </div>

                  <SourcesTable
                    sources={result?.sources ?? []}
                  />

                  <ExportBar
                    result={result}
                    query={query}
                    type={queryType}
                  />

                  <SourceDetailsDrawer
                    source={selectedSource}
                    onClose={() => setSelectedSource(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}