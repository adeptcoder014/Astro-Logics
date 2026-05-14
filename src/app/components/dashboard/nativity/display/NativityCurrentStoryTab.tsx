"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import {
  Theater,
  Play,
  Loader,
  MapPin,
  AlignLeft,
  Clock,
  Activity,
  Menu,
  X,
  RotateCcw,
} from "lucide-react";
import ScriptEmptyState from "../currentStory/ScriptEmptyState";
import MainNarrativePanel from "../currentStory/MainNarrativePanel";
import StoryStatePanel from "../currentStory/StoryStatePanel";
import ThemeSummaryCard from "../currentStory/ThemeSummaryCard";
import { PlanetSceneDetail } from "../currentStory/PlanetSceneDetail";
import PlanetSceneButton from "../currentStory/PlanetSceneButton";
import StatCard from "../currentStory/StatCard";

// Calculate story state from planetary scenes
const calculateStoryState = (scenes: PlanetaryScene[]): string => {
  if (!scenes || scenes.length === 0) return "No scene data available.";

  // Aggregate narrative fields across all scenes
  const behaviors = scenes
    .map((s) => s.behavioralPattern)
    .filter(Boolean) as string[];
  const conflicts = scenes
    .map((s) => s.externalConflict)
    .filter(Boolean) as string[];
  const pressures = scenes
    .map((s) => s.dominantPressure)
    .filter(Boolean) as string[];
  const relationshipEffects = scenes
    .map((s) => s.relationshipEffect)
    .filter(Boolean) as string[];
  const pressureDirections = scenes
    .map((s) => s.pressureDirection)
    .filter(Boolean) as string[];

  // Calculate average intensity
  const avgIntensity =
    scenes.length > 0
      ? Math.round(scenes.reduce((sum, s) => sum + s.intensity, 0) / scenes.length)
      : 0;

  // Build state summary
  const stateLines: string[] = [];

  if (behaviors.length > 0) {
    stateLines.push(`Behavioral: ${behaviors.slice(0, 2).join(", ")}`);
  }

  if (conflicts.length > 0) {
    stateLines.push(`Conflicts: ${conflicts.slice(0, 2).join(", ")}`);
  }

  if (pressures.length > 0) {
    stateLines.push(`Pressures: ${pressures.slice(0, 2).join(", ")}`);
  }

  if (relationshipEffects.length > 0) {
    stateLines.push(`Relations: ${relationshipEffects.slice(0, 1).join(", ")}`);
  }

  if (pressureDirections.length > 0) {
    stateLines.push(`Pressure Direction: ${pressureDirections.slice(0, 1).join(", ")}`);
  }

  // Add intensity
  stateLines.push(`Intensity: ${avgIntensity}%`);

  return stateLines.length > 0
    ? stateLines.join(" | ")
    : "State computed from scenes.";
};

interface PlanetaryScene {
  id: string;
  createdAt: string;
  overallIntensity: number;
  themes?: string[];
  mainNarrative?: string;
  storyState?: string | Record<string, any>;
  scenes: PlanetaryScene[];
}

interface CurrentStoryTabProps {
  nativityChartId: string;
  userLocation?: { latitude: number; longitude: number; timeZone?: string };
}

const normalizeStoryState = (storyState?: string | Record<string, any>) => {
  if (!storyState) return undefined;
  if (typeof storyState === "string") return storyState;

  return JSON.stringify(storyState, null, 0);
};

export default function NativityCurrentStoryTab({
  nativityChartId,
  userLocation: propUserLocation,
}: CurrentStoryTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRecalculatingScenes, setIsRecalculatingScenes] = useState(false);
  const [isRecalculatingThemes, setIsRecalculatingThemes] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState(propUserLocation ?? null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [computedStoryState, setComputedStoryState] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (propUserLocation) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        null,
        { timeout: 10000 },
      );
    }
  }, [propUserLocation]);

  const { data: stories, refetch: refetchStories } =
    api.nativity.getCurrentStories.useQuery({ nativityChartId });
  const generateStoryMutation = api.nativity.generateCurrentStory.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      refetchStories();
    },
  });
  const generateMainNarrativeMutation = api.nativity.generateMainNarrative.useMutation({
    onSuccess: () => {
      setIsGenerating(false);
      refetchStories();
    },
  });
  const recalculateScenessMutation = api.nativity.recalculatePlanetaryScenes.useMutation({
    onSuccess: () => {
      setIsRecalculatingScenes(false);
      refetchStories();
    },
    onError: (error) => {
      console.error('Failed to recalculate scenes:', error);
      setIsRecalculatingScenes(false);
    },
  });
  const recalculateSingleSceneMutation = api.nativity.recalculateSingleScene.useMutation({
    onSuccess: () => {
      setIsRecalculatingScenes(false);
      refetchStories();
    },
    onError: (error) => {
      console.error('Failed to recalculate single scene:', error);
      setIsRecalculatingScenes(false);
    },
  });

  const refreshCurrentStoryStateMutation = api.nativity.refreshCurrentStoryState.useMutation({
    onSuccess: (data) => {
      setComputedStoryState(data.storyState);
      setIsRefreshing(false);
      refetchStories();
    },
    onError: () => {
      // Fallback to simple calculation if backend fails
      const fallback = currentStory ? calculateStoryState(currentStory.scenes) : undefined;
      setComputedStoryState(fallback);
      setIsRefreshing(false);
    },
  });

  const recalculateCurrentStoryThemesMutation = api.nativity.recalculateCurrentStoryThemes.useMutation({
    onSuccess: () => {
      refetchStories();
    },
    onError: (error) => {
      console.error('Failed to recalculate themes:', error);
    },
  });

  const handleGenerateTheme = async () => {
    if (!userLocation) return;
    setIsGenerating(true);
    await generateStoryMutation.mutateAsync({
      nativityChartId,
      userLatitude: userLocation.latitude,
      userLongitude: userLocation.longitude,
      userTimeZone: userLocation.timeZone,
    });
  };

  const handleGenerateScript = async () => {
    if (!currentStory) return;
    setIsGenerating(true);
    await generateMainNarrativeMutation.mutateAsync({
      currentStoryId: currentStory.id,
    });
    setIsGenerating(false);
  };

  const handleRecalculateScenes = async () => {
    if (!currentStory) return;
    setIsRecalculatingScenes(true);
    await recalculateScenessMutation.mutateAsync({
      currentStoryId: currentStory.id,
    });
  };

  const handleRecalculateSingleScene = async (sceneId: string) => {
    if (!currentStory) return;
    setIsRecalculatingScenes(true);
    await recalculateSingleSceneMutation.mutateAsync({
      currentStoryId: currentStory.id,
      sceneId,
    });
  };

  const handleRecalculateNarrative = async () => {
    if (!currentStory) return;
    setIsGenerating(true);
    await generateMainNarrativeMutation.mutateAsync({
      currentStoryId: currentStory.id,
    });
    setIsGenerating(false);
  };

  const handleRefreshStoryState = async () => {
    if (!currentStory?.scenes || currentStory.scenes.length === 0) return;
    setIsRefreshing(true);
    setComputedStoryState(undefined);

    await refreshCurrentStoryStateMutation.mutateAsync({
      currentStoryId: currentStory.id,
    });
  };

  const handleRecalculateThemes = async () => {
    if (!currentStory) return;
    setIsRecalculatingThemes(true);
    await recalculateCurrentStoryThemesMutation.mutateAsync({
      currentStoryId: currentStory.id,
    });
    setIsRecalculatingThemes(false);
  };

  const currentStory = (stories?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0] as CurrentStory | undefined) ?? undefined;

  useEffect(() => {
    if (currentStory?.scenes?.length) {
      setSelectedSceneId((prev) => prev ?? currentStory.scenes[0].id);
    }
  }, [currentStory]);

  const selectedScene = currentStory?.scenes.find((scene) => scene.id === selectedSceneId) ?? currentStory?.scenes?.[0] ?? null;

  return (
     <div className="bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] flex flex-col font-sans selection:bg-[var(--color-accent-orange)]/30 min-h-screen h-screen overflow-hidden transition-colors duration-700">
      
      {/* HEADER: The Bridge Control */}
      <header className="flex-shrink-0 h-16 sm:h-24 border-b border-white/10 px-6 sm:px-10 flex items-center justify-between bg-[var(--color-primary-dark)]/80 backdrop-blur-2xl z-[60] shadow-2xl">
        <div className="flex items-center gap-4 sm:gap-12">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-primary-light)] border border-[var(--color-accent-glow)]/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(226,150,38,0.2)] transition-transform group-hover:rotate-12">
              <Theater size={22} className="text-[var(--color-primary-dark)]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[var(--color-primary-light)] font-black tracking-[0.2em] uppercase text-sm sm:text-base leading-none">
                Mundane_Astro
              </h1>
              <p className="text-[9px] text-[var(--color-accent-glow)] font-mono tracking-[0.4em] uppercase mt-1 opacity-80">
                Orbital_Engine_v3.2
              </p>
            </div>
          </div>

          {/* TELEMETRY BAR */}
          <div className="hidden lg:flex items-center gap-8 bg-black/20 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
            <MetaItem icon={<MapPin size={12} className="text-[var(--color-accent-orange)]" />} label="Coord" value={userLocation ? `${userLocation.latitude.toFixed(2)}°` : "N/A"} />
            <div className="w-[1px] h-4 bg-white/10" />
            <MetaItem icon={<Activity size={12} className="text-[var(--color-accent-glow)]" />} label="Flux" value={currentStory ? `${Math.round(currentStory.overallIntensity)}%` : "0%"} />
            <div className="w-[1px] h-4 bg-white/10" />
            <MetaItem icon={<Clock size={12} className="text-[var(--color-primary-light)]" />} label="Sync" value={new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={!currentStory ? handleGenerateTheme : (!currentStory.mainNarrative ? handleGenerateScript : undefined)}
            className="group relative px-6 py-3 bg-[var(--color-accent-orange)] hover:bg-white text-[var(--color-primary-dark)] font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all flex items-center gap-3 shadow-[0_10px_20px_rgba(226,150,38,0.3)] disabled:opacity-20 active:scale-95"
          >
            {isGenerating ? <Loader className="animate-spin" size={14} /> : <Play size={12} fill="currentColor" />}
            <span className="hidden sm:inline">
              {isGenerating ? "Compiling Orbits..." : (!currentStory ? "Initialize Theme" : (!currentStory.mainNarrative ? "Generate Script" : "Script Ready"))}
            </span>
          </button>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-3 rounded-xl bg-white/5 text-[var(--color-primary-light)] hover:bg-[var(--color-accent-orange)] hover:text-black transition-all">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* VIEWPORT CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-y-auto bg-[var(--bg-main)] relative custom-scrollbar scroll-smooth">
          {/* Authentic Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.12] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-multiply" />
          
          <div className="max-w-7xl mx-auto py-16 px-6 lg:px-16 relative z-10">
            {!currentStory ? (
              <div className="min-h-[60vh] flex items-center justify-center">
                <ScriptEmptyState onGenerate={handleGenerateTheme} isGenerating={isGenerating} label="Initialize Celestial Narrative" />
              </div>
            ) : (
              <div className="space-y-12">
                
                {/* TOP METRIC ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Overall Intensity" value={`${Math.round(currentStory.overallIntensity || 0)}%`} caption={`${currentStory.scenes.length} Active Nodes`} />
                  <StatCard label="Transit Snapshot" value={new Date(currentStory.createdAt).toLocaleDateString()} caption="Chronicle Log Date" />
                  {/* Additional StatCards can span here */}
                </div>

                {/* STORY STATE: Full Width Cinematic Panel */}
                <section className="relative">
                   <StoryStatePanel storyState={computedStoryState ?? normalizeStoryState(currentStory.storyState)} isRefreshing={isRefreshing} onRefresh={handleRefreshStoryState} />
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT: PLANETARY NAVIGATION */}
                  <aside className="xl:col-span-4 space-y-6 sticky top-0">
                    <div className="rounded-[2.5rem] border border-[var(--color-ring-bronze)]/20 bg-[var(--color-primary-light)]/30 backdrop-blur-md p-6 shadow-xl">
                      <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex flex-col">
                          <h2 className="text-[10px] font-black text-[var(--color-primary-dark)] uppercase tracking-[0.3em]">
                            Planetary Scenes
                          </h2>
                          <span className="text-[9px] font-mono text-[var(--text-muted)] italic">Orbital Selection</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRecalculateScenes}
                          disabled={isRecalculatingScenes}
                          className="p-2 rounded-xl bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] hover:bg-[var(--color-accent-orange)] transition-colors disabled:opacity-30"
                        >
                          <RotateCcw size={14} className={isRecalculatingScenes ? "animate-spin" : ""} />
                        </button>
                      </div>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar-thin">
                        {currentStory.scenes.map((scene) => (
                          <PlanetSceneButton key={scene.id} scene={scene} selected={scene.id === selectedSceneId} onSelect={() => setSelectedSceneId(scene.id)} />
                        ))}
                      </div>
                    </div>
                  </aside>

                  {/* RIGHT: DATA & NARRATIVE INSPECTION */}
                  <div className="xl:col-span-8 space-y-8">
                    <PlanetSceneDetail scene={selectedScene} onRecalculate={handleRecalculateSingleScene} isRecalculating={isRecalculatingScenes} />
                    
                    <div className="grid md:grid-cols-1 gap-8">
                        <ThemeSummaryCard themes={currentStory.themes} onRecalculate={handleRecalculateThemes} isRecalculating={isRecalculatingThemes} />
                        <MainNarrativePanel narrative={currentStory?.mainNarrative} onGenerateScript={handleGenerateScript} onRecalculate={handleRecalculateNarrative} isGenerating={isGenerating} />
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* HELPER COMPONENTS */

const MetaItem = ({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) => (
  <div className="flex items-center gap-2">
    <span className="text-stone-600">{icon}</span>
    <span className="text-[10px] font-black text-white tracking-widest uppercase">
      {value}
    </span>
  </div>
);





