'use client'
import React from 'react';

interface PlanetData {
  id: string;
  planet: string;
  longitude: number;
  latitude?: number | null;
  speed: number;
  acceleration?: number | null;
  direction: string;
  houseCusp: number;
  houseDegree: number;
  houseSign: string;
}

interface PlanetaryProfile {
  id: string;
  planet: string;
  dignityType: string;
  strength: number;
  primaryDomain: string;
  secondaryDomain?: string | null;
  visibility: number;
  saturationLevel: number;
}

interface NativityProfilesViewProps {
  profiles: PlanetaryProfile[];
  planets: PlanetData[];
}

const PLANET_SYMBOLS: Record<string, string> = {
  SUN: '☉',
  MOON: '☽',
  MERCURY: '☿',
  VENUS: '♀',
  MARS: '♂',
  JUPITER: '♃',
  SATURN: '♄',
  URANUS: '♅',
  NEPTUNE: '♆',
  PLUTO: '♇',
  MEAN_NODE: '☊',
};

const DIGNITY_COLORS: Record<string, string> = {
  Domicile: 'from-green-600 to-green-400',
  Exaltation: 'from-blue-600 to-blue-400',
  Detriment: 'from-red-600 to-red-400',
  Fall: 'from-orange-600 to-orange-400',
  Neutral: 'from-stone-600 to-stone-400',
};

export default function NativityProfilesView({
  profiles,
  planets,
}: NativityProfilesViewProps) {
  const sortedProfiles = [...profiles].sort((a, b) => b.strength - a.strength);

  return (
    <div className="w-full h-full overflow-y-auto p-4">
      {sortedProfiles.length === 0 ? (
        <div className="flex items-center justify-center h-full text-stone-500">
          <p className="text-sm">No profiles available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedProfiles.map((profile) => {
            const planet = planets.find((p) => p.planet === profile.planet);
            const dignityGradient = DIGNITY_COLORS[profile.dignityType] || DIGNITY_COLORS['Neutral'];

            return (
              <div
                key={profile.id}
                className="border border-[#2D241E] rounded bg-[#1A1714] p-4 hover:border-[#E29626] transition-colors"
              >
                {/* Header with Planet Symbol */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-2xl text-[#E29626]">
                      {PLANET_SYMBOLS[profile.planet] || profile.planet[0]}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {profile.planet}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r ${dignityGradient}`}
                    >
                      {profile.dignityType}
                    </span>
                  </div>
                </div>

                {/* Domains */}
                <div className="mb-3 space-y-1">
                  <p className="text-xs text-stone-600">Primary Domain</p>
                  <p className="text-sm text-stone-300">{profile.primaryDomain}</p>
                  {profile.secondaryDomain && (
                    <>
                      <p className="text-xs text-stone-600 mt-2">Secondary Domain</p>
                      <p className="text-sm text-stone-300">{profile.secondaryDomain}</p>
                    </>
                  )}
                </div>

                {/* Metrics */}
                <div className="space-y-3 mb-3 pt-3 border-t border-[#2D241E]">
                  {/* Strength */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-stone-600">Strength</span>
                      <span className="text-xs font-bold text-white">
                        {(profile.strength * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#2D241E] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E29626] to-[#F0A030]"
                        style={{ width: `${profile.strength * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-stone-600">Visibility</span>
                      <span className="text-xs font-bold text-white">
                        {(profile.visibility * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#2D241E] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                        style={{ width: `${profile.visibility * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-stone-600">Saturation</span>
                      <span className="text-xs font-bold text-white">
                        {(profile.saturationLevel * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#2D241E] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                        style={{ width: `${profile.saturationLevel * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Planet Position */}
                {planet && (
                  <div className="pt-3 border-t border-[#2D241E]">
                    <p className="text-xs text-stone-600 mb-1">Position</p>
                    <p className="text-sm text-stone-300 font-mono">
                      {planet.longitude.toFixed(2)}° in House {planet.houseCusp}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
