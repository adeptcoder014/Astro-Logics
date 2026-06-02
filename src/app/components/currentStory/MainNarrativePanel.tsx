import React from 'react';
import { Loader2, RefreshCw, PenTool, Sparkles } from 'lucide-react';

const MainNarrativePanel = ({
  narrative,
  onGenerateScript,
  onRecalculate,
  isGenerating,
}: {
  narrative?: string;
  onGenerateScript: () => void;
  onRecalculate: () => void;
  isGenerating: boolean;
}) => {
  const hasNarrative = Boolean(narrative);

  return (
    <div className="rounded-[2rem] border border-[var(--color-ring-bronze)]/30 bg-[var(--bg-main)] p-8 shadow-xl relative overflow-hidden group transition-colors duration-500">
      {/* Decorative Glow: Soft blue atmospheric aura */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-accent-glow)] opacity-10 blur-[100px] pointer-events-none" />

      <div className="mb-6 flex items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-orange)] animate-pulse shadow-[0_0_8px_var(--color-accent-orange)]" />
             <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-black">Chronicle Output</p>
          </div>
          <h3 className="text-2xl font-black text-[var(--color-primary-dark)] flex items-center gap-2 tracking-tight">
            Main Narrative
            {hasNarrative && <Sparkles size={18} className="text-[var(--color-accent-orange)]" />}
          </h3>
        </div>

        <button
          type="button"
          onClick={hasNarrative ? onRecalculate : onGenerateScript}
          disabled={isGenerating}
          className={`
            relative flex items-center gap-3 rounded-2xl px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all duration-300
            ${hasNarrative 
              ? 'bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] hover:bg-[var(--color-accent-orange)] hover:text-white shadow-md' 
              : 'bg-[var(--color-accent-orange)] text-white hover:scale-105 active:scale-95 shadow-lg'
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>{hasNarrative ? "Recalculating..." : "Scribing..."}</span>
            </>
          ) : (
            <>
              {hasNarrative ? <RefreshCw size={14} /> : <PenTool size={14} />}
              <span>{hasNarrative ? "Recalculate" : "Create Script"}</span>
            </>
          )}
        </button>
      </div>

      {/* Narrative Body: Styled like a moon-lit manuscript */}
      <div className={`
        rounded-3xl p-7 min-h-[260px] text-md leading-relaxed transition-all duration-500 border
        ${hasNarrative 
          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border-[var(--color-ring-bronze)]/20 shadow-inner' 
          : 'bg-[var(--color-primary-light)]/20 text-[var(--text-muted)] border-dashed border-[var(--color-ring-bronze)]/40 flex items-center justify-center text-center'
        }
      `}>
        {hasNarrative ? (
          <div className="whitespace-pre-wrap font-serif italic opacity-95 first-letter:text-4xl first-letter:font-black first-letter:text-[var(--color-accent-orange)] first-letter:mr-2 first-letter:float-left first-letter:leading-none">
            {narrative}
          </div>
        ) : (
          <div className="max-w-[240px] space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary-dark)] font-bold">Awaiting celestial alignment...</p>
            <p className="text-xs opacity-70 italic font-medium">Initiate the script generator to populate this panel with your transit-driven story.</p>
          </div>
        )}
      </div>

      {/* Technical Footer Detail: Nautical Instrument Vibes */}
      <div className="mt-6 flex items-center justify-between px-2">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${hasNarrative ? 'bg-[var(--color-accent-orange)]' : 'bg-[var(--color-ring-bronze)]/40'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold">
            {hasNarrative ? "Log: Confirmed" : "System: Idle"}
          </span>
          <div className="h-4 w-[1px] bg-[var(--color-ring-bronze)]/30" />
          <span className="text-[10px] font-mono text-[var(--color-accent-orange)] font-bold">v4.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default MainNarrativePanel;