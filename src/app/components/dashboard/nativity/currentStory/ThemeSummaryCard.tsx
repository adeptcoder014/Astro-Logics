import React from 'react';
import { Loader2, RotateCcw, Compass } from 'lucide-react';

const ThemeSummaryCard = ({
  themes,
  onRecalculate,
  isRecalculating,
}: {
  themes?: string[];
  onRecalculate?: () => void;
  isRecalculating?: boolean;
}) => (
  <div className="rounded-[2rem] border border-[var(--color-ring-bronze)]/30 bg-[var(--bg-main)] p-6 shadow-xl transition-colors duration-500">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Compass size={14} className="text-[var(--color-accent-orange)]" />
        <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-black">Story Themes</p>
      </div>
      
      {onRecalculate && (
        <button
          type="button"
          onClick={onRecalculate}
          disabled={isRecalculating}
          className="rounded-xl bg-[var(--color-primary-dark)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-light)] transition-all hover:bg-[var(--color-accent-orange)] hover:text-white disabled:opacity-50 flex items-center gap-2 shadow-md"
        >
          {isRecalculating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <>
              <RotateCcw size={12} />
              <span>Recalc</span>
            </>
          )}
        </button>
      )}
    </div>

    {themes?.length ? (
      <div className="space-y-3 text-sm">
        {themes.map((theme, idx) => (
          <div 
            key={idx} 
            className="group relative rounded-2xl bg-[var(--color-primary-light)] px-5 py-4 border border-[var(--color-ring-bronze)]/10 shadow-inner transition-all hover:border-[var(--color-accent-glow)]/40"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[var(--color-accent-orange)] opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full" />
            <p className="font-serif italic text-[var(--color-primary-dark)] leading-snug">
              {theme}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-[var(--color-ring-bronze)]/40 p-6 text-center">
        <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
          No theme data mapped to current orbits.
        </p>
      </div>
    )}
  </div>
);

export default ThemeSummaryCard;