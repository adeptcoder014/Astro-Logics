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
} from "lucide-react";
import ScriptEmptyState from "../currentStory/ScriptEmptyState";
import MainNarrativePanel from "../currentStory/MainNarrativePanel";
import StoryStatePanel from "../currentStory/StoryStatePanel";
import ThemeSummaryCard from "../currentStory/ThemeSummaryCard";

// Calculate story state from planetary scenes
// const calculateStoryState = (scenes: PlanetaryScene[]): string => {
//   if (!scenes || scenes.length === 0) return "No scene data available.";

//   // Aggregate narrative fields across all scenes
//   const behaviors = scenes
//     .map((s) => s.behavioralPattern)
//     .filter(Boolean) as string[];
//   const conflicts = scenes
//     .map((s) => s.externalConflict)
//     .filter(Boolean) as string[];
//   const pressures = scenes
//     .map((s) => s.dominantPressure)
//     .filter(Boolean) as string[];
//   const relationshipEffects = scenes
//     .map((s) => s.relationshipEffect)
//     .filter(Boolean) as string[];
//   const pressureDirections = scenes
//     .map((s) => s.pressureDirection)
//     .filter(Boolean) as string[];

//   // Calculate average intensity
//   const avgIntensity =
//     scenes.length > 0
//       ? Math.round(scenes.reduce((sum, s) => sum + s.intensity, 0) / scenes.length)
//       : 0;

//   // Build state summary
//   const stateLines: string[] = [];

//   if (behaviors.length > 0) {
//     stateLines.push(`Behavioral: ${behaviors.slice(0, 2).join(", ")}`);
//   }

//   if (conflicts.length > 0) {
//     stateLines.push(`Conflicts: ${conflicts.slice(0, 2).join(", ")}`);
//   }

//   if (pressures.length > 0) {
//     stateLines.push(`Pressures: ${pressures.slice(0, 2).join(", ")}`);
//   }

//   if (relationshipEffects.length > 0) {
//     stateLines.push(`Relations: ${relationshipEffects.slice(0, 1).join(", ")}`);
//   }

//   if (pressureDirections.length > 0) {
//     stateLines.push(`Pressure Direction: ${pressureDirections.slice(0, 1).join(", ")}`);
//   }

//   // Add intensity
//   stateLines.push(`Intensity: ${avgIntensity}%`);

//   return stateLines.length > 0
//     ? stateLines.join(" | ")
//     : "State computed from scenes.";
// };

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
      // const fallback = currentStory ? calculateStoryState(currentStory.scenes) : undefined;
      setComputedStoryState('fallback');
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
    <div className="bg-[#0A0A0A] text-stone-400 flex flex-col font-sans selection:bg-[#E29626]/30 min-h-screen h-screen overflow-hidden">
      {/* HEADER */}
      <header className="flex-shrink-0 h-16 sm:h-20 border-b border-white/5 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-black/60 backdrop-blur-xl z-[60]">
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-900 border border-white/10 rounded-lg flex items-center justify-center shadow-xl">
              <Theater size={18} className="text-[#E29626]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-black tracking-tighter uppercase text-xs sm:text-sm">
                Astro_Script
              </h1>
              <p className="text-[9px] text-stone-500 font-mono tracking-widest uppercase hidden xs:block">
                Llama-3.2-1B
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <MetaItem
              icon={<MapPin size={10} />}
              value={
                userLocation ? `${userLocation.latitude.toFixed(2)}°` : "N/A"
              }
            />
            <MetaItem
              icon={<Activity size={10} />}
              value={
                currentStory
                  ? `${Math.round(currentStory.overallIntensity)}%`
                  : "0%"
              }
            />
            <MetaItem
              icon={<Clock size={10} />}
              value={new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={!currentStory ? handleGenerateTheme : (!currentStory.mainNarrative ? handleGenerateScript : undefined)}
            // disabled={isGenerating || (currentStory && currentStory.mainNarrative)}
            className="px-3 sm:px-5 py-2 bg-[#E29626] hover:bg-white text-black font-black uppercase text-[10px] tracking-widest rounded transition-all flex items-center gap-2 disabled:opacity-20"
          >
            {isGenerating ? (
              <Loader className="animate-spin" size={12} />
            ) : (
              <Play size={10} fill="black" />
            )}
            <span className="hidden sm:inline">
              {isGenerating ? "Compiling..." : (!currentStory ? "Generate Theme" : (!currentStory.mainNarrative ? "Generate Script" : "Script Ready"))}
            </span>
            <span className="sm:hidden">{isGenerating ? "..." : (!currentStory ? "Theme" : (!currentStory.mainNarrative ? "Script" : "Ready"))}</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-stone-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* VIEWPORT CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-y-auto bg-[#DED7C8] relative custom-scrollbar">
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-multiply" />
          <div className="max-w-6xl mx-auto py-12 px-6 lg:px-12 font-mono text-stone-900 relative z-10">
            {!currentStory ? (
              <ScriptEmptyState
                onGenerate={handleGenerateTheme}
                isGenerating={isGenerating}
                label="Generate Theme"
              />
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* <ThemeSummaryCard themes={currentStory.themes} /> */}
                  <StatCard
                    label="Overall Intensity"
                    value={`${Math.round(currentStory.overallIntensity || 0)}%`}
                    caption={`${currentStory.scenes.length} Active Nodes`}
                  />
                  <StatCard
                    label="Current Date"
                    value={new Date(currentStory.createdAt).toLocaleDateString()}
                    caption="Transit snapshot"
                  />
                  <StoryStatePanel
                    storyState={computedStoryState ?? normalizeStoryState(currentStory.storyState)}
                    isRefreshing={isRefreshing}
                    onRefresh={handleRefreshStoryState}
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-black/5 bg-white/60 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[10px] font-black text-[#E29626] uppercase tracking-[0.2em]">
                          Planetary Scenes
                        </h2>
                        <button
                          type="button"
                          onClick={handleRecalculateScenes}
                          disabled={isRecalculatingScenes}
                          className="rounded-full bg-[#E29626] px-3 py-1.5 text-[8px] font-black uppercase text-[#0F0D0C] transition hover:bg-[#ffb86c] disabled:opacity-50 flex items-center gap-1"
                        >
                          {isRecalculatingScenes ? (
                            <Loader size={8} className="animate-spin" />
                          ) : (
                            <span>↻ Recalc</span>
                          )}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {currentStory.scenes.map((scene) => (
                          <PlanetSceneButton
                            key={scene.id}
                            scene={scene}
                            selected={scene.id === selectedSceneId}
                            onSelect={() => setSelectedSceneId(scene.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="xl:col-span-2 space-y-4">
                    <PlanetSceneDetail
                      scene={selectedScene}
                      onRecalculate={handleRecalculateSingleScene}
                      isRecalculating={isRecalculatingScenes}
                    />
                    <ThemeSummaryCard
                      themes={currentStory.themes}
                      onRecalculate={handleRecalculateThemes}
                      isRecalculating={isRecalculatingThemes}
                    />
                    <MainNarrativePanel
                      narrative={currentStory?.mainNarrative}
                      onGenerateScript={handleGenerateScript}
                      onRecalculate={handleRecalculateNarrative}
                      isGenerating={isGenerating}
                    />
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

const StatCard = ({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) => (
  <div className="rounded-3xl border border-black/5 bg-white/60 p-6 shadow-sm">
    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">{label}</p>
    <p className="text-3xl font-black text-stone-900">{value}</p>
    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">{caption}</p>
  </div>
);

const PlanetSceneButton = ({
  scene,
  selected,
  onSelect,
}: {
  scene: PlanetaryScene;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full rounded-3xl border p-4 text-left transition ${selected
        ? "border-[#E29626] bg-[#FFFBF5] shadow-md"
        : "border-black/5 bg-white/60 hover:bg-white/80"
      }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Planet</p>
        <p className="text-base font-black text-stone-900">{scene.planet}</p>
      </div>
      <span className="rounded-full bg-black/5 px-2 py-1 text-[10px] font-black uppercase text-stone-700">
        {Math.round(scene.intensity)}%
      </span>
    </div>
    <div className="mt-3 space-y-2 text-[11px] text-stone-600">
      <div className="flex justify-between">
        <span>Natal</span>
        <span>{formatPosition(scene.natalLongitude)}</span>
      </div>
      <div className="flex justify-between">
        <span>Transit</span>
        <span>{formatPosition(scene.currentLongitude)}</span>
      </div>
    </div>
  </button>
);

const PlanetSceneDetail = ({
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
      <div className="rounded-3xl border border-black/5 bg-white/60 p-6 shadow-sm">
        <p className="text-sm text-stone-700">Select a planet scene to inspect its data fields.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white/60 p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Selected Scene</p>
          <h3 className="text-2xl font-black text-stone-900">{scene.planet}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#E29626] px-3 py-1 text-[10px] font-black uppercase text-[#0F0D0C]">
            {Math.round(scene.intensity)}% intensity
          </div>
          {onRecalculate && (
            <button
              type="button"
              onClick={() => onRecalculate(scene.id)}
              disabled={isRecalculating}
              className="rounded-full bg-[#E29626] px-3 py-1.5 text-[8px] font-black uppercase text-[#0F0D0C] transition hover:bg-[#ffb86c] disabled:opacity-50 flex items-center gap-1"
            >
              {isRecalculating ? (
                <Loader size={8} className="animate-spin" />
              ) : (
                <span>♻ Recalc</span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-[11px] text-stone-700">
        <div className="rounded-2xl bg-[#F8F5F0] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Sign</p>
          <p className="font-semibold text-stone-900">{scene.sign}</p>
        </div>
        <div className="rounded-2xl bg-[#F8F5F0] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">House</p>
          <p className="font-semibold text-stone-900">{scene.house}</p>
        </div>
        <div className="rounded-2xl bg-[#F8F5F0] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Natal Position</p>
          <p className="font-semibold text-stone-900">{formatPosition(scene.natalLongitude)}</p>
        </div>
        <div className="rounded-2xl bg-[#F8F5F0] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Transit Position</p>
          <p className="font-semibold text-stone-900">{formatPosition(scene.currentLongitude)}</p>
        </div>
        <div className="rounded-2xl bg-[#F8F5F0] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Motion</p>
          <p className="font-semibold text-stone-900">{scene.movementDegrees > 0 ? "+" : ""}{scene.movementDegrees.toFixed(2)}°</p>
        </div>
        <div className="rounded-2xl bg-[#F8F5F0] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Collapse Risk</p>
          <p className="font-semibold text-stone-900">{scene.collapseRisk || "N/A"}%</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {scene.dominantPressure && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Dominant Pressure</p>
            <p className="text-sm font-semibold text-stone-900">{scene.dominantPressure}</p>
          </div>
        )}

        {scene.behavioralPattern && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Behavioral Pattern</p>
            <p className="text-sm font-semibold text-stone-900">{scene.behavioralPattern}</p>
          </div>
        )}

        {scene.externalConflict && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">External Conflict</p>
            <p className="text-sm font-semibold text-stone-900">{scene.externalConflict}</p>
          </div>
        )}

        {scene.relationshipEffect && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Relationship Effect</p>
            <p className="text-sm font-semibold text-stone-900">{scene.relationshipEffect}</p>
          </div>
        )}

        {scene.pressureDirection && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Pressure Direction</p>
            <p className="text-sm font-semibold text-stone-900">{scene.pressureDirection}</p>
          </div>
        )}

        {scene.momentumDirection && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Momentum Direction</p>
            <p className="text-sm font-semibold text-stone-900">{scene.momentumDirection}</p>
          </div>
        )}

        {scene.storyFunction && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Story Function</p>
            <p className="text-sm font-semibold text-stone-900">{scene.storyFunction}</p>
          </div>
        )}

        {scene.sceneAttributes?.vectorState && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Psychological Vectors</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(scene.sceneAttributes.vectorState).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-semibold">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {scene.activeAspects?.length ? (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Active Aspects</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {parseAspects(scene.activeAspects).map((aspect, idx) => (
                <div key={idx} className="rounded-2xl bg-[#F8F5F0] p-3 text-[11px] text-stone-700 flex items-center justify-between">
                  <span className="capitalize">{aspect.aspectType}</span>
                  <span>{aspect.orb.toFixed(1)}°</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

