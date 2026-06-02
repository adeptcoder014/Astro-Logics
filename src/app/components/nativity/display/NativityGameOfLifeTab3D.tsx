'use client'
import React from 'react';
import dynamic from 'next/dynamic';

const CanvasScene = dynamic(() => import('./NativityGameOfLifeTab3DScene'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 border border-[#2D241E] rounded bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
      <div className="text-[#E29626]">Loading 3D scene...</div>
    </div>
  ),
});

interface PlanetEntity {
  id: string;
  planet: string;
  position: [number, number, number];
  energy: number;
  mood: string;
  color: string;
  personality: string;
  lastMessage: string;
  isActive: boolean;
}

interface GameScene3DProps {
  planets: PlanetEntity[];
  selectedPlanet: PlanetEntity | null;
  onSelectPlanet: (planet: PlanetEntity) => void;
}

export default function GameScene3D({
  planets,
  selectedPlanet,
  onSelectPlanet,
}: GameScene3DProps) {
  return (
    <CanvasScene
      planets={planets}
      selectedPlanet={selectedPlanet}
      onSelectPlanet={onSelectPlanet}
    />
  );
}
