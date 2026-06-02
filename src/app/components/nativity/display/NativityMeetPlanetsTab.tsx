'use client';

import React, { useState, useEffect } from 'react';
import { api } from '~/trpc/react';
import PlanetPersonalityChat from './PlanetPersonalityChat';
import PlanetCharacter2D, { type CharacterConfig, type CharacterMood } from './PlanetCharacter2D';
import {
  PlanetPersonalityBuilder,
  type PlanetContext,
  type PlanetData,
  type AspectData,
} from './PlanetPersonalityBuilder';
import type { PlanetPersona } from '@/types/PlanetPersona';

interface MeetProps {
  nativityChartId: string;
}

function contextToCharacterConfig(context: PlanetContext): CharacterConfig {
  const planetColorMap: Record<string, { primary: string; secondary: string }> = {
    SUN: { primary: '#FFD700', secondary: '#FFA500' },
    MOON: { primary: '#E0E0E0', secondary: '#A9A9A9' },
    MERCURY: { primary: '#87CEEB', secondary: '#4169E1' },
    VENUS: { primary: '#FFB6C1', secondary: '#FF69B4' },
    MARS: { primary: '#DC143C', secondary: '#FF4500' },
    JUPITER: { primary: '#DAA520', secondary: '#FF8C00' },
    SATURN: { primary: '#B8860B', secondary: '#8B7355' },
    URANUS: { primary: '#00CED1', secondary: '#008B8B' },
    NEPTUNE: { primary: '#4169E1', secondary: '#1E90FF' },
    PLUTO: { primary: '#2F4F4F', secondary: '#696969' },
    MEAN_NODE: { primary: '#C0C0C0', secondary: '#808080' },
    TRUE_NODE: { primary: '#A9A9A9', secondary: '#696969' },
  };

  const colors = planetColorMap[context.planet] || { primary: '#888888', secondary: '#555555' };
  const aspectCount = context.aspectsWithOthers?.length || 0;
  const isRetrograde = context.isRetrograde;

  const baseTempoFromAspects = 0.3 + (Math.min(aspectCount, 5) / 5) * 0.7;
  const tempoMultiplier = isRetrograde ? 0.7 : 1.0;
  const tempo = baseTempoFromAspects * tempoMultiplier;

  let mood: CharacterMood = 'neutral';
  const tensionAspects = context.aspectsWithOthers?.filter(a =>
    ['SQUARE', 'OPPOSITION', 'QUINCUNX'].includes(a.aspectType)
  ) || [];

  if (tensionAspects.length > 2) {
    mood = 'shocked';
  } else if (aspectCount === 0) {
    mood = 'sleepy';
  } else if (context.dignityScore && context.dignityScore > 2) {
    mood = 'happy';
  }

  return {
    bodyColor: colors.primary,
    auraColor: colors.secondary,
    bobSpeed: Math.max(0.5, 3 - tempo * 2),
    bobIntensity: Math.max(0.1, tempo * 0.25),
    rotationSpeed: Math.max(0.1, tempo * 0.8),
    auraPulseSpeed: Math.max(0.8, 3 - (aspectCount / 5) * 2),
    eyeColor: context.zodiacSign === 'SCORPIO' ? '#FF0000' : '#2D241E',
    mood,
  };
}

function contextToPersona(context: PlanetContext, personality: any): PlanetPersona {
  const planetMap: Record<string, PlanetPersona['planet']> = {
    SUN: 'Mercury', MOON: 'Mercury', MERCURY: 'Mercury', VENUS: 'Venus', MARS: 'Mars', JUPITER: 'Jupiter', SATURN: 'Saturn',
  };

  const planetKey = planetMap[context.planet] || 'Mercury';

  function getTemperament(): PlanetPersona['temperament'] {
    if (context.isRetrograde) return 'calm';
    if (context.aspectsWithOthers.length > 3) return 'agitated';
    if (context.dignityScore > 3) return 'authoritative';
    return 'playful';
  }

  function getDignity(): PlanetPersona['dignity'] {
    if (context.dignityScore > 3) return 'exalted';
    if (context.dignityScore > 1.5) return 'own';
    if (context.dignityScore < 0) return 'debilitated';
    return 'neutral';
  }

  function getExpressionBias() {
    const aspectCount = context.aspectsWithOthers.length;
    const hasHarmonious = context.aspectsWithOthers.some(a => ['trine', 'sextile'].includes(a.aspectType.toLowerCase()));
    const hasTension = context.aspectsWithOthers.some(a => ['square', 'opposition'].includes(a.aspectType.toLowerCase()));

    return {
      talkative: Math.min(1, 0.3 + aspectCount * 0.15),
      reserved: context.isRetrograde ? 0.7 : 0.2,
      sharp: hasTension ? 0.8 : 0.4,
      warm: hasHarmonious ? 0.8 : 0.3,
    };
  }

  return {
    planet: planetKey,
    temperament: getTemperament(),
    energy: Math.min(1, Math.max(0, context.speed / 2)),
    dignity: getDignity(),
    expressionBias: getExpressionBias(),
  };
}

export default function NativityMeetPlanetsTab({ nativityChartId }: MeetProps) {
  const { data: chartData, isLoading, error } = api.nativity.getNativityChart.useQuery(
    { nativityChartId },
    { enabled: !!nativityChartId }
  );

  const { data: planetsData } = api.nativity.getNativityPlanets.useQuery(
    { nativityChartId },
    { enabled: !!nativityChartId }
  );
console.log(planetsData)
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [planetContexts, setPlanetContexts] = useState<Record<string, PlanetContext>>({});
  const [planetPersonas, setPlanetPersonas] = useState<Record<string, PlanetPersona>>({});
  const [planetCharacterConfigs, setPlanetCharacterConfigs] = useState<Record<string, CharacterConfig>>({});

  useEffect(() => {
    if (!chartData?.planets || !planetsData?.planets) return;

    const builder = new PlanetPersonalityBuilder();
    const contexts: Record<string, PlanetContext> = {};
    const personas: Record<string, PlanetPersona> = {};
    const configs: Record<string, CharacterConfig> = {};

    for (const planet of chartData.planets) {
      const context = builder.buildContext(planet as PlanetData, chartData.aspects as AspectData[]);
      contexts[planet.planet] = context;

      const personData = planetsData.planets.find(p => p.planet === planet.planet);
      personas[planet.planet] = contextToPersona(context, personData);
      configs[planet.planet] = contextToCharacterConfig(context);
    }

    setPlanetContexts(contexts);
    setPlanetPersonas(personas);
    setPlanetCharacterConfigs(configs);

    if (!selectedPlanet && chartData.planets.length > 0) {
      setSelectedPlanet(chartData.planets[0].planet);
    }
  }, [chartData, planetsData, selectedPlanet]);

  if (isLoading) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center bg-[var(--color-primary-dark)] text-[var(--color-primary-light)]">
        <div className="animate-pulse text-xs font-bold uppercase tracking-widest opacity-70">
          Mapping planetary alignments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center bg-[var(--color-primary-dark)] p-4">
        <div className="px-5 py-4 rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm max-w-md text-center shadow-lg">
          <p className="font-black tracking-tight uppercase mb-1">Celestial Interference</p>
          <p className="opacity-80 text-xs">Failed to gather your natal configuration metrics.</p>
        </div>
      </div>
    );
  }

  const selectedContext = selectedPlanet ? planetContexts[selectedPlanet] : null;
  const selectedConfig = selectedPlanet ? planetCharacterConfigs[selectedPlanet] : null;

  return (
    // <div className="w-full lg:h-screen flex flex-col bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] selection:bg-[var(--color-accent-orange)]/30 overflow-hidden antialiased">
    <>

      {/* Tight Header Panel */}
      <header className="px-4 md:px-6 py-4 border-b border-[var(--color-primary-light)]/10 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base md:text-lg font-black tracking-tight uppercase">
            Meet Your Council of Planets
          </h2>
        </div>
 
      </header>

      {/* Main Responsive Bento Grid Framework */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 md:p-5 min-h-0 overflow-y-auto lg:overflow-hidden">

        {/* LEFT COLUMN: Visual Workspace Matrix (Takes up 8 columns on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-3.5 min-h-[450px] lg:min-h-0">

          {/* Telemetry Navigation Bar */}
          <nav className="w-full shrink-0 flex items-center gap-1.5 p-1.5 bg-black/20 border border-[var(--color-primary-light)]/10 rounded-xl overflow-x-auto no-scrollbar">
            {Object.keys(planetPersonas).map((planet) => {
              const isActive = selectedPlanet === planet;
              return (
                <button
                  key={planet}
                  onClick={() => setSelectedPlanet(planet)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-orange)] ${isActive
                    ? 'bg-[var(--color-accent-orange)] text-[var(--bg-main)] shadow-md font-black'
                    : 'text-[var(--color-primary-light)]/60 border border-transparent hover:text-[var(--color-primary-light)] hover:bg-white/5'
                    }`}
                >
                  {planet}
                </button>
              );
            })}
          </nav>

          {/* 2D Canvas Display Area (Bento Box Main Hero) */}
          <main className="flex-1 flex flex-col items-center justify-center border border-[var(--color-primary-light)]/10 rounded-2xl bg-black/20 relative shadow-inner overflow-hidden group min-h-0">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,var(--color-accent-glow)_0%,transparent_70%)] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500" />

            {selectedConfig && (
              <div className="w-full h-full flex items-center justify-center p-6 md:p-8">
                <PlanetCharacter2D
                  config={selectedConfig}
                  planet={selectedPlanet as any}
                  mood={selectedConfig.mood}
                  className="w-full h-full max-h-[45vh] lg:max-h-[55vh] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            )}

            {/* Visual Metadata Overlay Label */}
            {selectedPlanet && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[var(--color-primary-light)]/10">
                <span className="text-[10px] tracking-widest uppercase font-black text-[var(--color-accent-glow)]">
                  Entity: {selectedPlanet}
                </span>
                {selectedConfig?.mood && (
                  <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md bg-[var(--color-ring-bronze)]/20 text-[var(--color-primary-light)]/90 border border-[var(--color-ring-bronze)]/30">
                    Mood: {selectedConfig.mood}
                  </span>
                )}
              </div>
            )}
          </main>
        </div>

        {/* RIGHT COLUMN: Threaded Chat Interface Bento Box (Takes up 4 columns on desktop) */}
        <aside className="lg:col-span-4 flex flex-col bg-black/10 border border-[var(--color-primary-light)]/10 rounded-2xl p-4 shadow-xl min-h-[400px] lg:min-h-0 overflow-hidden backdrop-blur-xs">
          {selectedPlanet && selectedContext ? (
            <div className="h-full flex flex-col min-h-0">
              <PlanetPersonalityChat
                planet={selectedPlanet}
                context={selectedContext}
                isActive={true}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--color-primary-light)]/40">
              <span className="text-xl mb-1 opacity-40 animate-pulse">✦</span>
              <p className="text-[11px] tracking-wide max-w-[200px] leading-relaxed">
                Select a planet from the telemetry bar to establish interactive communication links.
              </p>
            </div>
          )}
        </aside>

      </div>
      {/* </div> */}
    </>
  );
}