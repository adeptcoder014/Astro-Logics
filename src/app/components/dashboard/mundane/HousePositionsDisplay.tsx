'use client'
import React from 'react';

interface House {
  house: string;
  longitude: number;
  degree: number;
  sign: string;
}

interface HousePositionsDisplayProps {
  houses: House[];
}

export default function HousePositionsDisplay({
  houses,
}: HousePositionsDisplayProps) {
  const getHouseNumber = (houseName: string): number => {
    const match = houseName.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Angular houses (1, 4, 7, 10) are most important
  const isAngularHouse = (houseNum: number) => [1, 4, 7, 10].includes(houseNum);

  return (
    <div className="bg-[#1A1815] border border-[#2D241E] rounded p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#E29626] mb-3">
        House Cusps (Placidus)
      </h3>

      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {houses.map((house) => {
          const houseNum = getHouseNumber(house.house);
          const isAngular = isAngularHouse(houseNum);

          return (
            <div
              key={house.house}
              className={`rounded p-2 border transition-colors ${
                isAngular
                  ? 'bg-[#2D241E] border-[#E29626]'
                  : 'bg-[#0F0D0C] border-[#2D241E] hover:border-[#E29626]'
              }`}
            >
              <div className="text-xs font-semibold text-stone-200 mb-1">
                {house.house}
                {isAngular && <span className="ml-1 text-[#E29626]">★</span>}
              </div>
              <div className="text-xs text-stone-400 mb-1">
                {house.sign} {house.degree.toFixed(2)}°
              </div>
              <div className="text-xs font-mono text-[#E29626]">
                {house.longitude.toFixed(2)}°
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-stone-500 bg-[#0F0D0C] p-2 rounded border border-[#2D241E]">
        ★ Angular houses (1, 4, 7, 10) are most prominent and influential in the mundane chart.
      </div>
    </div>
  );
}
