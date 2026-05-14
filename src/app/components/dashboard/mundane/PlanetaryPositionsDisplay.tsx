'use client';
import React from 'react';

// Narrative-driven assets based on House Significations (Bhavas)
const BHAVA_ASSETS: Record<number, { type: string, img: string, style: string, text: string }> = {
  1:  { type: 'Self', img: "https://images.unsplash.com/photo-1503387762-592dea58ef21?q=80&w=600", style: 'from-blue-600/50', text: 'text-blue-50' }, // Identity/Light
  2:  { type: 'Wealth', img: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?q=80&w=600", style: 'from-amber-600/50', text: 'text-amber-50' }, // Gold/Values
  3:  { type: 'Effort', img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=600", style: 'from-orange-500/50', text: 'text-orange-50' }, // Movement/Hands
  4:  { type: 'Home', img: "https://images.stockcake.com/public/6/d/3/6d3b7b76-438b-435d-b683-576da10c5930_large/tropical-beach-house-stockcake.jpg", style: '', text: 'text-emerald-50' }, // Comfort/Roots
  5:  { type: 'Creativity', img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600", style: 'from-rose-500/50', text: 'text-rose-50' }, // Art/Children
  6:  { type: 'Conflict', img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600", style: 'from-slate-700/60', text: 'text-slate-200' }, // Mountains/Challenge
  7:  { type: 'Union', img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600", style: 'from-pink-600/50', text: 'text-pink-50' }, // Partnership
  8:  { type: 'Mystery', img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600", style: 'from-purple-900/60', text: 'text-purple-100' }, // Occult/Transformation
  9:  { type: 'Fortune', img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600", style: 'from-cyan-600/50', text: 'text-cyan-50' }, // Pilgrimage/High Wisdom
  10: { type: 'Karma', img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600", style: 'from-gray-800/60', text: 'text-white' }, // Empire/Career
  11: { type: 'Gains', img: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=600", style: 'from-yellow-500/50', text: 'text-yellow-50' }, // Social/Network
  12: { type: 'Moksha', img: "https://images.unsplash.com/photo-1439405326854-014607f694d7?q=80&w=600", style: 'from-indigo-900/70', text: 'text-indigo-100' }, // Ocean/Solitude
};

interface PlanetData { planet: string; degree: number; sign: string; house: number; }
interface HouseData { house: string; sign: string; }
interface VedicChartProps { planets: PlanetData[]; data: { houses: HouseData[] }; }

export default function NarrativeVedicChart({ planets, data }: VedicChartProps) {
  const houseMap = planets.reduce((acc, p) => {
    if (!acc[p.house]) acc[p.house] = [];
    acc[p.house].push(p);
    return acc;
  }, {} as Record<number, PlanetData[]>);

  // House coordinates remain consistent for North Indian Diamond Chart
  const houseConfig = [
    { id: 1,  clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", area: "top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44.5%] h-[44.5%]" },
    { id: 4,  clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", area: "top-1/2 left-[25.2%] -translate-x-1/2 -translate-y-1/2 w-[44.5%] h-[44.5%]" },
    { id: 7,  clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", area: "bottom-[25%] left-1/2 -translate-x-1/2 translate-y-1/2 w-[44.5%] h-[44.5%]" },
    { id: 10, clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", area: "top-1/2 right-[25.2%] translate-x-1/2 -translate-y-1/2 w-[44.5%] h-[44.5%]" },
    { id: 2,  clip: "polygon(0 0, 100% 0, 50% 100%)", area: "top-[13.5%] left-[25.5%] -translate-x-1/2 -translate-y-1/2 w-[39%] h-[24.5%]" },
    { id: 12, clip: "polygon(0 0, 100% 0, 50% 100%)", area: "top-[13.5%] right-[25.5%] translate-x-1/2 -translate-y-1/2 w-[39%] h-[24.5%]" },
    { id: 6,  clip: "polygon(50% 0, 0 100%, 100% 100%)", area: "bottom-[13.5%] left-[25.5%] -translate-x-1/2 translate-y-1/2 w-[39%] h-[24.5%]" },
    { id: 8,  clip: "polygon(50% 0, 0 100%, 100% 100%)", area: "bottom-[13.5%] right-[25.5%] translate-x-1/2 translate-y-1/2 w-[39%] h-[24.5%]" },
    { id: 3,  clip: "polygon(0 0, 0 100%, 100% 50%)", area: "top-[25.5%] left-[13.5%] -translate-x-1/2 -translate-y-1/2 w-[24.5%] h-[39%]" },
    { id: 5,  clip: "polygon(0 0, 0 100%, 100% 50%)", area: "bottom-[25.5%] left-[13.5%] -translate-x-1/2 translate-y-1/2 w-[24.5%] h-[39%]" },
    { id: 11, clip: "polygon(100% 0, 100% 100%, 0 50%)", area: "top-[25.5%] right-[13.5%] translate-x-1/2 -translate-y-1/2 w-[24.5%] h-[39%]" },
    { id: 9,  clip: "polygon(100% 0, 100% 100%, 0 50%)", area: "bottom-[25.5%] right-[13.5%] translate-x-1/2 translate-y-1/2 w-[24.5%] h-[39%]" },
  ];

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto p-4 bg-black rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white/5">
      <div className="absolute inset-0">
        {houseConfig.map((config) => {
          const bhava = BHAVA_ASSETS[config.id as keyof typeof BHAVA_ASSETS];
          const currentHouseData = data.houses[config.id - 1];
          
          return (
            <div 
              key={config.id} 
              className={`absolute flex items-center justify-center ${config.area} group overflow-hidden transition-all duration-700 hover:z-20`}
              style={{ clipPath: config.clip }}
            >
              {/* Contextual Environment Background */}
              <img 
                src={bhava.img} 
                className="absolute inset-0 w-full h-full object-cover scale-125 group-hover:scale-100 transition-transform duration-[2000ms] opacity-50"
                alt={bhava.type}
              />
              
              {/* Narrative Tint Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${bhava.style} to-black/80 mix-blend-multiply`} />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Sign and Bhava Purpose */}
                <div className="text-center mb-2">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 ${bhava.text}`}>
                    {bhava.type}
                  </p>
                  <p className={`text-[16px] font-black tracking-widest ${bhava.text}`}>
                    {currentHouseData?.sign.substring(0, 3)}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 max-w-[80%]">
                  {houseMap[config.id]?.map((p) => (
                    <div 
                      key={p.planet} 
                      className="group/planet relative w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl transition-all hover:border-white/40 hover:scale-110"
                    >
                      <div className="flex flex-col items-center leading-none">
                        <span className="text-[9px] font-black text-white">{p.planet.substring(0, 2)}</span>
                        <span className="text-[6px] font-bold text-white/50">{Math.floor(p.degree)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}