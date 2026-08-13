import { motion } from "framer-motion";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  MarkerType,
} from "reactflow";

import type {
  Node,
  Edge,
} from "reactflow";

import {
  Crosshair,
  Maximize2,
} from "lucide-react";

import "reactflow/dist/style.css";

interface GraphNode {
  id: string;
  label: string;
  type: string;
}

interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

interface LinkAnalysisProps {
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

const nodeColors: Record<string, string> = {
  domain: "#00E5FF",
  nameserver: "#00F5A0",
  reputation: "#FF3B5C",
  category: "#FFB020",
  organization: "#A855F7",
};

function createFlowNodes(nodes: GraphNode[]): Node[] {
  return nodes.map((node, index) => ({
    id: node.id,

    position: {
      x: 250 * Math.cos((index * Math.PI * 2) / Math.max(nodes.length, 1)),
      y: 250 * Math.sin((index * Math.PI * 2) / Math.max(nodes.length, 1)),
    },

    data: {
      label: node.label,
    },

    style: {
      background: "#0F172A",
      color: "white",
      border: `2px solid ${
        nodeColors[node.type] || "#00E5FF"
      }`,
      borderRadius: 14,
      padding: 12,
      minWidth: 120,
      textAlign: "center",
      fontSize: 12,
      boxShadow: `0 0 18px ${
        nodeColors[node.type] || "#00E5FF"
      }55`,
    },
  }));
}

function createFlowEdges(edges: GraphEdge[]): Edge[] {
  return edges.map((edge, index) => ({
    id: String(index),

    source: edge.from,
    target: edge.to,

    label: edge.relation,

    animated: true,

    markerEnd: {
      type: MarkerType.ArrowClosed,
    },

    style: {
      stroke: "#00E5FF",
      strokeWidth: 2,
    },

    labelStyle: {
      fill: "#94A3B8",
      fontSize: 10,
    },
  }));
}
export default function LinkAnalysis({ graph }: LinkAnalysisProps) {
  const flowNodes = createFlowNodes(graph.nodes);
  const flowEdges = createFlowEdges(graph.edges);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass glass-hover relative overflow-hidden rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Crosshair className="h-4.5 w-4.5 text-cyan-500" />

          <h2 className="text-sm font-semibold tracking-wide text-white">
            Link Analysis
          </h2>

          <span className="rounded bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-500">
            {graph.nodes.length} nodes · {graph.edges.length} links
          </span>
        </div>

        <button className="rounded-md p-1.5 hover:bg-white/5">
          <Maximize2 className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Graph */}
      <div className="h-[420px] w-full">
        <ReactFlowProvider>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            fitView
            fitViewOptions={{
              padding: 0.25,
            }}
            minZoom={0.3}
            maxZoom={2}
            defaultEdgeOptions={{
              animated: true,
            }}
          >
            <MiniMap
              zoomable
              pannable
              nodeStrokeWidth={3}
            />

            <Controls />

            <Background gap={20} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </motion.div>
  );
}

