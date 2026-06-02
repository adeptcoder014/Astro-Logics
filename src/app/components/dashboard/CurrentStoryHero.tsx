'use client';

import React from 'react';
import { api } from '~/trpc/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Flame, Activity, ChevronRight } from 'lucide-react';

export default function CurrentStoryHero() {
  const router = useRouter();
  
  // --- tRPC API Queries ---
  const { data: currentStory, isLoading: storyLoading } = api.nativity.getCurrentStory.useQuery({ 
    storyId: '6a1a8ec1880574e3556fad8b' 
  });
  const { data: planetaryScenes, isLoading: scenesLoading } = api.nativity.getPlanetaryScenes.useQuery({ 
    currentStoryId: '6a1a8ec1880574e3556fad8b' 
  });

  const story = currentStory || {};

  if (storyLoading || scenesLoading) {
    return (
      <div className="w-full h-[540px] flex items-center justify-center bg-slate-950 rounded-2xl border border-white/5">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--color-accent-orange,rgba(249,115,22,1))] border-t-transparent" />
      </div>
    );
  }

  // --- Regex String Extraction & Truncation ---
  const realityString = (() => {
    if (!story?.mainNarrative) return '';
    const match = story.mainNarrative.match(/\*\*The Reality:\*\*\s *([\s\S]*)$/i);
    const rawText = match ? match[1] : story.mainNarrative.replace(/\*\*[^*]+\*\*/g, '');

    const cleanText = rawText.replace(/\s+/g, ' ').trim();
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 0) {
      return sentences.slice(0, 2).join(' ');
    }
    return cleanText;
  })();

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* ================= MAIN HERO FRAME ================= */}
      <div className="w-full relative min-h-[500px] sm:min-h-[540px] rounded-2xl overflow-hidden bg-slate-950 border border-white/5 flex flex-col justify-end p-6 sm:p-10 md:p-16 shadow-2xl group">

        {/* --- CAST CHARACTER ACTION ZONE --- */}
        {/* Keeps close-up action images framing your cast completely viewable on the right layout sector */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[55%] z-0 select-none pointer-events-none overflow-hidden rounded-r-2xl">
          <Image
            src={'/hero.png'}
            fill
            alt="Cast Member Action Close-up"
            className="object-cover object-center md:object-top opacity-90 transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            priority
          />
          
          {/* Subtle horizontal gradient edge mask so character profile dissolves neatly into left text block */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/30 to-transparent hidden md:block" />
          
          {/* Lower layout gradient mask avoiding frame content clashes on responsive mobile viewpoints */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent md:hidden" />

          {/* Anamorphic studio light flare accent mimicking cinema poster profiles */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(56,189,248,0.15)_0%,rgba(249,115,22,0.05)_40%,transparent_75%)] mix-blend-color-dodge" />
        </div>

        {/* --- TEXT READABILITY UNDERLAY DEPTH PROTECTION --- */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/80 to-transparent md:via-black/10" />
        <div className="absolute inset-y-0 left-0 w-full md:w-[60%] z-[1] bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent hidden md:block" />


        {/* --- CONTENT TYPOGRAPHY OVERLAY INTERFACE --- */}
        <div className="relative z-10 max-w-xl lg:max-w-2xl space-y-5 text-left">
          
          {/* Meta System Track Badge Row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-[var(--color-accent-orange,#f97316)] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm tracking-widest shadow-md border border-orange-500/10">
              LIVE TRACK
            </div>
            {story.intensity && (
              <div className="bg-slate-900/65 border border-white/10 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] font-mono text-white/90 flex items-center gap-1.5 shadow-sm">
                <Flame size={11} className="text-[var(--color-accent-orange,#f97316)] animate-pulse" />
                INTENSITY CRITERIA // <span className="text-[var(--color-accent-orange,#f97316)] font-bold">{story.intensity}</span>
              </div>
            )}
          </div>

          {/* Main Slate Identifiers */}
          <div className="space-y-2.5">
            <span className="text-[var(--color-accent-orange,#f97316)] font-mono text-[10px] font-black uppercase tracking-[0.35em] flex items-center gap-2 drop-shadow-sm">
              <Activity size={11} className="text-sky-400 animate-pulse" /> SYSTEM SYSTEMIC NATIVITY RUN
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.85] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              {story.title || "Enlightenment at a Cost"}
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-lg font-medium leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pt-1">
              {realityString}
            </p>
          </div>

          {/* Actions Block */}
          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={() => router.push(`/dashboard/current-story/${story.id}`)}
              className="group/btn flex items-center gap-1.5 px-5 py-2.5 bg-white text-slate-950 rounded-md font-black uppercase text-[10px] tracking-widest hover:bg-[var(--color-accent-orange,#f97316)] hover:text-white transition-all duration-300 shadow-xl active:scale-95 cursor-pointer"
            >
              Story Details
              <ChevronRight size={13} className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </button>
          </div>

        </div>

        {/* Framing Bottom Horizon Line Accent */}
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent-orange,#f97316)]/30 to-transparent opacity-60" />
      </div>

    </div>
  );
}