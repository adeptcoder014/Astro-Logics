'use client'
import React from 'react';

interface Aspect {
  id: string;
  planet1: string;
  planet2: string;
  aspectType: string;
  orbDistance: number;
  isApplying: boolean;
  exactnessScore: number;
  orbStrength: number;
  speedWeighting: number;
}

interface NativityAspectsTableProps {
  aspects: Aspect[];
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

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  square: '□',
  trine: '△',
  sextile: '∗',
};

export default function NativityAspectsTable({ aspects }: NativityAspectsTableProps) {
  const sortedAspects = [...aspects].sort((a, b) => b.exactnessScore - a.exactnessScore);

  return (
    <div className="w-full h-full overflow-y-auto">
      {sortedAspects.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-stone-500">
          <p className="text-sm">No aspects detected</p>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#14110F] border-b border-[#2D241E]">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-stone-400">Aspect</th>
              <th className="px-4 py-2 text-right text-xs font-bold text-stone-400">Orb</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-stone-400">Phase</th>
              <th className="px-4 py-2 text-right text-xs font-bold text-stone-400">Exactness</th>
              <th className="px-4 py-2 text-right text-xs font-bold text-stone-400">Strength</th>
            </tr>
          </thead>
          <tbody>
            {sortedAspects.map((aspect) => (
              <tr key={aspect.id} className="border-b border-[#2D241E] hover:bg-[#1A1714] transition-colors">
                <td className="px-4 py-3 text-sm font-semibold">
                  <span className="text-lg text-[#E29626]">
                    {PLANET_SYMBOLS[aspect.planet1] || aspect.planet1[0]}
                  </span>
                  <span className="mx-1 text-sm text-stone-500">
                    {ASPECT_SYMBOLS[aspect.aspectType] || aspect.aspectType}
                  </span>
                  <span className="text-lg text-[#E29626]">
                    {PLANET_SYMBOLS[aspect.planet2] || aspect.planet2[0]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-white font-mono">
                  {aspect.orbDistance > 0 ? '+' : ''}
                  {aspect.orbDistance.toFixed(2)}°
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {aspect.isApplying ? (
                    <span className="text-blue-500 text-xs font-bold">APPLYING</span>
                  ) : (
                    <span className="text-purple-500 text-xs font-bold">SEPARATING</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-16 h-1 rounded-full bg-[#2D241E] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E29626] to-[#F0A030]"
                        style={{ width: `${aspect.exactnessScore * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-mono">
                      {(aspect.exactnessScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-12 h-1 rounded-full bg-[#2D241E] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E29626] to-[#F0A030]"
                        style={{ width: `${aspect.orbStrength * 100}%` }}
                      />
                    </div>
                    <span className="text-stone-400 text-xs">
                      {(aspect.orbStrength * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
