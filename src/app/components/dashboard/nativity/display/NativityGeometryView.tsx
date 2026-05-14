'use client'
import React from 'react';

interface AngularDistance {
  id: string;
  planet1: string;
  planet2: string;
  distance: number;
  speedWeighting: number;
}

interface NativityGeometryViewProps {
  distances: AngularDistance[];
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

export default function NativityGeometryView({ distances }: NativityGeometryViewProps) {
  const sortedDistances = [...distances].sort((a, b) => a.distance - b.distance);

  return (
    <div className="w-full h-full overflow-y-auto p-4">
      {sortedDistances.length === 0 ? (
        <div className="flex items-center justify-center h-full text-stone-500">
          <p className="text-sm">No angular relationships</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDistances.map((dist) => (
            <div
              key={dist.id}
              className="border border-[#2D241E] rounded bg-[#1A1714] p-4 hover:border-[#E29626] transition-colors"
            >
              {/* Planet Pair */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl text-[#E29626]">
                  {PLANET_SYMBOLS[dist.planet1] || dist.planet1[0]}
                </span>
                <span className="text-xs text-stone-500 mx-2">↔</span>
                <span className="text-xl text-[#E29626]">
                  {PLANET_SYMBOLS[dist.planet2] || dist.planet2[0]}
                </span>
              </div>

              {/* Distance Title */}
              <p className="text-xs text-stone-400 mb-2 font-mono">
                {dist.planet1} ↔ {dist.planet2}
              </p>

              {/* Distance Value */}
              <div className="mb-3">
                <div className="text-2xl font-bold text-white font-mono">
                  {dist.distance.toFixed(2)}°
                </div>
                <p className="text-xs text-stone-500 mt-1">Angular distance</p>
              </div>

              {/* Distance Bar */}
              <div className="space-y-2">
                <div className="w-full h-2 rounded-full bg-[#2D241E] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E29626] to-[#F0A030]"
                    style={{ width: `${(dist.distance / 180) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>0°</span>
                  <span>90°</span>
                  <span>180°</span>
                </div>
              </div>

              {/* Speed Weighting */}
              <div className="mt-4 pt-3 border-t border-[#2D241E]">
                <p className="text-xs text-stone-600 mb-1">Speed Weight</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-[#2D241E] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                      style={{ width: `${dist.speedWeighting * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-mono">
                    {(dist.speedWeighting * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
