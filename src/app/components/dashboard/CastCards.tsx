'use client';

import React, { useEffect } from 'react';
import { api } from '~/trpc/react';
import Image from 'next/image';

interface CastCardsProps {
  currentStoryId: string;
  selectedPlanetId: string;
  onSelectPlanet: (id: string) => void;
}

const PLANET_ARTISTRY_MATRIX: Record<
  string,
  {
    title: string;
    imageUrl: string;
    subtext: string;
    tag1: string;
    tag2: string;
    stars: number;
    ratingText: string;
    tintGradient: string; 
    titleColor: string;
  }
> = {
  SATURN: {
    title: "SATURN",
    subtext: "Directed by Architect Ring",
    imageUrl: "/saturn-removebg1.png",
    tag1: "Sci-Fi",
    tag2: "Action",
    stars: 4,
    ratingText: "4/5",
    tintGradient: "from-emerald-950/95 via-emerald-950/80 to-transparent", 
    titleColor: "text-emerald-400"
  },
  MOON: {
    title: "THE MOON",
    subtext: "Directed by Lunar Receptor",
    imageUrl: "/saturn-removebg.png",
    tag1: "Sci-Fi",
    tag2: "System",
    stars: 4,
    ratingText: "4/5",
    tintGradient: "from-sky-950/95 via-sky-950/80 to-transparent", // Blue tint matching image_574148.png
    titleColor: "text-cyan-400"
  },
  MARS: {
    title: "MARS",
    subtext: "Directed by Warlord Core",
    imageUrl: "/saturn-removebg1.png",
    tag1: "Action",
    tag2: "Impact",
    stars: 5,
    ratingText: "5/5",
    tintGradient: "from-rose-950/95 via-rose-950/80 to-transparent",
    titleColor: "text-rose-400"
  },
  JUPITER: {
    title: "JUPITER",
    subtext: "Directed by Guru Vortex",
    imageUrl: "/ketu.png",
    tag1: "Sci-Fi",
    tag2: "Expansion",
    stars: 4,
    ratingText: "4/5",
    tintGradient: "from-amber-950/95 via-amber-950/80 to-transparent",
    titleColor: "text-amber-400"
  },
};

const FALLBACK_ARTISTRY = {
  title: "UNKNOWN NODE",
  subtext: "Directed by External Driver",
    imageUrl: "/ketu.png",
  tag1: "Sci-Fi",
  tag2: "Driver",
  stars: 4,
  ratingText: "4/5",
  tintGradient: "from-slate-950/95 via-slate-950/80 to-transparent",
  titleColor: "text-slate-400"
};

export default function CastCards({ currentStoryId, selectedPlanetId, onSelectPlanet }: CastCardsProps) {
  const { data: scenes, isLoading } = api.nativity.getPlanetaryScenes.useQuery(
    { currentStoryId },
    { enabled: !!currentStoryId }
  );

  useEffect(() => {
    if (scenes && scenes.length > 0 && !selectedPlanetId) {
      onSelectPlanet(scenes[0]._id);
    }
  }, [scenes, selectedPlanetId, onSelectPlanet]);

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-10 w-full justify-start pt-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="w-[170px] h-[240px] rounded-[20px] bg-slate-900 animate-pulse" />
        ))}
      </div>
    );
  }

  const activeScenes = scenes || [];

  return (
    /* Top padding allows character head space to pop over neatly without cutting off layout boundaries */
    <div className="flex flex-wrap gap-x-5 gap-y-12 w-full justify-start pt-10">
      {activeScenes.map((scene) => {
        const planetKey = scene.planet?.toUpperCase() || '';
        const art = PLANET_ARTISTRY_MATRIX[planetKey] || FALLBACK_ARTISTRY;
        const isSelected = selectedPlanetId === scene._id;

        return (
          <button
            key={scene._id}
            onClick={() => onSelectPlanet(scene._id)}
            className={`group relative w-[170px] h-[240px] rounded-[20px] text-left transition-all duration-300 cursor-pointer border-0 outline-none select-none bg-slate-950
              ${isSelected ? 'ring-4 ring-sky-400/60 scale-[1.03] shadow-2xl' : 'hover:scale-[1.01] shadow-lg'}`}
          >
            {/* 3D POPPING IMAGE CONTAINER */}
            <div className="absolute -top-8 inset-x-0 bottom-0 pointer-events-none z-10 overflow-visible">
              <div className="relative w-full h-full">
                <Image
                  src={art.imageUrl}
                  fill
                  alt={art.title}
                  /* object-top pulls character framing upwards so the head breaks the top border edge */
                  className="object-contain object-top transition-all duration-500 ease-out transform group-hover:scale-110 group-hover:-translate-y-2 filter drop-shadow-[0_10px_12px_rgba(0,0,0,0.6)]"
                  unoptimized
                />
              </div>
            </div>

            {/* RADIAL POSTER BACKDROP GRAPHICS MASK */}
            <div className="absolute inset-0 z-0 rounded-[20px] overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
              {/* Dense gradient anchoring lower typography text readability */}
              <div className={`absolute inset-0 bg-gradient-to-t ${art.tintGradient}`} />
            </div>

            {/* TYPOGRAPHY INTERFACE STACK OVERLAY */}
            <div className="absolute bottom-0 inset-x-0 p-3.5 z-20 flex flex-col gap-0.5 justify-end rounded-b-[20px] bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              
              {/* Profile Title Header */}
              <h4 className={`text-base font-black tracking-tight uppercase leading-tight font-sans drop-shadow-md ${art.titleColor}`}>
                {scene.planet || art.title}
              </h4>

              {/* Subtext Attribution */}
              <p className="text-[9px] font-semibold text-white/95 truncate antialiased font-sans drop-shadow-sm">
                {scene.storyFunction || art.subtext}
              </p>

              {/* Evaluation Star System */}
              <div className="flex items-center gap-1 my-0.5">
                <div className="flex items-center gap-0.5 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-2.5 h-2.5 ${i < art.stars ? 'fill-current' : 'text-white/30'}`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-white/80 font-sans tracking-wide">
                  {art.ratingText}
                </span>
              </div>

              {/* Genre Pills */}
              <div className="flex items-center gap-1 mt-1">
                <span className="bg-sky-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-[5px] shadow-sm font-sans tracking-tight">
                  {art.tag1}
                </span>
                <span className="bg-orange-600 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-[5px] shadow-sm font-sans tracking-tight">
                  {art.tag2}
                </span>
              </div>
            </div>

            {/* Active Selected Underglow Line */}
            {isSelected && (
              <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_-4px_14px_rgba(56,189,248,0.5)] z-30 rounded-b-[20px]" />
            )}
          </button>
        );
      })}
    </div>
  );
}