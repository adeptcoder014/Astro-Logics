import React from 'react';
import { Loader2, RotateCcw, Globe, Compass, ShieldAlert, Award, Zap } from 'lucide-react';
import { PsychologicalLoadFactors } from './PsychologicalLoadFactors';

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

export const PlanetSceneDetail = ({
  scene,
  onRecalculate,
  isRecalculating,
}: {
  scene: PlanetaryScene | null;
  onRecalculate?: (sceneId: string) => void;
  isRecalculating?: boolean;
}) => {
  if (!scene) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[var(--color-ring-bronze)]/30 bg-[var(--color-primary-light)]/5 p-8 md:p-12 text-center transition-all duration-200 hover:border-[var(--color-ring-bronze)]/50">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-white dark:bg-[var(--color-primary-dark)] rounded-xl shadow-sm border border-[var(--color-ring-bronze)]/10">
            <Globe size={24} className="text-[var(--color-accent-glow)] animate-pulse" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] max-w-xs leading-relaxed">
            Select an orbital anchor to inspect live diagnostics
          </p>
        </div>
      </div>
    );
  }

  const formatPosition = (longitude: number) => {
    const zodiacSigns = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
    const signIndex = Math.floor((((longitude % 360) + 360) % 360) / 30);
    const degree = Math.floor(longitude % 30);
    return `${zodiacSigns[signIndex]} ${degree}°`;
  };

  const parseAspects = (aspectStrings: string[]) => {
    try {
      return aspectStrings.map((aspect) => {
        if (typeof aspect === 'object') return aspect as unknown as { aspectType: string; orb: number };
        return JSON.parse(aspect) as { aspectType: string; orb: number };
      });
    } catch {
      return [];
    }
  };

  const currentSignGlyph = formatPosition(scene.currentLongitude).split(' ')[0];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-[var(--bg-main)] rounded-3xl border border-[var(--color-ring-bronze)]/20 text-[var(--text-main)] shadow-sm antialiased transition-colors duration-300">
      
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-5 bg-white dark:bg-[var(--color-primary-dark)]/40 rounded-2xl border border-[var(--color-ring-bronze)]/10 shadow-sm mb-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-xl bg-[var(--color-primary-dark)] dark:bg-[var(--color-primary-light)] flex items-center justify-center text-white dark:text-[var(--color-primary-dark)] text-xl md:text-2xl shadow-md shadow-black/5">
            {currentSignGlyph}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-0.5">
              <Compass size={13} className="text-[var(--color-accent-orange)] animate-[spin_12s_linear_infinite]" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest block truncate">Orbital System Active</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase truncate">
              {scene.planet}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-center justify-between sm:justify-end">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-accent-orange)]/10 px-3 py-2 border border-[var(--color-accent-orange)]/20 shrink-0">
            <Zap size={14} className="text-[var(--color-accent-orange)] fill-[var(--color-accent-orange)]/20" />
            <span className="text-xs font-bold text-[var(--color-accent-orange)]">
              {Math.round(scene.intensity)}% Intensity
            </span>
          </div>
          
          {onRecalculate && (
            <button
              type="button"
              onClick={() => onRecalculate(scene.id)}
              disabled={isRecalculating}
              className="rounded-xl bg-[var(--color-primary-dark)] dark:bg-[var(--color-primary-light)] px-4 py-2 text-xs font-bold text-white dark:text-[var(--color-primary-dark)] transition-all hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              {isRecalculating ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <RotateCcw size={13} />
                  <span>Sync</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Bento Layout Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        
        {/* Core Astrological Coordinates Grid (Bento Box 1) */}
        <div className="md:col-span-2 lg:col-span-7 bg-white dark:bg-[var(--color-primary-dark)]/20 border border-[var(--color-ring-bronze)]/10 rounded-2xl p-4 md:p-5 shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Sign & Element', value: scene.sign, highlight: true },
            { label: 'House Placement', value: `House ${scene.house}` },
            { label: 'Delta Motion', value: `${scene.movementDegrees > 0 ? "▲" : "▼"} ${Math.abs(scene.movementDegrees).toFixed(2)}°`, isDelta: true },
            { label: 'Natal Position', value: formatPosition(scene.natalLongitude) },
            { label: 'Transit Position', value: formatPosition(scene.currentLongitude) },
            { 
              label: 'Collapse Risk', 
              value: `${scene.collapseRisk || 0}%`, 
              isRisk: true, 
              riskVal: scene.collapseRisk || 0 
            }
          ].map((item, i) => {
            const hasHighRisk = item.isRisk && item.riskVal > 40;
            return (
              <div 
                key={i} 
                className={`rounded-xl p-3 border flex flex-col justify-between min-h-[76px] transition-all duration-200 ${
                  hasHighRisk 
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400' 
                    : item.highlight 
                    ? 'bg-[var(--color-primary-dark)] dark:bg-[var(--color-primary-light)] text-white dark:text-[var(--color-primary-dark)] border-transparent' 
                    : 'bg-neutral-50/60 dark:bg-neutral-900/10 border-[var(--color-ring-bronze)]/10 hover:border-[var(--color-ring-bronze)]/30'
                }`}
              >
                <p className={`text-[9px] font-bold uppercase tracking-wider ${
                  item.highlight ? 'text-white/60 dark:text-[var(--color-primary-dark)]/60' : hasHighRisk ? 'text-red-500' : 'text-[var(--text-muted)]'
                }`}>
                  {item.label}
                </p>
                <p className={`text-sm md:text-base font-black tracking-tight ${
                  item.isDelta ? (scene.movementDegrees > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400') : ''
                }`}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Psychological Load Factors (Bento Box 2) - Configured for full grid integration */}
        <div className="md:col-span-2 lg:col-span-5 flex flex-col">
          <PsychologicalLoadFactors
            sceneId={scene.id}
            scene={scene}
            sceneAttributes={scene.sceneAttributes}
          />
        </div>

        {/* Narrative Engine Blueprint (Bento Box 3) */}
        <div className="md:col-span-2 lg:col-span-7 bg-white dark:bg-[var(--color-primary-dark)]/20 border border-[var(--color-ring-bronze)]/10 rounded-2xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--color-ring-bronze)]/10">
            <Award size={14} className="text-[var(--text-muted)]" />
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">Narrative Engine Blueprint</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Dominant Pressure', value: scene.dominantPressure, tone: 'text-[var(--color-accent-orange)] bg-[var(--color-accent-orange)]/5 border-[var(--color-accent-orange)]/10' },
              { label: 'Behavioral Pattern', value: scene.behavioralPattern, tone: 'bg-neutral-50/60 dark:bg-neutral-900/10 border-[var(--color-ring-bronze)]/10' },
              { label: 'Structural Function', value: scene.storyFunction, tone: 'bg-neutral-50/60 dark:bg-neutral-900/10 border-[var(--color-ring-bronze)]/10' }
            ].map((item, i) => item.value && (
              <div key={i} className={`p-3 rounded-xl border ${item.tone} flex flex-col justify-between gap-1`}>
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">{item.label}</p>
                <p className="text-xs font-semibold leading-relaxed tracking-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Angular Harmonics (Bento Box 4) */}
        <div className="md:col-span-2 lg:col-span-5 bg-white dark:bg-[var(--color-primary-dark)]/20 border border-[var(--color-ring-bronze)]/10 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-ring-bronze)]/10">
              <ShieldAlert size={14} className="text-[var(--text-muted)]" />
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">Active Angular Harmonics</h4>
            </div>
            
            {scene.activeAspects?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {parseAspects(scene.activeAspects).map((aspect, idx) => (
                  <div key={idx} className="rounded-xl bg-neutral-50/60 dark:bg-neutral-900/10 border border-[var(--color-ring-bronze)]/10 px-2.5 py-1.5 text-xs font-bold flex items-center gap-2 transition-colors hover:border-[var(--color-ring-bronze)]/30">
                    <span className="uppercase tracking-wider text-[var(--color-accent-orange)] font-black">{aspect.aspectType}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--color-ring-bronze)]/40" />
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">{aspect.orb.toFixed(1)}° Orb</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 text-xs text-[var(--text-muted)] italic">
                No active harmonic aspects found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};