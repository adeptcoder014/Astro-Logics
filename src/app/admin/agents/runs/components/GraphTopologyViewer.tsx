'use client'

import React, { useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Cpu, HardDrive, ShieldCheck, PenTool, Zap } from 'lucide-react';

// --- Custom Node Component for Enterprise Density ---
const AgentNode = ({ data, selected }: any) => {
  const { label, type, toolId, isActive, isEnabled } = data;
  
  const Icon = {
    loader: HardDrive,
    planner: Box,
    executor: Cpu,
    validator: ShieldCheck,
    writer: PenTool,
  }[type as string] || Zap;

  return (
    <div className={`relative transition-all duration-500 rounded-xl border-2 overflow-hidden shadow-2xl ${
      isActive 
        ? 'bg-amber-500/10 border-amber-500 ring-4 ring-amber-500/20 scale-105' 
        : isEnabled 
          ? 'bg-stone-900 border-stone-800 hover:border-stone-600' 
          : 'bg-stone-950 border-stone-900 opacity-60'
    }`}>
      {/* Active Glow Effect */}
      {isActive && (
        <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />
      )}
      
      <div className="flex items-center gap-3 px-4 py-3 min-w-[200px]">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-500 text-black' : 'bg-stone-800 text-stone-400'}`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex flex-col">
          <span className={`text-[11px] font-bold uppercase tracking-widest leading-none mb-1 ${
            isActive ? 'text-amber-500' : 'text-stone-500'
          }`}>
            {type}
          </span>
          <span className="text-sm font-semibold text-stone-100">{label}</span>
          {toolId && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-stone-950 rounded border border-stone-800">
              <span className="text-[10px] font-mono text-amber-500/80 leading-none">{toolId}</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-stone-700 !border-none" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-stone-700 !border-none" />
    </div>
  );
};

// Define custom node types
const nodeTypes = {
  agentNode: AgentNode,
};

interface GraphTopologyViewerProps {
  topology: any;
  stepOverrides?: Record<string, any>;
  activeNodeId?: string;
  activeEdgeIds?: string[];
}

export default function GraphTopologyViewer({ 
  topology, 
  stepOverrides = {},
  activeNodeId,
  activeEdgeIds = [],
}: GraphTopologyViewerProps) {
  const { nodes, edges } = useMemo(() => {
    if (!topology) return { nodes: [], edges: [] };

    const horizontalSpacing = 300;
    const verticalSpacing = 150;
    const activeEdgeSet = new Set(activeEdgeIds);

    const flowNodes: Node[] = topology.nodes.map((node: any, idx: number) => {
      const override = stepOverrides[node.id];
      const isEnabled = override?.enabled !== false;
      const isActive = activeNodeId === node.id;

      return {
        id: node.id,
        type: 'agentNode',
        data: { 
          label: node.label,
          type: node.type,
          toolId: override?.toolId,
          isActive,
          isEnabled,
        },
        position: { 
          x: (idx % 3) * horizontalSpacing, 
          y: Math.floor(idx / 3) * verticalSpacing, 
        },
      };
    });

    const flowEdges: Edge[] = topology.edges.map((edge: any, idx: number) => {
      const edgeId = edge.id ?? `edge-${idx}`;
      const isSourceActive = activeNodeId === edge.from;
      const isTargetActive = activeNodeId === edge.to;
      const isEdgeActive = activeEdgeSet.has(edgeId) || isSourceActive || isTargetActive;
      const shouldAnimateEdge = activeEdgeIds.length === 0 || isEdgeActive;

      return {
        id: edgeId,
        source: edge.from,
        target: edge.to,
        type: edge.from === edge.to ? 'default' : 'smoothstep',
        animated: shouldAnimateEdge,
        label: edge.condition,
        interactionWidth: 20,
        style: { 
          stroke: isEdgeActive ? '#E29626' : '#2D241E', 
          strokeWidth: isEdgeActive ? 3 : 2,
          strokeDasharray: shouldAnimateEdge ? '6 4' : undefined,
        },
        labelStyle: {
          fill: '#888',
          fontSize: 10,
          fontWeight: 600,
          fontFamily: 'monospace',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: isEdgeActive ? '#E29626' : '#2D241E',
        },
      };
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [topology, stepOverrides, activeNodeId, activeEdgeIds]);

  if (!topology) return null;

  return (
    <div className="h-[600px] w-full bg-[#0A0A0A] rounded-2xl border border-stone-800 shadow-inner overflow-hidden relative">
      {/* UI Overlay for context */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-600">Topology Graph</h4>
        <div className="flex items-center gap-4 text-[10px] font-medium text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Current Step
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700" /> Pending
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.2}
        maxZoom={1.5}
        attributionPosition="bottom-right"
        paneMoveable
      >
        <Background 
          variant={"dots" as any} 
          color="#1A1614" 
          gap={20} 
          size={1} 
        />
        <Controls 
          showInteractive={false} 
          className="!bg-stone-900 !border-stone-800 !fill-stone-400 [&_button]:!border-stone-800 [&_button:hover]:!bg-stone-800"
        />
        <MiniMap 
          style={{ background: '#f79868' }}
          maskColor="rgba(0, 0, 0, 0.7)"
          nodeColor={(node) => {
            if (node.data.isActive) return '#E29626';
            if (node.data.isEnabled) return '#2D241E';
            return '#14110F';
          }}
          nodeStrokeWidth={3}
          className="!bg-stone-950 !border-stone-800 rounded-lg overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}