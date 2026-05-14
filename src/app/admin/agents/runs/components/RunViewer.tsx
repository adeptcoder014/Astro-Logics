'use client'

import React, { useMemo } from 'react';
import { api } from '~/trpc/react';
import {
  ArrowLeft,
  Calendar,
  Hash,
  LayoutGrid,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  // Navigate,
  Brain,
  Lock,
  Wrench,
  FileEdit,
  Database,
  GitBranch,
  Lightbulb,
  ChevronRight,
  Navigation,
} from 'lucide-react';

interface RunViewerProps {
  onSelectRun: (runId: string) => void;
  onBack: () => void;
  selectedRunId: string | null;
}

// Node type to icon mapping
const getNodeIcon = (eventType: string) => {
  const baseClass = 'w-4 h-4';
  
  if (eventType.includes('root_agent')) return <Navigation className={baseClass} />;
  if (eventType.includes('graph_selector')) return <GitBranch className={baseClass} />;
  if (eventType.includes('memory')) return <Brain className={baseClass} />;
  if (eventType.includes('validation') || eventType.includes('validator')) return <Lock className={baseClass} />;
  if (eventType.includes('planning') || eventType.includes('planner')) return <Lightbulb className={baseClass} />;
  if (eventType.includes('execution') || eventType.includes('executor')) return <Wrench className={baseClass} />;
  if (eventType.includes('writer') || eventType.includes('profile_summary')) return <FileEdit className={baseClass} />;
  if (eventType.includes('intent_router')) return <GitBranch className={baseClass} />;
  if (eventType.includes('statevector')) return <Database className={baseClass} />;
  if (eventType.includes('purpose')) return <Lightbulb className={baseClass} />;
  return <Zap className={baseClass} />;
};

const getNodeColor = (eventType: string) => {
  if (eventType.includes('root_agent')) return 'text-cyan-400 bg-cyan-950';
  if (eventType.includes('graph_selector') || eventType.includes('intent_router')) return 'text-purple-400 bg-purple-950';
  if (eventType.includes('memory')) return 'text-pink-400 bg-pink-950';
  if (eventType.includes('validation')) return 'text-red-400 bg-red-950';
  if (eventType.includes('planning')) return 'text-yellow-400 bg-yellow-950';
  if (eventType.includes('execution')) return 'text-orange-400 bg-orange-950';
  if (eventType.includes('writer') || eventType.includes('profile')) return 'text-blue-400 bg-blue-950';
  if (eventType.includes('statevector')) return 'text-indigo-400 bg-indigo-950';
  if (eventType.includes('purpose')) return 'text-green-400 bg-green-950';
  return 'text-amber-600 bg-amber-50';
};

// Compact Timeline Step Component
const CompactTimelineStep = ({ event, isLast }: { event: any, isLast: boolean }) => {
  const isComplete = event.type.endsWith('.complete');
  const isFailed = event.type.endsWith('.failed');
  const isRunning = !isComplete && !isFailed;
  const nodeColor = getNodeColor(event.type);

  return (
    <div className="flex items-center gap-2">
      {/* Icon with status indicator */}
      <div className={`relative shrink-0 ${nodeColor} p-2 rounded-lg border border-current/30`}>
        {getNodeIcon(event.type)}
        {isRunning && <div className="absolute inset-0 rounded-lg border border-current/50 animate-pulse" />}
      </div>

      {/* Event info */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-stone-200 uppercase tracking-wide truncate">
          {event.type.split('_').slice(0, 2).join(' ')}
        </p>
        <p className="text-[10px] text-stone-500 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</p>
      </div>

      {/* Status indicator */}
      <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border ${
        isComplete ? 'bg-emerald-950 border-emerald-800' :
        isFailed ? 'bg-red-950 border-red-800' :
        'bg-stone-800 border-stone-700'
      }`}>
        {isRunning ? <Loader2 className="w-2.5 h-2.5 text-amber-500 animate-spin" /> : 
         isComplete ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> : 
         <AlertCircle className="w-2.5 h-2.5 text-red-500" />}
      </div>

      {/* Connector */}
      {!isLast && <div className="w-0.5 h-8 bg-stone-800 ml-1" />}
    </div>
  );
};

export default function RunViewer({ onSelectRun, onBack, selectedRunId }: RunViewerProps) {
  const runsQuery = api.agents.listRuns.useQuery({ limit: 100 });
  const runQuery = api.agents.getRun.useQuery({ runId: selectedRunId! }, { enabled: !!selectedRunId });
  const traceQuery = api.agents.getRunTrace.useQuery({ runId: selectedRunId! }, { enabled: !!selectedRunId });

  const run = runQuery.data as any;
  const trace = (traceQuery.data as any)?.trace || [];

  // Group trace events by graph
  const traceGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};
    trace.forEach((event: any) => {
      const graphId = event.payload?.graphId || 'system';
      if (!groups[graphId]) groups[graphId] = [];
      groups[graphId].push(event);
    });
    return groups;
  }, [trace]);

  const graphSequence = useMemo(() => Object.keys(traceGroups), [traceGroups]);

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 via-purple-50 to-rose-50 p-6 gap-6">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-rose-100 rounded-lg border border-rose-200 text-gray-600 hover:text-gray-700 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-stone-100">Execution Monitor</h1>
            <p className="text-xs text-stone-500">Real-time agent execution trace</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* Sidebar - Run List */}
        <aside className="w-64 bg-stone-900/20 border border-stone-800 rounded-2xl flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-stone-800 shrink-0">
            <h2 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid className="w-3 h-3" /> Recent Runs
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {(runsQuery.data || []).map((r: any) => (
              <button 
                key={r.runId} 
                onClick={() => onSelectRun(r.runId)} 
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedRunId === r.runId 
                    ? 'bg-stone-800 border border-amber-500/50 shadow-lg shadow-amber-500/10' 
                    : 'hover:bg-stone-900/50 border border-transparent'
                }`}
              >
                <p className="text-xs font-medium text-stone-300 truncate">{r.input?.message || 'Untitled'}</p>
                <p className="text-[9px] text-stone-500 mt-1">#{r.runId.slice(0, 8)}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-6 min-w-0 overflow-hidden">
          {selectedRunId && run ? (
            <>
              {/* Graph Sequence */}
              {graphSequence.length > 0 && (
                <div className="bg-stone-900/20 border border-stone-800 rounded-2xl p-4 shrink-0">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-3">Graph Sequence</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {graphSequence.map((graphId, idx) => (
                      <div key={graphId} className="flex items-center gap-2 shrink-0">
                        <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold uppercase tracking-wide ${
                          traceGroups[graphId]?.some((e: any) => e.type.endsWith('.complete'))
                            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400'
                            : traceGroups[graphId]?.some((e: any) => e.type.endsWith('.failed'))
                            ? 'bg-red-950/30 border-red-800/50 text-red-400'
                            : 'bg-amber-950/30 border-amber-800/50 text-amber-400'
                        }`}>
                          {graphId}
                        </div>
                        {idx < graphSequence.length - 1 && <ChevronRight className="w-4 h-4 text-stone-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline and Output Split */}
              <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
                {/* Timeline (2 columns) */}
                <section className="col-span-2 bg-stone-900/20 border border-stone-800 rounded-2xl p-6 flex flex-col overflow-hidden">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-4 shrink-0">Execution Timeline</label>
                  <div className="h-96 overflow-y-auto space-y-2">
                    <div className="space-y-4">
                      {trace.map((t: any, i: number) => (
                        <CompactTimelineStep key={i} event={t} isLast={i === trace.length - 1} />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Output & Metadata (1 column) */}
                <section className="col-span-1 flex flex-col gap-4 min-w-0 overflow-hidden">
                  {/* Status Badge */}
                  <div className="bg-stone-900/20 border border-stone-800 rounded-2xl p-4 shrink-0">
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Status</p>
                    <div className={`px-3 py-2 rounded-lg text-sm font-bold text-center ${
                      run.status === 'completed' ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-400' :
                      run.status === 'running' ? 'bg-amber-950/40 border border-amber-800/50 text-amber-400' :
                      run.status === 'failed' ? 'bg-red-950/40 border border-red-800/50 text-red-400' :
                      'bg-stone-900 border border-stone-700 text-stone-400'
                    }`}>
                      {run.status?.toUpperCase() || 'UNKNOWN'}
                    </div>
                  </div>

                  {/* Agent Output */}
                  <div className="flex-1 bg-stone-900/20 border border-stone-800 rounded-2xl p-4 flex flex-col overflow-hidden">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3 shrink-0 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Output
                    </label>
                    <div className="flex-1 bg-stone-950 p-3 rounded-lg border border-stone-800 text-stone-300 overflow-y-auto text-xs leading-relaxed">
                      {run.output?.answer || <span className="opacity-30 italic">Processing...</span>}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="bg-stone-900/20 border border-stone-800 rounded-2xl p-4 shrink-0 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-stone-500"><Hash className="w-3 h-3"/> <span className="font-mono truncate">{selectedRunId}</span></div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500"><Calendar className="w-3 h-3"/> {new Date(run.createdAt).toLocaleString()}</div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-stone-800 rounded-2xl text-stone-600">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a run to view execution trace</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
