'use client'

import React, { useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  Box,
  ChevronDown,
  ChevronRight,
  Cpu,
  HardDrive,
  Play,
  ShieldCheck,
  Terminal,
  Wrench,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';

interface TraceEvent {
  runId: string;
  type: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

interface WorkflowViewportProps {
  trace: TraceEvent[];
  status: string;
}

interface WorkflowStep {
  id: string;
  type: 'step_start' | 'step_complete' | 'step_failed' | 'run_start' | 'run_complete' | 'run_failed' | 'other';
  label: string;
  stepId?: string;
  timestamp: number;
  duration?: number;
  status?: 'running' | 'completed' | 'failed';
  payload?: Record<string, unknown>;
}

export default function WorkflowViewport({ trace, status }: WorkflowViewportProps) {
  const workflowSteps = useMemo(() => {
    if (!trace || trace.length === 0) return [];

    const steps: WorkflowStep[] = [];
    const activeMap = new Map<string, WorkflowStep>();
    const seenGraphIds = new Set<string>();

    const sortedTrace = [...trace].sort((a, b) => a.timestamp - b.timestamp);

    const normalizeStepKey = (graphId?: string, nodeId?: string) => {
      if (graphId && nodeId) return `${graphId}:${nodeId}`;
      return 'unknown';
    };

    sortedTrace.forEach(event => {
      const { type, timestamp, payload } = event;
      const graphId = payload?.graphId as string | undefined;
      const nodeId = payload?.nodeId as string | undefined;
      const stepKey = normalizeStepKey(graphId, nodeId);
      const baseLabel = graphId && nodeId ? `${graphId} › ${nodeId}` : type.replace(/\.(start|complete|failed)$/, '');
      const humanLabel = baseLabel.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      if (graphId) {
        seenGraphIds.add(graphId);
      }

      if (type === 'run.start') {
        const step: WorkflowStep = {
          id: `run-${timestamp}`,
          type: 'run_start',
          label: 'Agent Run Started',
          timestamp,
          status: 'running',
          payload,
        };
        steps.push(step);
        activeMap.set('run', step);
      } else if (type === 'run.complete' || type === 'run.failed' || type === 'run.cancelled') {
        const runStep = activeMap.get('run');
        if (runStep) {
          runStep.status = type === 'run.complete' ? 'completed' : 'failed';
          runStep.duration = timestamp - runStep.timestamp;
        }

        steps.push({
          id: `${type}-${timestamp}`,
          type: type === 'run.complete' ? 'run_complete' : 'run_failed',
          label: type === 'run.complete' ? 'Agent Run Completed' : 'Agent Run Failed',
          timestamp,
          status: type === 'run.complete' ? 'completed' : 'failed',
          payload,
        });
      } else if (type.endsWith('.start')) {
        const step: WorkflowStep = {
          id: `${stepKey}-${timestamp}`,
          type: 'step_start',
          label: `Start ${humanLabel}`,
          stepId: stepKey,
          timestamp,
          status: 'running',
          payload,
        };
        steps.push(step);
        activeMap.set(stepKey, step);
      } else if (type.endsWith('.complete') || type.endsWith('.failed')) {
        const completed = type.endsWith('.complete');
        const stepName = type.replace(/\.(complete|failed)$/, '');
        const existingKey = normalizeStepKey(graphId, nodeId);
        const startStep = activeMap.get(existingKey);

        if (startStep) {
          startStep.status = completed ? 'completed' : 'failed';
          startStep.duration = timestamp - startStep.timestamp;
          activeMap.delete(existingKey);
        }

        steps.push({
          id: `${existingKey}-${type}-${timestamp}`,
          type: completed ? 'step_complete' : 'step_failed',
          label: `${completed ? 'Completed' : 'Failed'}: ${humanLabel}`,
          stepId: existingKey,
          timestamp,
          status: completed ? 'completed' : 'failed',
          payload,
        });
      } else {
        steps.push({
          id: `${type}-${timestamp}`,
          type: 'other',
          label: humanLabel,
          timestamp,
          payload,
        });
      }
    });

    if (status === 'completed' || status === 'failed') {
      steps.forEach(step => {
        if (step.status === 'running') {
          step.status = status === 'failed' ? 'failed' : 'completed';
        }
      });
    }

    return steps;
  }, [trace, status]);

  const graphSequence = useMemo(() => {
    const sequence = new Set<string>();
    trace.forEach(event => {
      const graphId = event.payload?.graphId as string | undefined;
      if (graphId) sequence.add(graphId);
    });
    return Array.from(sequence);
  }, [trace]);

  const getStepIcon = (type: WorkflowStep['type'], status?: string) => {
    const baseClasses = "w-4 h-4";

    if (status === 'running') {
      return <Loader2 className={`${baseClasses} text-amber-500 animate-spin`} />;
    }
    if (status === 'failed') {
      return <XCircle className={`${baseClasses} text-red-500`} />;
    }
    if (status === 'completed') {
      return <CheckCircle2 className={`${baseClasses} text-emerald-500`} />;
    }

    switch (type) {
      case 'run_start':
      case 'run_complete':
        return <Play className={`${baseClasses} text-blue-500`} />;
      case 'step_start':
      case 'step_complete':
      case 'step_failed':
        return <Cpu className={`${baseClasses} text-purple-500`} />;
      default:
        return <Zap className={`${baseClasses} text-stone-500`} />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const renderStep = (step: WorkflowStep) => {
    return (
      <div key={step.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-stone-800/40 transition-colors group">
        <div className="flex items-center gap-2">
          {getStepIcon(step.type, step.status)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-200 truncate">
              {step.label}
            </span>
            {step.duration && (
              <span className="text-xs text-stone-500 font-mono">
                {formatDuration(step.duration)}
              </span>
            )}
          </div>
          <div className="text-xs text-stone-500">
            {new Date(step.timestamp).toLocaleTimeString([], {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
      </div>
    );
  };

  if (!workflowSteps.length) {
    return (
      <div className="flex items-center justify-center h-full text-stone-500">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No execution trace available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {graphSequence.length > 0 && (
        <div className="mb-4 p-3 rounded-lg border border-stone-800 bg-stone-950/80 text-stone-300">
          <div className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold mb-2">Executed Graphs</div>
          <div className="flex flex-wrap gap-2 text-xs text-stone-400">
            {graphSequence.map(graphId => (
              <span key={graphId} className="rounded-full border border-stone-700 px-2 py-1 bg-stone-900/80">{graphId}</span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        {workflowSteps.map(step => renderStep(step))}
      </div>

      {status === 'running' && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-amber-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Execution in progress...</span>
          </div>
        </div>
      )}
    </div>
  );
}