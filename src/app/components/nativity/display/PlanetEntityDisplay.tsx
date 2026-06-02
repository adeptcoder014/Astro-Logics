'use client'
import React from 'react';
import { PlanetPersonality } from './personalityParser';

interface PlanetEntityDisplayProps {
  planet: string;
  personality: PlanetPersonality;
  avatar: string;
}

export default function PlanetEntityDisplay({
  planet,
  personality,
  avatar,
}: PlanetEntityDisplayProps) {
  const getMoodEmoji = (mood: string): string => {
    const moodMap: Record<string, string> = {
      radiant: '✨',
      contemplative: '🌙',
      passionate: '🔥',
      gentle: '💎',
      chaotic: '⚡',
      analytical: '🧠',
      enigmatic: '✴️',
    };
    return moodMap[mood] || '●';
  };

  const getMoodColor = (mood: string): string => {
    const colorMap: Record<string, string> = {
      radiant: 'from-yellow-500 to-orange-400',
      contemplative: 'from-blue-400 to-purple-500',
      passionate: 'from-red-500 to-pink-500',
      gentle: 'from-green-400 to-cyan-400',
      chaotic: 'from-purple-500 to-pink-600',
      analytical: 'from-cyan-400 to-blue-600',
      enigmatic: 'from-slate-500 to-slate-600',
    };
    return colorMap[mood] || 'from-slate-400 to-slate-500';
  };

  return (
    <div className="space-y-3">
      {/* Mood and Energy Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getMoodEmoji(personality.mood)}</span>
          <div>
            <div className="text-xs text-stone-400">Current State</div>
            <div className="text-sm font-semibold capitalize">{personality.mood}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-stone-400">Resonance</div>
          <div className="text-sm font-semibold text-[#E29626]">
            {Math.round(personality.energy * 100)}%
          </div>
        </div>
      </div>

      {/* Energy Bar visualization */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-500">Life Force</span>
          <span className="text-xs text-stone-500">{personality.traits.length} traits</span>
        </div>
        <div className="w-full h-2 bg-[#1a1a1a] rounded overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getMoodColor(
              personality.mood
            )} transition-all duration-500`}
            style={{ width: `${personality.energy * 100}%` }}
          />
        </div>
      </div>

      {/* Personality Traits Grid */}
      <div>
        <div className="text-xs text-[#E29626] font-semibold mb-2">Essence Traits</div>
        <div className="flex flex-wrap gap-2">
          {personality.traits.map((trait) => (
            <div
              key={trait}
              className="px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border border-[#333] text-stone-300 capitalize"
              title={trait}
            >
              {trait}
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Text - Full narrative */}
      <div>
        <details className="group">
          <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-300 transition-colors flex items-center gap-1">
            <span className="group-open:rotate-90 inline-block transition-transform">▶</span>
            The {planet}'s Whispers
          </summary>
          <div className="mt-3 p-3 bg-[#0f0f0f] rounded border border-[#333]">
            <div className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {avatar}
            </div>
          </div>
        </details>
      </div>

      {/* Interaction hint */}
      <div className="text-xs text-stone-500 italic">
        This entity carries the unique signature of {planet} in your natal chart
      </div>
    </div>
  );
}
