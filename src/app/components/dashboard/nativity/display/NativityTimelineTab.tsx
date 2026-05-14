'use client';

import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { api } from '~/trpc/react';
// import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import {
  Activity, Zap, ShieldAlert,
  Briefcase, RefreshCcw, Terminal
} from 'lucide-react';
import projectState from '../../../../../../public/state.json';
import SceneOrchestrator from '~/app/components/3d/stage/SceneOrchestrator';

type AgentState = 'idle' | 'explaining' | 'deepWork' | 'caution' | 'analysis';

interface PartnerInsight {
  task: string;
  speech: string;
  state: AgentState;
}

export default function NativityTimelineTab({ nativityChartId }: { nativityChartId: string }) {

  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const [range, setRange] = useState(() => {
    const start = new Date();
    const end = new Date();
    start.setMonth(end.getMonth() - 1);
    end.setMonth(end.getMonth() + 1);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  });

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [partnerInsight, setPartnerInsight] = useState<PartnerInsight>({
    task: "Initializing...",
    speech: "Synchronizing with your local natal vectors.",
    state: 'idle'
  });

  const { data, isLoading, error } = api.nativity.getTimeline.useQuery(
    { nativityChartId, startDate: range.start, endDate: range.end },
    { staleTime: 60_000, enabled: !!nativityChartId }
  );
  const [state, setState] = useState<MundaneState>({
    dateTime: new Date(),
    latitude: 28.6139,
    longitude: 77.209,
    timezone: "+5:30",
    useCurrentLocation: false,
  });

  const calculateChartQuery = api.mundane.calculateChart.useQuery(
    {
      dateTime: state.dateTime,
      latitude: state.latitude,
      longitude: state.longitude,
      timezone: state.timezone,
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  // console.log('calculateChartQuerycalculateChartQuerycalculateChartQuery', calculateChartQuery?.data)
  const utils = api.useUtils();

  const chart = useMemo(() => {
    if (!data) return null;
    return {
      timeline: data.timeline.map((d: string) => new Date(d)),
      vedha: data.vedhaScores,
      retro: data.retroVolatility,
      triggers: data.aspectTriggers,
      yMax: Math.max(...data.vedhaScores, 1),
    };
  }, [data]);


  // --- LOGIC ENGINE ---
  useEffect(() => {
    if (!chart) return;

    if (hoverIndex !== null) {
      const hTriggers = chart.triggers[hoverIndex] || [];
      const hVedha = chart.vedha[hoverIndex];
      setPartnerInsight({
        task: "Data Synthesis",
        speech: `Scanning window. ${hVedha > 15 ? "High intensity." : "Stable cycles."} ${hTriggers.length > 0 ? `Triggers: ${hTriggers.join(', ')}.` : ""}`,
        state: 'explaining'
      });
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const idx = Math.max(0, chart.timeline.findIndex(d => d.toISOString().slice(0, 10) === todayStr));
    const intensity = chart.vedha[idx] || 0;
    const volatility = chart.retro[idx] || 0;
    const triggers = chart.triggers[idx] || [];

    if (volatility > 3) {
      setPartnerInsight({ task: "Risk Mitigation", speech: "Volatility spike. Auditing security groups.", state: 'caution' });
    } else if (triggers.some(t => t.includes('SATURN'))) {
      setPartnerInsight({ task: "Hardening", speech: "Saturn transit. Refactoring database indexes.", state: 'deepWork' });
    } else if (intensity > 18) {
      setPartnerInsight({ task: "Velocity Push", speech: "Alignment for peak output. Generating modules.", state: 'deepWork' });
    } else {
      setPartnerInsight({ task: "Observational", speech: "Quiet cycles. Monitoring systems.", state: 'idle' });
    }
  }, [chart, hoverIndex]);

  if (isLoading) return <div className="p-12 animate-pulse text-[#E29626] font-mono uppercase tracking-tighter">Booting Partner OS...</div>;
  if (error) return <div className="p-12 text-red-500 font-mono text-xs">SIGNAL LOST: {error.message}</div>;
  if (!chart) return null;

  // SVG Helpers
  const width = 800;
  const height = 120;
  const xFor = (i: number) => 10 + (i / Math.max(1, chart.timeline.length - 1)) * 780;
  const yFor = (v: number) => 100 - (v / chart.yMax) * 80;

  return (
    <div className="h-full flex flex-col gap-4 p-6 bg-[#080707] text-stone-300 font-sans">

      {/* HEADER */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">Horizon Control</span>
          <div className="flex items-center gap-2 mt-1">
            <DatePicker value={range.start} onChange={(v) => setRange(r => ({ ...r, start: v }))} />
            <span className="text-stone-800">/</span>
            <DatePicker value={range.end} onChange={(v) => setRange(r => ({ ...r, end: v }))} />
          </div>
        </div>
        <button onClick={() => utils.nativity.getTimeline.invalidate()} className="p-3 hover:bg-white/5 rounded-2xl border border-white/5 group">
          <RefreshCcw size={16} className="text-stone-600 group-hover:text-[#E29626] transition-colors" />
        </button>
      </div>


      {/* FOOTER TIMELINE */}
      <div className="bg-[#100F0E] border border-white/5 rounded-[2.5rem] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap size={14} className="text-[#E29626]" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Vedha Intensity Projection</h4>
        </div>
        <div className="relative h-20">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <path d={chart.vedha.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' ')} fill="none" stroke="#E29626" strokeWidth={2} />
            {chart.timeline.map((_, i) => (
              <rect key={i} x={xFor(i) - 5} y={0} width={10} height={height} fill="transparent"
                onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} className="cursor-crosshair" />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
      <div className="flex items-center gap-3">
        <div className="text-stone-600">{icon}</div>
        <span className="text-[10px] font-bold uppercase text-stone-500">{label}</span>
      </div>
      <span className="text-sm font-mono text-stone-200">{value}</span>
    </div>
  );
}

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-transparent text-[11px] font-bold text-stone-400 focus:outline-none focus:text-[#E29626]" />
  );
}