'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import {
  Activity,
  Clock,
  Calendar,
  Layers,
  ChevronLeft,
  Flame,
  Compass,
  AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import CastCards from '../../../components/dashboard/CastCards'; // Adjust paths based on your architecture structure
import Layout from '../../../components/Layout';

export default function CurrentStoryDetailsPage() {
  const params = useParams();
  const router = useRouter();

  // Extract strict story runtime ID parameter string safely
  const storyId = typeof params?.id === 'string' ? params.id : '6a1a8ec1880574e3556fad8b';

  // --- Core Engine tRPC API Queries ---
  const { data: currentStory, isLoading: storyLoading } = api.nativity.getCurrentStory.useQuery(
    { storyId },
    { enabled: !!storyId }
  );

  const { data: planetaryScenes, isLoading: scenesLoading } = api.nativity.getPlanetaryScenes.useQuery(
    { currentStoryId: storyId },
    { enabled: !!storyId }
  );

  // --- Shared Navigation State Controls ---
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('');

  const story = currentStory || {};
  const scenes = planetaryScenes || [];

  // Automate primary actor tracking selection selection array on hydrate
  useEffect(() => {
    if (scenes && scenes.length > 0) {
      setSelectedPlanetId(scenes[0]._id);
    }
  }, [scenes]);

  if (storyLoading || scenesLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[var(--color-primary-dark)] text-white/40 gap-4">
        <div className="h-10 w-10 animate-spin rounded-xl border-2 border-[var(--color-accent-orange)] border-t-transparent shadow-[0_0_15px_rgba(209,122,56,0.2)]" />
        <span className="font-roboto text-xs uppercase tracking-[0.25em] animate-pulse">Synchronizing State Space...</span>
      </div>
    );
  }

  // --- Text Serialization Cleaners ---
  const cleanNarrativeText = story?.mainNarrative
    ? story.mainNarrative.replace(/\*\*[^*]+\*\*/g, '').trim()
    : 'No active architectural narrative records fetched for this configuration state.';

  const activeThemes = story.themes || ["Deadline Pressure", "Responsibility Expansion", "Resource Fragmentation"];
  const currentActiveScene = scenes.find(s => s._id === selectedPlanetId);

  return (
    <Layout>
      <div className="w-full min-h-screen bg-[var(--color-primary-dark)] text-white font-roboto p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">

        {/* ================= HEADER CONTROL BAR ================= */}
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 text-xs font-bold text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft size={14} /> Back to Deck
          </button>
          <span className="text-[10px] text-white/30 tracking-widest uppercase font-roboto">
            Engine Instance ID // {storyId.slice(0, 8)}...
          </span>
        </div>

        {/* ================= THEATRICAL HERO SNAP ================= */}
        <div className="w-full relative min-h-[460px] sm:min-h-[420px] rounded-2xl overflow-hidden bg-slate-950 border border-white/5 flex flex-col justify-end p-6 sm:p-10 md:p-14 shadow-2xl group">
  
  {/* --- CAST CHARACTER ACTION ZONE --- */}
  {/* Widescreen locks the character frame to the right half; mobile opens it up full-screen */}
  <div className="absolute inset-y-0 right-0 w-full md:w-[55%] z-0 select-none pointer-events-none overflow-hidden rounded-r-2xl">
    
    {/* Action Shot Image Layer */}
    <Image
      src={'/scene.jpg'}
      fill
      alt="Cast Member Action Close-up"
      /* object-top preserves facial features; group-hover adds a subtle dramatic camera-zoom effect */
      className="object-cover object-center md:object-top opacity-90 transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
      priority
    />

    {/* Edge-Feathering Mask: Seamlessly melts the left edge of the character image into the dark UI text block */}
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent hidden md:block" />
    
    {/* Bottom Vignette Mask: Prevents the lower half of the action shot from fighting with mobile text layouts */}
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent md:hidden" />

    {/* Cybernetic Edge Glow Rim (Highlights the character's side profile) */}
    <div className="absolute inset-y-0 left-0 w-[80px] bg-gradient-to-r from-slate-950 to-transparent hidden md:block" />

    {/* Color Dodge Backlight Flare (Simulates dramatic studio lighting behind the character headshot) */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(56,189,248,0.15)_0%,transparent_60%)] mix-blend-color-dodge" />
  </div>

  {/* --- CINEMATIC TEXT READABILITY UNDERLAYS --- */}
  {/* Solid foundational shadow depth to guarantee the typography passes absolute accessibility checks */}
  <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/80 to-transparent md:via-black/20" />
  <div className="absolute inset-y-0 left-0 w-full md:w-[60%] z-[1] bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent hidden md:block" />

  {/* --- UI INTERFACE STACK OVERLAY --- */}
  <div className="relative z-10 max-w-xl lg:max-w-2xl space-y-4 text-left">
    <div className="flex flex-wrap items-center gap-2">
      <div className="bg-[var(--color-accent-orange)] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm tracking-widest shadow-lg border border-orange-500/20">
        LIVE TRACK
      </div>
      {story.intensity && (
        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] font-mono text-white/90 flex items-center gap-1.5 shadow-md">
          <Flame size={12} className="text-[var(--color-accent-orange)] animate-pulse" />
          INTENSITY CRITERIA // <span className="text-[var(--color-accent-orange)] font-bold">{story.intensity}</span>
        </div>
      )}
    </div>

    <div className="space-y-2">
      <span className="text-[var(--color-accent-orange)] font-mono text-[10px] font-black uppercase tracking-[0.35em] flex items-center gap-2 drop-shadow-sm">
        <Activity size={12} className="text-sky-400 animate-pulse" /> SYSTEM SYSTEMIC NATIVITY RUN
      </span>
      {/* Tight tracking and custom line-height mirror professional film title cards */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.85] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
        {story.title || "Overcommitting"}
      </h1>
    </div>
  </div>
  
  {/* Bottom Cinematic Accent Bar */}
  <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent-orange)]/40 to-transparent opacity-70" />
</div>

        {/* ================= MAIN MATRIX SPLIT LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left 2 Columns: Narratives & Structural Controls */}
          <div className="lg:col-span-2 space-y-8">

            {/* Main Narrative Block */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 flex items-center gap-2">
                <Compass size={12} /> Logline Overview
              </h3>
              <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed bg-white/[0.01] border border-white/5 p-6 rounded-xl shadow-2xl tracking-wide">
                {cleanNarrativeText}
              </p>
            </div>

            {/* INVERTED MATRIX SUB-NAVIGATION PILLS ROW */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                Active Environment Node Selector
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {scenes.map((scene) => {
                  const isSelected = scene._id === selectedPlanetId;
                  return (
                    <button
                      key={scene._id}
                      onClick={() => setSelectedPlanetId(scene._id)}
                      className={`px-5 py-3 rounded-xl border text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer
                        ${isSelected
                          ? 'bg-white/90 text-[var(--color-primary-dark)] border-[var(--color-accent-orange)] shadow-md scale-[1.02]'
                          : 'bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] border border-white/10 hover:bg-white/5 hover:border-[var(--color-accent-orange)]'
                        }`}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-[var(--color-primary-dark)]/60' : 'bg-[var(--color-accent-orange)]'}`} />
                      {scene.planet}
                      <span className={`text-[10px] font-roboto font-medium lowercase tracking-normal px-1.5 py-0.5 rounded ${isSelected
                        ? 'bg-[var(--color-primary-dark)]/10 text-[var(--color-primary-dark)]/80'
                        : 'bg-white/10 text-[var(--color-accent-glow)]'
                        }`}>
                        {scene.storyFunction || 'driver'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Inspect Data Panel Module */}
            {currentActiveScene && (
              <div className="bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 rounded-xl p-6 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                  <span className="text-xs font-black text-[var(--color-accent-orange)] uppercase tracking-widest">
                    Blueprint Realtime Specs // {currentActiveScene.planet}
                  </span>
                  {currentActiveScene.collapseRisk && (
                    <span className="text-[10px] font-roboto text-white/40 flex items-center gap-1.5">
                      <AlertTriangle size={11} className="text-amber-500" />
                      RISK VALUE: <span className="text-white font-bold">{currentActiveScene.collapseRisk}%</span>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                  <div className="space-y-1">
                    <span className="text-white/30 text-[9px] uppercase tracking-widest block">Behavioral Blueprint Script</span>
                    <p className="text-white/80 font-medium">{currentActiveScene.behavioralPattern || "No behavioral overrides flagged."}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/30 text-[9px] uppercase tracking-widest block">Structural Pressure Point</span>
                    <p className="text-white/80 italic font-medium">"{currentActiveScene.dominantPressure || "Load balanced normally."}"</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Temporal Tracking Metadata & Alpha Themes Layout */}
          <div className="space-y-6">

            {/* Temporal Alignment Block */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4 text-xs">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 block">Temporal Tracking Metrics</span>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1.5 border-b border-white/[0.05]">
                  <span className="text-white/40 flex items-center gap-2"><Calendar size={13} /> Target Window</span>
                  <span className="text-white font-medium">{story.transitWindow || "May 28 - June 15"}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/[0.05]">
                  <span className="text-white/40 flex items-center gap-2"><Clock size={13} /> TTL Threshold</span>
                  <span className="text-amber-500 font-bold">{story.timeRemaining || "12 Days Remaining"}</span>
                </div>
              </div>
            </div>

            {/* Active Experience Alpha Themes Cards Stack */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-[var(--color-accent-orange)]" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                  Core Alpha Themes Map
                </h3>
              </div>
              <div className="space-y-2.5">
                {activeThemes.map((themeName, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-white/[0.02] to-transparent border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-white/10 transition-colors"
                  >
                    <span className="text-sm font-bold uppercase text-white tracking-wide">{themeName}</span>
                    <span className="text-[9px] text-white/20 font-bold">0{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ================= COMPACT CAST GRAPH MODULARS ROW ================= */}
        <div className="pt-4 border-t border-white/[0.04]">
          <CastCards
            currentStoryId={storyId}
            selectedPlanetId={selectedPlanetId}
            onSelectPlanet={setSelectedPlanetId}
          />
        </div>

      </div>
    </Layout>
  );
}