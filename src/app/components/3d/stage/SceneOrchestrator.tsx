'use client';

import { useMemo } from 'react';
import { api } from '~/trpc/react';
import { Environment, Float, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { getProject } from '@theatre/core';
import { SheetProvider } from '@theatre/r3f';
import { Character } from '../models/character';
import { Office } from '../models/office';
import CameraRig from './CameraRig';
import CinematicBackground from './CinematicBackground';
import { parseNarrative } from '../../scriptParser';

const project = getProject('Astro_Orchestra_Project');
const mainSheet = project.sheet('Main Scene');

const PLANET_COLORS: Record<string, string> = {
  SUN: '#FFD700', MOON: '#E0E0E0', MERCURY: '#9E9E9E',
  VENUS: '#F48FB1', MARS: '#FF3D00', JUPITER: '#D7CCC8',
  SATURN: '#CFD8DC', URANUS: '#B2EBF2', NEPTUNE: '#3F51B5'
};

export default function SceneOrchestrator({ nativityChartId, currentLineIndex }: { nativityChartId: string, currentLineIndex: number }) {
  const { data: stories } = api.nativity.getCurrentStories.useQuery({ nativityChartId });
  const currentStory = stories?.[0];

  const parsedScript = useMemo(() =>
    currentStory ? parseNarrative(currentStory.mainNarrative) : [],
    [currentStory]
  );

  const RADIUS = 22;

  const planetPositions = useMemo(() => {
    if (!currentStory?.scenes) return {};
    return currentStory.scenes.reduce((acc: any, scene: any) => {
      const houseKey = scene.house || (Math.floor(scene.currentLongitude / 30) + 1);
      if (!acc[houseKey]) acc[houseKey] = [];
      acc[houseKey].push(scene);
      return acc;
    }, {});
  }, [currentStory]);

  const activeDialogue = parsedScript[currentLineIndex];

  return (
    <SheetProvider sheet={mainSheet}>
      <CameraRig currentLineIndex={currentLineIndex} parsedScript={parsedScript} />
      <CinematicBackground color="#050510" />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 25, 10]} intensity={2.5} color="#E29626" castShadow />

      <group>
        {Array.from({ length: 12 }).map((_, i) => {
          const houseNum = i + 1;
          const angle = (i / 12) * Math.PI * 2;
          const x = Math.cos(angle) * RADIUS;
          const z = Math.sin(angle) * RADIUS;
          const occupants = planetPositions[houseNum] || [];

          return (
            <group key={houseNum} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
              <Office scale={0.4} opacity={0.1} transparent />

              {occupants.map((p: any, idx: number) => {
                const pName = p.planet.toUpperCase();
                const isTalking = activeDialogue?.type === "DIALOGUE" &&
                  activeDialogue.character?.toUpperCase().includes(pName);

                const text = activeDialogue?.text?.toLowerCase() || "";
                const mood = isTalking 
                  ? (text.includes("!") || text.length > 50 ? "sarcastic" : "happy") 
                  : "neutral";

                return (
                  <group key={p.id} position={[idx * 2.5 - (occupants.length - 1), 0, 0]}>
                    <Float speed={isTalking ? 5 : 1} floatIntensity={isTalking ? 2 : 0.4}>
                      <Character
                        activeAction={isTalking ? "Talk" : "Idle"}
                        mood={mood}
                        planetColor={PLANET_COLORS[pName] || '#FFFFFF'}
                        scale={isTalking ? 1.4 : 1} 
                      />

                      {isTalking && (
                        <Html position={[0, 4.2, 0]} center distanceFactor={15}>
                           <div className="relative flex flex-col bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl w-[220px]">
                              <span className="text-[10px] text-purple-400 font-bold mb-1 uppercase tracking-widest">{p.planet}</span>
                              <p className="text-[14px] text-white leading-tight font-medium italic">“{activeDialogue.text}”</p>
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rotate-45 border-r border-b border-white/20" />
                           </div>
                        </Html>
                      )}
                    </Float>
                  </group>
                );
              })}
            </group>
          );
        })}
      </group>

      <Environment preset="night" />
      <ContactShadows opacity={0.5} scale={60} blur={2.5} far={10} color="#000000" />
    </SheetProvider>
  );
}