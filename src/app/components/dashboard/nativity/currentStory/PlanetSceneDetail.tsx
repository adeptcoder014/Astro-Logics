import React from 'react';
import { Loader2, RotateCcw, Globe, Activity, Zap, Compass } from 'lucide-react';

export const  PlanetSceneDetail = ({
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
      <div className="rounded-[2rem] border-2 border-dashed border-[var(--color-primary-light)] bg-[var(--bg-main)] p-12 text-center shadow-xl transition-colors duration-500">
        <div className="flex flex-col items-center gap-4 opacity-40">
          <Globe size={48} strokeWidth={1} className="text-[var(--color-primary-dark)]" />
          <p className="text-sm font-mono uppercase tracking-[.25em] text-[var(--color-primary-dark)] font-black">
            Select a planet to inspect its orbital data.
          </p>
        </div>
      </div>
    );
  }





const formatPosition = (longitude: number) => {
  const zodiacSigns = [
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
    "♑",
    "♒",
    "♓",
  ];
  const signIndex = Math.floor((((longitude % 360) + 360) % 360) / 30);
  const degree = Math.floor(longitude % 30);
  return `${zodiacSigns[signIndex]} ${degree}°`;
};

const parseAspects = (aspectStrings: string[]) => {
  try {
    return aspectStrings.map((aspect) => JSON.parse(aspect));
  } catch {
    return [];
  }
};




  return (
    <div className="rounded-[2rem] border border-[var(--color-ring-bronze)]/30 bg-[var(--bg-main)] p-8 shadow-2xl transition-colors duration-500 relative overflow-hidden">
      {/* Visual Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-[var(--color-accent-orange)]" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-black">Orbital Spec Sheet</p>
          </div>
          <h3 className="text-4xl font-black text-[var(--color-primary-dark)] tracking-tighter uppercase">
            {scene.planet}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-accent-glow)]/20 px-4 py-2 border border-[var(--color-accent-glow)]/30 shadow-sm">
            <Zap size={14} className="text-[var(--color-primary-dark)]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-primary-dark)]">
              {Math.round(scene.intensity)}% Intensity
            </span>
          </div>
          {onRecalculate && (
            <button
              type="button"
              onClick={() => onRecalculate(scene.id)}
              disabled={isRecalculating}
              className="rounded-2xl bg-[var(--color-primary-dark)] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-light)] transition-all hover:bg-[var(--color-accent-orange)] hover:text-white shadow-lg flex items-center gap-2 active:scale-95"
            >
              {isRecalculating ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <>
                  <RotateCcw size={12} />
                  <span>Sync Orbits</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Metric Grid: Moon Cream Backgrounds */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-[11px]">
        {[
          { label: 'Sign', value: scene.sign },
          { label: 'House', value: scene.house },
          { label: 'Natal Longitude', value: formatPosition(scene.natalLongitude) },
          { label: 'Transit Longitude', value: formatPosition(scene.currentLongitude) },
          { label: 'Motion', value: `${scene.movementDegrees > 0 ? "+" : ""}${scene.movementDegrees.toFixed(2)}°`, highlight: true },
          { label: 'Collapse Risk', value: `${scene.collapseRisk || "N/A"}%`, risk: true }
        ].map((item, i) => (
          <div key={i} className="rounded-2xl bg-[var(--color-primary-light)] p-5 border border-[var(--color-ring-bronze)]/10 shadow-inner group hover:border-[var(--color-accent-orange)]/30 transition-colors">
            <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)] mb-2 font-black italic">{item.label}</p>
            <p className={`text-sm font-black tracking-tight ${item.risk ? 'text-[var(--color-accent-orange)]' : 'text-[var(--color-primary-dark)]'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Narrative & Vector Analysis: Deep Cosmic Contrast */}
      <div className="mt-8 grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border-l-2 border-[var(--color-accent-orange)] pl-4">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-black mb-3">Narrative Drivers</h4>
            <div className="space-y-4">
              {[
                { label: 'Dominant Pressure', value: scene.dominantPressure },
                { label: 'Behavioral Pattern', value: scene.behavioralPattern },
                { label: 'Story Function', value: scene.storyFunction }
              ].map((item, i) => item.value && (
                <div key={i}>
                  <p className="text-[9px] font-mono uppercase text-[var(--color-accent-orange)] mb-1 opacity-80">{item.label}</p>
                  <p className="text-sm font-serif italic text-[var(--text-main)] leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {scene.sceneAttributes?.vectorState && (
            <div className="rounded-3xl bg-[var(--color-primary-dark)] p-6 shadow-xl border border-white/10">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                <Activity size={14} className="text-[var(--color-accent-glow)]" />
                <h4 className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-primary-light)] font-black">Psychological Vectors</h4>
              </div>
              <div className="grid grid-cols-1 gap-3 font-mono text-[10px]">
                {Object.entries(scene.sceneAttributes.vectorState).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-[var(--color-primary-light)]/80">
                    <span className="capitalize opacity-60">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                       <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[var(--color-accent-glow)] shadow-[0_0_8px_var(--color-accent-glow)]" 
                            style={{ width: `${Math.min(100, Number(value) * 100)}%` }} 
                          />
                       </div>
                       <span className="font-black text-[var(--color-accent-glow)] w-6 text-right">
                         {typeof value === 'number' ? value.toFixed(1) : value}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scene.sceneAttributes?.cognitiveVector && (
            <div className="rounded-3xl bg-[var(--color-primary-dark)] p-6 shadow-xl border border-white/10">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                <Zap size={14} className="text-[var(--color-accent-glow)]" />
                <h4 className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-primary-light)] font-black">Planetary Cognitive Vector</h4>
              </div>
              <div className="grid grid-cols-1 gap-3 font-mono text-[10px]">
                {Object.entries(scene.sceneAttributes.cognitiveVector).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-[var(--color-primary-light)]/80">
                    <span className="capitalize opacity-60">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                       <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[var(--color-accent-glow)] shadow-[0_0_8px_var(--color-accent-glow)]" 
                            style={{ width: `${Math.min(100, Number(value) * 100)}%` }} 
                          />
                       </div>
                       <span className="font-black text-[var(--color-accent-glow)] w-6 text-right">
                         {typeof value === 'number' ? value.toFixed(2) : value}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scene.activeAspects?.length ? (
            <div className="pt-2">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-black mb-4">Active Aspects</p>
              <div className="flex flex-wrap gap-2">
                {parseAspects(scene.activeAspects).map((aspect, idx) => (
                  <div key={idx} className="rounded-xl bg-[var(--color-accent-orange)] px-4 py-2 text-[10px] text-white flex items-center gap-3 shadow-md">
                    <span className="font-black uppercase tracking-widest">{aspect.aspectType}</span>
                    <div className="w-[1px] h-3 bg-white/30" />
                    <span className="font-mono">{aspect.orb.toFixed(1)}°</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};