import React from 'react';
import { Loader2, RefreshCw, BarChart3, Activity } from 'lucide-react';

const StoryStatePanel = ({
  storyState,
  isRefreshing,
  onRefresh,
}: {
  storyState?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}) => {
  const parseStoryState = (state?: string) => {
    if (!state) return null;
    try {
      return JSON.parse(state);
    } catch {
      return { summary: state };
    }
  };

  const stateData = parseStoryState(storyState);

  return (
    <div className="rounded-[2rem] border border-[var(--color-ring-bronze)]/30 bg-[var(--bg-main)] p-6 shadow-xl flex flex-col justify-between transition-colors duration-500 min-h-[400px]">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--color-accent-orange)]" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-black">Story State</p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-xl bg-[var(--color-primary-dark)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-light)] transition-all hover:bg-[var(--color-accent-orange)] hover:text-white disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            {isRefreshing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                <RefreshCw size={12} />
                <span>Sync</span>
              </>
            )}
          </button>
        </div>

        {stateData ? (
          <div className="space-y-4 text-[11px]">
            {stateData.summary ? (
              <div className="rounded-2xl bg-[var(--color-primary-light)] p-4 border border-[var(--color-ring-bronze)]/20 shadow-inner text-[var(--color-primary-dark)]">
                <p className="font-serif italic leading-relaxed text-sm">"{stateData.summary}"</p>
              </div>
            ) : (
              <>
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Dominant Pressure', value: stateData.dominantPressure },
                    { label: 'Emotional Climate', value: stateData.emotionalClimate },
                    { label: 'Active Life Arena', value: stateData.activeLifeArena },
                    { label: 'Stability Index', value: `${stateData.stabilityIndex || 0}%` },
                  ].map((metric, i) => (
                    <div key={i} className="rounded-2xl bg-[var(--color-primary-light)] p-3 border border-[var(--color-ring-bronze)]/10">
                      <p className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-bold">{metric.label}</p>
                      <p className="font-black text-[var(--color-primary-dark)] uppercase tracking-tighter">{metric.value || 'N/A'}</p>
                    </div>
                  ))}
                </div>

                {/* Technical Insights */}
                <div className="rounded-2xl bg-[var(--color-primary-dark)] p-4 border border-white/5 text-[var(--color-primary-light)] shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={12} className="text-[var(--color-accent-glow)]" />
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black">Key Insights</p>
                  </div>
                  <div className="space-y-2 text-[10px] font-mono opacity-90">
                    <p className="flex justify-between border-b border-white/5 pb-1">
                      <span className="opacity-60 uppercase">Behavioral Momentum:</span> 
                      <span className="text-[var(--color-accent-glow)] font-bold">{stateData.behavioralMomentum || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between border-b border-white/5 pb-1">
                      <span className="opacity-60 uppercase">Narrative Phase:</span> 
                      <span className="text-[var(--color-accent-glow)] font-bold">{stateData.narrativePhase || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between border-b border-white/5 pb-1">
                      <span className="opacity-60 uppercase">Breakthrough Potential:</span> 
                      <span className="text-[var(--color-accent-orange)] font-bold">{stateData.breakthroughPotential || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                {/* Tags Section */}
                {stateData.pressureClusters?.length > 0 && (
                  <div className="pt-2 px-1">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3 font-black">Pressure Clusters</p>
                    <div className="flex flex-wrap gap-2">
                      {stateData.pressureClusters.slice(0, 3).map((cluster: string, idx: number) => (
                        <span key={idx} className="rounded-lg bg-[var(--color-accent-glow)]/20 border border-[var(--color-accent-glow)]/30 px-3 py-1 text-[9px] font-black text-[var(--color-primary-dark)] uppercase tracking-widest">
                          {cluster}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="rounded-3xl bg-[var(--color-primary-light)] border-2 border-dashed border-[var(--color-ring-bronze)]/30 p-8 text-[11px] font-black text-[var(--text-muted)] flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-[1px] bg-[var(--color-accent-orange)] opacity-50" />
            <p className="uppercase tracking-[0.2em]">Void: Awaiting State Synchronization</p>
            <div className="w-10 h-[1px] bg-[var(--color-accent-orange)] opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryStatePanel;