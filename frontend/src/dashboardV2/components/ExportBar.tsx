import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, Braces, Download, BookmarkPlus } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { saveCase } from "../../services/api";

const EXPORTS = [
  { id: "pdf", label: "PDF", icon: FileText, color: "#FF3B5C" },
  { id: "csv", label: "CSV", icon: FileSpreadsheet, color: "#00F5A0" },
  { id: "json", label: "JSON", icon: Braces, color: "#00E5FF" },
];

interface ExportBarProps {
  result: any;
  query: string;
  type?: string;
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Flattens every discovered data point into one row per fact, each
// citing the exact source it came from -- this is what makes the export
// "evidence-grade" rather than just a dump.
function flattenForExport(result: any) {
  const rows: { field: string; value: string; source: string }[] = [];

  (result.sources ?? []).forEach((s: any) => {
    if (!s.success || !s.data) return;

    Object.entries(s.data).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;

      let displayValue: string;

      if (Array.isArray(value)) {
        if (value.length === 0) return;
        displayValue = value
          .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
          .join(" | ");
      } else if (typeof value === "object") {
        displayValue = JSON.stringify(value);
      } else {
        displayValue = String(value);
      }

      rows.push({ field: key, value: displayValue, source: s.source });
    });
  });

  (result.correlation?.entities ?? []).forEach((e: any) => {
    rows.push({
      field: `entity:${e.type}`,
      value: e.value,
      source: (e.sources ?? []).join(", "),
    });
  });

  return rows;
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function ExportBar({ result, query, type }: ExportBarProps) {
  const [saving, setSaving] = useState(false);

  const exportPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Sentinel AI Investigation Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Target: ${query}`, 14, 32);
    doc.text(`Query Type: ${result.type ?? "unknown"}`, 14, 39);
    doc.text(`Generated: ${new Date().toISOString()}`, 14, 46);
    doc.text(
      `Risk Level: ${result.risk?.level ?? result.summary?.risk_level ?? "Unknown"}`,
      14,
      53
    );

    doc.setFontSize(12);
    doc.text("Summary", 14, 66);

    doc.setFontSize(10);
    doc.text(result.summary?.summary ?? "No summary available.", 14, 74, {
      maxWidth: 180,
    });

    autoTable(doc, {
      startY: 100,
      head: [["Source", "Status", "Notes"]],
      body:
        result.sources?.map((s: any) => [
          s.source,
          s.success ? "Success" : "Failed",
          s.success ? "-" : (s.error ?? "").slice(0, 60),
        ]) ?? [],
    });

    let y = (doc as any).lastAutoTable.finalY + 12;

    // Evidence table: every data point with the exact source that produced
    // it, for source-provenance / evidentiary quality.
    const evidenceRows = flattenForExport(result).map((r) => [
      r.field,
      r.value.slice(0, 70),
      r.source,
    ]);

    if (evidenceRows.length > 0) {
      doc.setFontSize(12);
      doc.text("Evidence (source-cited data points)", 14, y);

      autoTable(doc, {
        startY: y + 6,
        head: [["Field", "Value", "Source"]],
        styles: { fontSize: 8 },
        body: evidenceRows,
      });

      y = (doc as any).lastAutoTable.finalY + 12;
    }

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.text("Recommendations", 14, y);
    y += 8;

    (result.summary?.recommendations ?? []).forEach((rec: string) => {
      doc.text("- " + rec, 18, y, { maxWidth: 175 });
      y += 8;
    });

    doc.save(`${query}_report.pdf`);
    toast.success("PDF exported successfully!");
  };

  const exportCSV = () => {
    if (!result) return;

    const rows = flattenForExport(result);

    if (rows.length === 0) {
      toast.error("Nothing to export yet.");
      return;
    }

    const header = "field,value,source";
    const body = rows
      .map(
        (r) =>
          `${escapeCsv(r.field)},${escapeCsv(r.value)},${escapeCsv(r.source)}`
      )
      .join("\n");

    download(`${query}_evidence.csv`, `${header}\n${body}`, "text/csv");
    toast.success("CSV exported successfully!");
  };

  const exportJSON = () => {
    if (!result) return;

    const payload = {
      query,
      exported_at: new Date().toISOString(),
      ...result,
    };

    download(
      `${query}_investigation.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
    toast.success("JSON exported successfully!");
  };

  const handleSaveCase = async () => {
    if (!result || saving) return;

    setSaving(true);
    try {
      await saveCase(query, type ?? result.type ?? "unknown", result);
      toast.success("Case saved.");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save case.");
    } finally {
      setSaving(false);
    }
  };

  const handlers: Record<string, () => void> = {
    pdf: exportPDF,
    csv: exportCSV,
    json: exportJSON,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass glass-hover flex flex-col items-start justify-between gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-2.5">
        <Download className="h-4.5 w-4.5 text-cyan-500" />

        <div>
          <h2 className="text-sm font-semibold text-white">Export Report</h2>

          <p className="text-[11px] text-slate-500">
            Package this investigation for sharing
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <motion.button
          whileHover={{ y: -2, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSaveCase}
          disabled={saving}
          className="group flex items-center gap-2 rounded-xl border border-white/5 bg-navy-800/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-white disabled:opacity-50"
        >
          <BookmarkPlus className="h-4 w-4 text-amber-400" />
          {saving ? "Saving..." : "Save Case"}
        </motion.button>

        {EXPORTS.map((exp) => {
          const Icon = exp.icon;

          return (
            <motion.button
              key={exp.id}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlers[exp.id]}
              className="group flex items-center gap-2 rounded-xl border border-white/5 bg-navy-800/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-white"
            >
              <Icon className="h-4 w-4" style={{ color: exp.color }} />
              {exp.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
