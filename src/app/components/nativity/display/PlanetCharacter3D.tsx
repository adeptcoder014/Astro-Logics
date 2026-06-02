'use client'
import React, { Suspense } from 'react';
import { ENTITY_CONFIG } from './entityConfig';

// Use React.lazy for dynamic import with proper error handling
const PlanetScene = React.lazy(() => 
  import('./PlanetScene').catch(err => {
    console.error('Failed to load planet scene:', err);
    throw err;
  })
);

interface PlanetCharacterProps {
  planet: string;
  personality: {
    mood: string;
    traits: string[];
    color: string;
    energy: number;
  };
  isActive: boolean;
}

const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-xs text-stone-400">Loading 3D character...</div>
  </div>
);

export default function PlanetCharacter3D({
  planet,
  personality,
  isActive,
}: PlanetCharacterProps) {
  return (
    <div 
      className="w-full rounded overflow-hidden border border-[#333] bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] relative"
      style={{ height: ENTITY_CONFIG.CANVAS.height }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <PlanetScene
          planet={planet}
          personality={personality}
          isActive={isActive}
        />
      </Suspense>

      {/* Overlay info */}
      <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none">
        <div className="text-xs font-semibold text-white">{planet}</div>
        <div className="text-xs text-[#E29626] mt-1">
          Mood: <span className="capitalize">{personality.mood}</span>
        </div>
      </div>

      {/* Energy indicator */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="text-xs text-gray-400">Energy</div>
        <div className="w-24 h-2 bg-[#333] rounded mt-1 overflow-hidden">
          <div
            className="h-full bg-[#E29626] transition-all duration-500"
            style={{ width: `${personality.energy * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
