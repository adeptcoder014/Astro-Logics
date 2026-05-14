import React from 'react';
import { AlignLeft, Sparkles, Loader2 } from 'lucide-react';

const ScriptEmptyState = ({
  onGenerate,
  isGenerating,
  label,
}: {
  onGenerate: () => void;
  isGenerating: boolean;
  label: string;
}) => {
  const isThemeMode = label === "Generate Theme";

  return (
    <div className="h-full min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[var(--bg-main)] border-2 border-dashed border-[var(--color-primary-light)] rounded-[2.5rem] group transition-colors duration-500">
      
      {/* Visual Anchor: Icon with the soft blue atmospheric aura */}
      <div className="relative mb-10">
        <div className="absolute inset-0 blur-3xl bg-[var(--color-accent-glow)] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
        <AlignLeft 
          size={80} 
          strokeWidth={0.5} 
          className="relative text-[var(--color-primary-dark)] opacity-30 group-hover:opacity-100 transition-all duration-1000 -rotate-6 group-hover:rotate-0" 
        />
      </div>

      {/* Narrative Messaging */}
      <div className="text-center space-y-4 mb-12 max-w-sm relative z-10">
        <h2 className="font-black text-2xl uppercase tracking-[0.4em] text-[var(--color-primary-dark)]">
          {isThemeMode ? "Void of Course" : "Manuscript Pending"}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <div className="h-[1px] w-4 bg-[var(--color-accent-orange)] opacity-50" />
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase leading-relaxed tracking-[0.2em] font-bold">
            {isThemeMode 
              ? "No celestial resonance detected. Sync transits to extract theme." 
              : "Configuration set. Awaiting sequence generation."
            }
          </p>
          <div className="h-[1px] w-4 bg-[var(--color-accent-orange)] opacity-50" />
        </div>
      </div>

      {/* Action: Cinematic Button using the Brand Gradient */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="relative overflow-hidden px-14 py-6 rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-xl hover:shadow-[var(--color-accent-glow)]/20"
        style={{ background: 'var(--brand-gradient)' }}
      >
        <div className="relative z-10 flex items-center gap-4 text-[var(--color-primary-light)]">
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin text-[var(--color-accent-glow)]" />
              <span className="font-black text-xs tracking-[0.3em]">COMPUTING ORBITS...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="group-hover/btn:rotate-12 transition-transform" />
              <span className="font-black text-xs tracking-[0.3em]">{label.toUpperCase()}</span>
            </>
          )}
        </div>
        
        {/* Atmospheric Overlay on Hover */}
        <div className="absolute inset-0 bg-[var(--color-primary-dark)] opacity-0 group-hover/btn:opacity-10 transition-opacity" />
        
        {/* Shimmer effect */}
        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-[var(--color-primary-light)]/20 to-transparent transition-all duration-1000 group-hover/btn:left-[100%]" />
      </button>

      {/* Decorative Technical Detail: Bronze Metallic Tones */}
      <div className="mt-16 flex items-center gap-6 opacity-40">
        <div className="h-[1px] w-12 bg-[var(--color-ring-bronze)]" />
        <span className="text-[9px] font-mono text-[var(--color-primary-dark)] font-black uppercase tracking-[0.5em]">
          Awaiting Input
        </span>
        <div className="h-[1px] w-12 bg-[var(--color-ring-bronze)]" />
      </div>
    </div>
  );
};

export default ScriptEmptyState;