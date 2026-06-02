'use client';

import {

  Sparkles,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import Layout from '../components/Layout';

// Mock static data mirroring the exact snapshot from your target dashboard schema
const VITALS_DATA = [
  { id: 'coherence', label: 'Coherence', value: 78, change: '+6', trend: 'up', points: [70, 72, 71, 75, 74, 76, 78] },
  { id: 'agency', label: 'Agency', value: 64, change: '+4', trend: 'up', points: [60, 61, 59, 62, 63, 62, 64] },
  { id: 'volatility', label: 'Volatility', value: 31, change: '-8', trend: 'down', points: [45, 42, 39, 38, 35, 33, 31] },
  { id: 'adaptability', label: 'Adaptability', value: 42, change: '-3', trend: 'down', points: [48, 46, 47, 44, 45, 43, 42] },
];

const WEATHER_DRIVERS = [
  { name: 'Saturn', status: 'Rising', value: '+0.72', isPositive: true, symbol: '♄' },
  { name: 'Mars', status: 'Rising', value: '+0.51', isPositive: true, symbol: '♂' },
  { name: 'Moon', status: 'Falling', value: '-0.44', isPositive: false, symbol: '☽' },
  { name: 'Neptune', status: 'Falling', value: '-0.38', isPositive: false, symbol: '♆' },
];

const PARLIAMENT_PREVIEW = [
  { name: 'Saturn', role: 'Constraint & Consolidation', value: '0.72', color: 'bg-zinc-900', img: '🪐' },
  { name: 'Mars', role: 'Structural Execution', value: '0.51', color: 'bg-amber-950', img: '🔴' },
  { name: 'Moon', role: 'Relational Synchronization', value: '-0.44', color: 'bg-slate-900', img: '🌑' },
  { name: 'Venus', role: 'Value Harmonization', value: '0.28', color: 'bg-orange-950', img: '🟡' },
  { name: 'Neptune', role: 'Vision & Transcendence', value: '-0.38', color: 'bg-cyan-950', img: '🔵' },
];

export default function CosmicClimatePage() {
  return (
    <Layout>
      <div className="space-y-6 text-[var(--color-primary-dark)]">

        {/* 1. Header Metadata Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black/[0.05] pb-4 gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight uppercase font-roboto text-slate-900">Cosmic Climate</h2>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">Collective State Overview</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 bg-white/40 px-3 py-1.5 rounded-lg border border-black/[0.03]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>REGIME ENGINE: ACTIVE</span>
          </div>
        </div>

        {/* 2. Top Engine Split: Hero Regime vs Weather Drivers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left/Center: Huge Hero Metric Card */}
          <div className="lg:col-span-2 flex flex-col justify-between bg-gradient-to-b from-[#1e325c] to-[#12203f] rounded-2xl p-6 shadow-xl text-[var(--color-primary-light)] relative overflow-hidden group min-h-[260px]">
            {/* Subtle cosmic vector backdrop grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

            <div className="text-center mx-auto space-y-1 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-ring-bronze)] font-mono">Current Regime</span>
              <h3 className="text-3xl md:text-4xl font-black tracking-[0.12em] uppercase text-white font-roboto-mono filter drop-shadow-sm py-2">
                Structured Expansion
              </h3>
            </div>

            {/* Dial Graphic Overlay */}
            <div className="relative flex flex-col items-center justify-center py-2 z-10">
              <div className="absolute w-44 h-22 border-t-2 border-dashed border-[var(--color-ring-bronze)]/30 rounded-t-full -bottom-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Confidence</span>
              <span className="text-4xl font-extrabold text-white tracking-tight mt-1">71%</span>
            </div>

            <div className="border-t border-white/[0.06] pt-3 text-center z-10">
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">System Mechanics Validated Matrix</p>
            </div>
          </div>

          {/* Right Area: Weather Drivers Attribution */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Weather Drivers</h3>
                <HelpCircle size={14} className="text-slate-400" />
              </div>

              <div className="space-y-2.5">
                {WEATHER_DRIVERS.map((driver) => (
                  <div key={driver.name} className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-dark)] text-white flex items-center justify-center font-mono text-sm font-bold shadow-inner">
                        {driver.symbol}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{driver.name}</h4>
                        <p className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${driver.isPositive ? 'text-emerald-600' : 'text-[var(--color-accent-orange)]'}`}>
                          {driver.isPositive ? '↑' : '↓'} {driver.status}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-mono font-bold ${driver.isPositive ? 'text-emerald-600' : 'text-[var(--color-accent-orange)]'}`}>
                      {driver.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-4 py-2 bg-black/[0.03] hover:bg-black/[0.05] border border-black/[0.05] rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
              View All Forces <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* 3. Mid Grid Module: State Vitals vs Regime Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* State Vitals Group Matrix (4 Horizontal Grid Loops) */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VITALS_DATA.map((vital) => {
              const isUp = vital.trend === 'up';
              return (
                <div key={vital.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                      {vital.label}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-900">{vital.value}</span>
                      <span className={`text-xs font-mono font-bold flex items-center ${isUp ? 'text-emerald-600' : 'text-[var(--color-accent-orange)]'}`}>
                        {isUp ? '↑' : '↓'} {vital.change}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">vs yesterday</span>
                  </div>

                  {/* Simple Sparkline Area Mock Generator */}
                  <div className="h-8 mt-3 w-full flex items-end gap-[3px]">
                    {vital.points.map((pt, i) => {
                      const heightPercent = ((pt - 20) / 60) * 100;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-t-sm transition-all duration-500 ${isUp ? 'bg-emerald-500/20 group-hover:bg-emerald-500/40' : 'bg-[var(--color-accent-orange)]/20'}`}
                          style={{ height: `${Math.max(15, Math.min(100, heightPercent))}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Narrative Box Overlay */}
          <div className="bg-white/50 border border-white/70 rounded-2xl p-5 shadow-sm relative">
            <div className="absolute top-4 right-4 text-[var(--color-ring-bronze)]">
              <Sparkles size={14} className="animate-pulse" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">Regime Narrative</h3>
            <p className="text-xs text-slate-700 font-medium leading-relaxed font-sans space-y-2">
              The system currently favors <span className="font-bold text-slate-900">structured growth</span> over exploration.
              Coordination remains high while volatility remains contained. Decision quality improves when operating through existing structures.
            </p>
            <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>ENGINE: LLM PARSE VECTOR</span>
              <span>3-4 LINES MAX</span>
            </div>
          </div>
        </div>

        {/* 4. State Evolution Mini Graph Strip Container */}
        <div className="bg-white/60 border border-white/60 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">State Evolution <span className="text-slate-400 font-normal ml-1">• Last 7 Days</span></h3>
            <span className="text-[10px] font-mono text-slate-400">Trajectory Timeline</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            {VITALS_DATA.map((v) => (
              <div key={v.id} className="flex items-center justify-between border-r border-black/[0.04] last:border-0 pr-4">
                <span className="text-xs font-medium font-mono text-slate-600">{v.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-5 flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className={`w-2 rounded-full ${v.trend === 'up' ? 'bg-emerald-500' : 'bg-[var(--color-accent-orange)]'}`}
                        style={{ height: `${20 + idx * 12}%`, opacity: 0.3 + idx * 0.15 }}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-bold ${v.trend === 'up' ? 'text-emerald-600' : 'text-[var(--color-accent-orange)]'}`}>
                    {v.trend === 'up' ? '↑' : '↓'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Bottom Segment: Planetary Parliament Preview Anchor Deck */}
        <div className="bg-white/80 border border-white/60 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Planetary Parliament Preview</h3>
            <span className="text-[10px] font-mono text-slate-400">Operator Metrics Matrix</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PARLIAMENT_PREVIEW.map((p) => (
              <div key={p.name} className="bg-[var(--color-primary-dark)] text-white rounded-xl p-3 flex flex-col justify-between border border-white/[0.04] shadow-md h-28 relative group hover:border-[var(--color-ring-bronze)]/40 transition-all duration-300">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xl">{p.img}</span>
                    <span className="text-[10px] font-mono text-[var(--color-ring-bronze)] font-bold bg-black/30 px-1.5 py-0.5 rounded">
                      {p.value}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold tracking-wide mt-2 text-[var(--color-primary-light)]">{p.name}</h4>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5 font-medium leading-tight">{p.role}</p>
                </div>
                <div className="text-[8px] font-mono font-bold tracking-widest text-[var(--color-accent-glow)]/40 uppercase mt-2 group-hover:text-[var(--color-accent-orange)] transition-colors">
                  INFLUENCE STATE
                </div>
              </div>
            ))}
          </div>

          {/* Link Routing out to Screen 2 Deck */}
          <div className="mt-4 pt-3 border-t border-black/[0.04] text-center">
            <Link
              href="/parliament"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-dark)] hover:text-[var(--color-accent-orange)] transition-colors uppercase tracking-wider font-mono"
            >
              Go to Planetary Parliament <ChevronRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  );
}