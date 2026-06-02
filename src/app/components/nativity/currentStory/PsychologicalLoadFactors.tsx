import React from 'react';
import { Activity, Globe } from 'lucide-react';

interface PlanetaryScene {
  id: string;
  planet: string;
  intensity: number;
  sign: string;
  house: number;
  natalLongitude: number;
  currentLongitude: number;
  movementDegrees: number;
  collapseRisk?: number | null;
  dominantPressure?: string | null;
  behavioralPattern?: string | null;
  storyFunction?: string | null;
  sceneAttributes?: {
    vectorState?: Record<string, number | string>;
    cognitiveVector?: Record<string, number | string>;
  } | null;
  activeAspects?: string[];
}

interface PsychologicalLoadFactorsProps {
  scene: PlanetaryScene | null;
}

export const PsychologicalLoadFactors = ({ scene }: PsychologicalLoadFactorsProps) => {
  if (!scene) {
    return (
      <div className="h-full w-full min-h-[220px] md:min-h-[260px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-ring-bronze)]/20 bg-[var(--color-primary-light)]/5 p-6 text-center">
        <div className="p-2.5 bg-white dark:bg-[var(--color-primary-dark)] rounded-xl border border-[var(--color-ring-bronze)]/10 shadow-xs mb-2">
          <Globe size={20} className="text-[var(--color-accent-glow)] animate-pulse" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] max-w-[200px]">
          Awaiting orbital anchor alignment...
        </p>
      </div>
    );
  }

  const vectorState = scene.sceneAttributes?.vectorState;

  return (
    <div className="w-full h-full max-h-[260px] bg-white dark:bg-[var(--color-primary-dark)]/10 border border-[var(--color-ring-bronze)]/10 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between transition-all duration-300">
      <div className="w-full flex flex-col h-full overflow-hidden">
        
        {/* Sticky Component Header */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[var(--color-ring-bronze)]/10 shrink-0">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--color-accent-orange)]" />
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-main)] opacity-80">
              Psychological Load Factors
            </h4>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-md font-mono bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)] font-bold uppercase tracking-wider">
            Live Vector
          </span>
        </div>

        {/* Scrollable Container (Scrollbar hidden by default, visible on card hover) */}
        {vectorState && Object.keys(vectorState).length > 0 ? (
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 font-sans scrollbar-thin hover:scrollbar-thumb-[var(--color-ring-bronze)]/30 scrollbar-thumb-transparent scrollbar-track-transparent transition-colors duration-200">
            {Object.entries(vectorState).map(([key, value]) => {
              const numericVal = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
              const displayVal = typeof value === 'number' ? value.toFixed(1) : value;
              
              return (
                <div 
                  key={key} 
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50/60 dark:bg-neutral-900/10 border border-[var(--color-ring-bronze)]/10 transition-all duration-200 hover:border-[var(--color-ring-bronze)]/30 group"
                >
                  {/* Left: Label */}
                  <span className="capitalize text-xs font-medium text-[var(--text-main)] opacity-90 truncate tracking-tight">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  
                  {/* Right: Inline Progress Bar */}
                  <div className="flex items-center gap-2.5 shrink-0 min-w-[110px] justify-end">
                    <div className="w-16 h-1.5 bg-neutral-200 dark:bg-black/30 rounded-full overflow-hidden p-[0.5px]">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--color-accent-orange)] to-[var(--color-ring-bronze)] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, numericVal * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-black text-[var(--color-accent-orange)] min-w-[24px] text-right">
                      {displayVal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-6 text-xs text-[var(--text-muted)] italic">
            No active load vectors registered.
          </div>
        )}
      </div>
    </div>
  );
};