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

/**
 * Convert PlanetContext to CharacterConfig for 2D animation
 */
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

/**
 * Convert PlanetContext and personality data to visual PlanetPersona
 */
function contextToPersona(
  context: PlanetContext,
  personality: any
): PlanetPersona {
  const planetMap: Record<string, PlanetPersona['planet']> = {
    SUN: 'Mercury',
    MOON: 'Mercury',
    MERCURY: 'Mercury',
    VENUS: 'Venus',
    MARS: 'Mars',
    JUPITER: 'Jupiter',
    SATURN: 'Saturn',
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
    const hasHarmonious = context.aspectsWithOthers.some(
      a => ['trine', 'sextile'].includes(a.aspectType.toLowerCase())
    );
    const hasTension = context.aspectsWithOthers.some(
      a => ['square', 'opposition'].includes(a.aspectType.toLowerCase())
    );

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
      const context = builder.buildContext(
        planet as PlanetData,
        chartData.aspects as AspectData[]
      );
      contexts[planet.planet] = context;

      const personData = planetsData.planets.find(
        p => p.planet === planet.planet
      );

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
      <div className="h-full flex items-center justify-center bg-(--color-primary-dark) text-(--color-primary-light)">
        <div className="animate-pulse font-medium tracking-wide opacity-80">
          Mapping planetary alignments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-(--color-primary-dark)">
        <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm max-w-md text-center">
          <p className="font-semibold mb-1">Celestial Interference</p>
          <p className="opacity-80 text-xs">Failed to gather your natal configuration metrics.</p>
        </div>
      </div>
    );
  }

  const selectedContext = selectedPlanet ? planetContexts[selectedPlanet] : null;
  const selectedConfig = selectedPlanet ? planetCharacterConfigs[selectedPlanet] : null;

  return (
    <div className="h-full flex flex-col bg-(--color-primary-dark) text-(--color-primary-light) selection:bg-(--color-accent-orange)/30">
      {/* Header Panel */}
      <header className="px-6 py-5 border-b border-(--color-primary-light)/10 bg-black/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl text-(--color-accent-orange)">🪐</span>
          <h3 className="text-lg font-bold tracking-tight text-(--color-primary-light)">
            Meet Your Council of Planets
          </h3>
        </div>
        <p className="text-xs text-(--color-accent-glow) max-w-2xl leading-relaxed">
          Each celestial body coordinates specific facets of your consciousness. Select an active entity below to view its localized avatar and converse with its archetype.
        </p>
      </header>

      {/* Main Framework Container */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-6 gap-6 overflow-hidden">
        
        {/* Left Side Workspace: Navigation and Character view */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0">
          
          {/* Universal Horizontal Navigation Bar */}
          <nav className="w-full overflow-x-auto no-scrollbar flex items-center gap-2 pb-2 border-b border-(--color-primary-light)/10">
            {Object.keys(planetPersonas).map((planet) => {
              const isActive = selectedPlanet === planet;
              return (
                <button
                  key={planet}
                  onClick={() => setSelectedPlanet(planet)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-orange) ${
                    isActive
                      ? 'bg-(--color-accent-orange) text-(--bg-main) shadow-lg shadow-(--color-accent-orange)/10 hover:brightness-110'
                      : 'bg-black/20 border border-(--color-primary-light)/10 text-(--color-primary-light)/70 hover:text-(--color-primary-light) hover:bg-black/40 hover:border-(--color-primary-light)/30'
                  }`}
                >
                  {planet}
                </button>
              );
            })}
          </nav>

          {/* 2D Canvas Display Area */}
          <main className="flex-1 flex flex-col items-center justify-center border border-(--color-primary-light)/10 rounded-2xl bg-black/20 relative shadow-inner overflow-hidden group">
            {/* Soft Ambient Background Light Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,var(--color-accent-glow)_0%,transparent_65%)] opacity-5 group-hover:opacity-10 transition-opacity duration-700" />
            
            {selectedConfig && (
              <div className="w-full h-full flex items-center justify-center p-4">
                <PlanetCharacter2D
                  config={selectedConfig}
                  planet={selectedPlanet as any}
                  mood={selectedConfig.mood}
                  className="w-full h-full max-h-[80vh] transition-transform duration-300"
                />
              </div>
            )}
            
            {/* Visual Metadata Overlay Label */}
            {selectedPlanet && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-(--color-primary-light)/10">
                <span className="text-xs tracking-widest uppercase font-semibold text-(--color-accent-glow)">
                  Entity: {selectedPlanet}
                </span>
                {selectedConfig?.mood && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-(--color-ring-bronze)/20 text-(--color-primary-light)/90 border border-(--color-ring-bronze)/30">
                    Mood: {selectedConfig.mood}
                  </span>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Right Side Panel: Threaded Chat Interface */}
        <aside className="w-full lg:w-96 shrink-0 flex flex-col bg-black/30 border border-(--color-primary-light)/10 rounded-2xl p-4 shadow-xl overflow-hidden backdrop-blur-sm">
          {selectedPlanet && selectedContext ? (
            <div className="h-full flex flex-col min-h-0">
              <PlanetPersonalityChat
                planet={selectedPlanet}
                context={selectedContext}
                isActive={true}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-(--color-primary-light)/40">
              <span className="text-3xl mb-2 opacity-50">✦</span>
              <p className="text-xs tracking-wide">Select a planet from the telemetry bar to establish interactive communication links.</p>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}