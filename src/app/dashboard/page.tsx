'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import {
  ArrowRight,
  Activity,
  BookOpen,
  Compass,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import Layout from '../components/Layout';
import CurrentStoryHero from '../components/dashboard/CurrentStoryHero';

export default function AstroLogicsHomeScreen() {
  const router = useRouter();

  // --- tRPC API Queries ---
  const { data: currentStory, isLoading: storyLoading } = api.nativity.getCurrentStory.useQuery({ storyId: '6a1a8ec1880574e3556fad8b' });
  const { data: planetaryScenes, isLoading: scenesLoading } = api.nativity.getPlanetaryScenes.useQuery({ currentStoryId: '6a1a8ec1880574e3556fad8b' });

  // Fallbacks using your exact data schema shapes
  const story = currentStory || {}
  const scenes = planetaryScenes || [];

  // --- State for tracking selected Architectural Driver ---
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('');
  console.log(selectedPlanetId)
  // Auto-select the first driver once data arrives
  useEffect(() => {
    if (scenes && scenes.length > 0) {
      setSelectedPlanetId(scenes[0]._id);
    }
  }, [scenes]);

  if (storyLoading || scenesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-primary-light)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-accent-orange)] border-t-transparent" />
      </div>
    );
  }

  // Find the complete scene payload match based on selected label ID
  const activeScene = scenes.find(s => s._id === selectedPlanetId) || scenes[0];

  return (
    <Layout>
      <div className="bg-[var(--color-primary-light)]  mx-auto space-y-2">
        <CurrentStoryHero />


        {/* ================= 1. TOP NAV SECTION: LABELS SELECTOR ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent-orange)]">
              Active Architectural Drivers // Click to Inspect Target
            </p>
            <span className="text-[10px] font-mono opacity-50">{scenes.length} Forces Present</span>
          </div>

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
                      : 'bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] border-[var(--color-ring-bronze)]/30 hover:bg-white/5 hover:border-[var(--color-accent-orange)]'
                    }`}
                >
                  {/* Status Indicator Dot */}
                  <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-[var(--color-primary-dark)]/60' : 'bg-[var(--color-accent-orange)]'}`} />

                  {scene.planet}

                  {/* Micro System Function Tag */}
                  <span className={`text-[10px] font-mono font-medium lowercase tracking-normal px-1.5 py-0.5 rounded ${isSelected
                      ? 'bg-[var(--color-primary-dark)]/10 text-[var(--color-primary-dark)]/80'
                      : 'bg-white/10 text-[var(--color-accent-glow)]'
                    }`}>
                    {scene.storyFunction}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= 2. BENTO CENTER MODULE ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

          {/* HERO STORY CONTAINER (2 Columns Wide) */}
          <div className="xl:col-span-2 bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[440px]">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[var(--color-accent-glow)] rounded-full opacity-10 blur-3xl" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-accent-orange)] text-[var(--color-accent-orange)] text-xs font-bold uppercase tracking-wider bg-[var(--color-accent-orange)]/10">
                  <Sparkles size={12} /> Live Narrative Theme: {story.theme}
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
                  {story.title}
                </h1>
                <p className="text-[var(--color-primary-light)]/80 text-base md:text-lg max-w-2xl font-normal leading-relaxed">
                  {story.mainNarrative.replace(/\*\*[^*]+\*\*/g, '')}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 mt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => router.push('/dashboard/story')}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent-orange)] hover:text-white transition-colors group/btn"
              >
                View Full Story <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>

          {/* DYNAMIC SPOLIGHT CARD: READS SELECTOR STATE VALUES LIVE */}
          {activeScene && (
            <div className="bg-white/90 backdrop-blur-md border border-[var(--color-accent-orange)] rounded-2xl p-6 shadow-md flex flex-col justify-between min-h-[440px] transition-all duration-300">

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--color-ring-bronze)]/20 pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-mono opacity-50 block tracking-wider">Driver Spotlight</span>
                    <h3 className="text-2xl font-black tracking-tight text-[var(--color-primary-dark)]">{activeScene.planet}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-mono opacity-50 block tracking-wider">Dynamic Function</span>
                    <span className="text-xs font-mono font-bold text-[var(--color-accent-orange)] uppercase tracking-wide">{activeScene.storyFunction}</span>
                  </div>
                </div>

                {/* Operational Scripts Map */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] uppercase font-mono opacity-40 block tracking-wider mb-1">Active Behavioral Script</span>
                    <p className="text-sm font-bold text-[var(--text-main)] leading-snug">{activeScene.behavioralPattern}</p>
                  </div>

                  <div className="bg-[var(--color-primary-light)]/30 border-l-2 border-[var(--color-accent-orange)] p-3 rounded-r-lg">
                    <span className="text-[9px] uppercase font-mono opacity-50 block tracking-wider mb-0.5">Environmental Tension</span>
                    <p className="text-xs text-[var(--text-muted)] italic font-medium leading-normal">
                      "{activeScene.dominantPressure}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Crash / Threshold Progress Ring Bar */}
              <div className="pt-5 border-t border-[var(--color-ring-bronze)]/20 mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-mono opacity-40 block tracking-wider">Systemic Failure Vector</span>
                    <span className="text-sm font-mono font-black">Collapse Risk: {activeScene.collapseRisk}%</span>
                  </div>
                  <div className={`p-2 rounded-lg ${activeScene.collapseRisk >= 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <ShieldAlert size={18} />
                  </div>
                </div>
                <div className="w-full bg-[var(--color-primary-dark)]/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${activeScene.collapseRisk >= 50 ? 'bg-[var(--color-accent-orange)]' : 'bg-emerald-500'}`}
                    style={{ width: `${activeScene.collapseRisk}%` }}
                  />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ================= 3. LOWER SECTION METRICS MATRIX ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white/50 backdrop-blur-sm border border-[var(--color-ring-bronze)]/30 rounded-2xl p-5 flex items-center justify-between lg:col-span-1">
            <div>
              <span className="text-[9px] uppercase font-mono opacity-40 block">Global Intensity</span>
              <span className="text-3xl font-black font-mono tracking-tight">{story.intensity}</span>
            </div>
            <div className="text-right text-xs font-mono font-bold text-[var(--color-accent-orange)] bg-[var(--color-accent-orange)]/10 px-2 py-1 rounded">
              SCALE // LIVE
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm border border-[var(--color-ring-bronze)]/30 rounded-2xl p-4 grid grid-cols-3 gap-2 lg:col-span-2">
            <div className="bg-white/60 rounded-xl p-2.5 text-center border border-black/5">
              <span className="text-[9px] font-bold opacity-50 uppercase block">Focus</span>
              <span className="text-xs font-mono font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">▲ HIGH</span>
            </div>
            <div className="bg-white/60 rounded-xl p-2.5 text-center border border-black/5">
              <span className="text-[9px] font-bold opacity-50 uppercase block">Pressure</span>
              <span className="text-xs font-mono font-bold text-[var(--color-accent-orange)] flex items-center justify-center gap-0.5 mt-0.5">▲ HIGH</span>
            </div>
            <div className="bg-white/60 rounded-xl p-2.5 text-center border border-black/5">
              <span className="text-[9px] font-bold opacity-50 uppercase block">Adaptation</span>
              <span className="text-xs font-mono font-bold text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">▼ LOW</span>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm border border-[var(--color-ring-bronze)]/30 rounded-2xl p-4 flex items-center gap-3 lg:col-span-1">
            <div className="p-2 bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] rounded-lg shrink-0">
              <BookOpen size={14} />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">
              Cosmic vectors map seamlessly to your behavioral scripts.
            </p>
          </div>
        </div>

        {/* TIMELINE INTERFACE LINK BANNER */}
        <div
          onClick={() => router.push('/dashboard/timeline')}
          className="border border-dashed border-[var(--color-ring-bronze)] hover:border-[var(--color-accent-orange)] bg-white/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-[var(--color-accent-orange)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
              Historical Timeline Interface & Temporal Filtering
            </span>
          </div>
          <span className="text-xs font-mono opacity-50 flex items-center gap-1 shrink-0">
            Coming Soon <Compass size={14} />
          </span>
        </div>

      </div>
    </Layout>
  );
}