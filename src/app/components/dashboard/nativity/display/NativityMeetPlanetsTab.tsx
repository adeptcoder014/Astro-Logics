'use client'
import React, { useState, useEffect, useMemo } from 'react';
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

  // Derive animation speed from aspects and retrograde status
  const aspectCount = context.aspectsWithOthers?.length || 0;
  const isRetrograde = context.isRetrograde;

  // More aspects = faster, more tense character
  const baseTempoFromAspects = 0.3 + (Math.min(aspectCount, 5) / 5) * 0.7;
  const tempoMultiplier = isRetrograde ? 0.7 : 1.0; // Retrograde = slower
  const tempo = baseTempoFromAspects * tempoMultiplier;

  // Determine mood from aspects and dignity
  let mood: CharacterMood = 'neutral';
  const tensionAspects = context.aspectsWithOthers?.filter(a =>
    ['SQUARE', 'OPPOSITION', 'QUINCUNX'].includes(a.aspectType)
  ) || [];

  if (tensionAspects.length > 2) {
    mood = 'shocked';
  } else if (aspectCount === 0) {
    mood = 'sleepy'; // Unaspected planets
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
  // Map planet name to valid persona planet type
  const planetMap: Record<string, PlanetPersona['planet']> = {
    SUN: 'Mercury',       // fallback mapping
    MOON: 'Mercury',
    MERCURY: 'Mercury',
    VENUS: 'Venus',
    MARS: 'Mars',
    JUPITER: 'Jupiter',
    SATURN: 'Saturn',
  };

  const planetKey = planetMap[context.planet] || 'Mercury';

  // Determine temperament from aspects and retrograde status
  function getTemperament(): PlanetPersona['temperament'] {
    if (context.isRetrograde) return 'calm';
    if (context.aspectsWithOthers.length > 3) return 'agitated';
    if (context.dignityScore > 3) return 'authoritative';
    return 'playful';
  }

  // Determine dignity from calculated score
  function getDignity(): PlanetPersona['dignity'] {
    if (context.dignityScore > 3) return 'exalted';
    if (context.dignityScore > 1.5) return 'own';
    if (context.dignityScore < 0) return 'debilitated';
    return 'neutral';
  }

  // Calculate expression bias from aspects
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
  // Fetch full chart data including planets, houses, and aspects
  const { data: chartData, isLoading, error } = api.nativity.getNativityChart.useQuery(
    { nativityChartId },
    { enabled: !!nativityChartId }
  );

  // Fetch personality data for planets
  const { data: planetsData } = api.nativity.getNativityPlanets.useQuery(
    { nativityChartId },
    { enabled: !!nativityChartId }
  );

  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [planetContexts, setPlanetContexts] = useState<Record<string, PlanetContext>>({});
  const [planetPersonas, setPlanetPersonas] = useState<Record<string, PlanetPersona>>({});
  const [planetCharacterConfigs, setPlanetCharacterConfigs] = useState<Record<string, CharacterConfig>>({});

  // Build planet contexts and personas from chart data
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

      // Find personality data for this planet
      const personData = planetsData.planets.find(
        p => p.planet === planet.planet
      );

      // Convert to visual persona
      personas[planet.planet] = contextToPersona(context, personData);

      // Convert to character animation config
      configs[planet.planet] = contextToCharacterConfig(context);
    }

    setPlanetContexts(contexts);
    setPlanetPersonas(personas);
    setPlanetCharacterConfigs(configs);

    // Default to first planet
    if (!selectedPlanet && chartData.planets.length > 0) {
      setSelectedPlanet(chartData.planets[0].planet);
    }
  }, [chartData, planetsData, selectedPlanet]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0F0D0C]">
        <div className="text-stone-400">Loading chart context...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0F0D0C]">
        <div className="text-red-400">Error loading chart</div>
      </div>
    );
  }

  const selectedContext = selectedPlanet ? planetContexts[selectedPlanet] : null;
  const selectedConfig = selectedPlanet ? planetCharacterConfigs[selectedPlanet] : null;

  return (
    <div className="h-full flex flex-col bg-[#0F0D0C]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2D241E]">
        <h3 className="text-lg font-bold text-[#E29626] mb-2">
          🪐 Meet Your Planets
        </h3>
        <p className="text-xs text-stone-400">
          Each planet embodies an archetypal force within you. Select one to explore and converse with them.
        </p>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex gap-4 min-h-0 p-6 overflow-hidden">

        {/* Left: Character Display + Info */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">

          {/* Planet Selector Tabs */}
          <div className="w-full overflow-x-auto flex gap-2 pb-2 border-b border-[#2D241E]">
            {Object.keys(planetPersonas).map((planet) => (
              <button
                key={planet}
                onClick={() => setSelectedPlanet(planet)}
                className={`px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-all flex-shrink-0 ${selectedPlanet === planet
                    ? 'bg-[#E29626] text-black shadow-lg'
                    : 'bg-[#2D241E] border border-[#3D3530] text-stone-300 hover:border-[#E29626]'
                  }`}
              >
                {planet}
              </button>
            ))}
          </div>

          {/* 2D Character Display */}
          {selectedConfig && (
            <div className="flex-1 flex flex-col items-center justify-center border border-[#2D241E] rounded bg-[#1A1714] overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <PlanetCharacter2D
                  config={selectedConfig}
                  planet={selectedPlanet as any}
                  mood={selectedConfig.mood}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}


        </div>

        {/* Right: Chat Interface */}
        <div className="w-96 flex flex-col gap-3 bg-[#1A1714] border border-[#2D241E] rounded p-4 overflow-hidden">
          {selectedPlanet && selectedContext ? (
            <PlanetPersonalityChat
              planet={selectedPlanet}
              context={selectedContext}
              isActive={!!selectedPlanet}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-stone-500 text-xs">
              Select a planet to chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
