'use client'
import React from 'react';
import { Info } from 'lucide-react';

interface ChartData {
  dateTime: string;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  ascendant: {
    longitude: number;
    degree: number;
    sign: string;
  };
  // mc removed (Vedic)
}

interface ChartDetailsPanelProps {
  data: ChartData;
  isLoading: boolean;
}

export default function ChartDetailsPanel({
  data,
  isLoading,
}: ChartDetailsPanelProps) {
  if (isLoading || !data) return null;

  const dateTime = new Date(data.dateTime);

  const formattedDate = dateTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = dateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="bg-[#1A1815] border border-[#2D241E] rounded p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#E29626] mb-3 flex items-center gap-1">
        <Info size={12} />
        Chart Details
      </h3>

      <div className="space-y-3">
        {/* Date & Time */}
        <div className="bg-[#0F0D0C] border border-[#2D241E] rounded p-3">
          <div className="text-xs text-stone-500 mb-1">Date & Time (UTC)</div>
          <div className="text-sm font-semibold text-stone-200">{formattedDate}</div>
          <div className="text-sm font-semibold text-stone-200">{formattedTime}</div>
          <div className="text-xs text-stone-500 mt-1">
            Timezone: {data.location.timezone}
          </div>
        </div>

        {/* Location */}
        <div className="bg-[#0F0D0C] border border-[#2D241E] rounded p-3">
          <div className="text-xs text-stone-500 mb-1">Observer Location</div>
          <div className="text-xs font-mono text-[#E29626]">
            Lat: {data.location.latitude.toFixed(4)}°
          </div>
          <div className="text-xs font-mono text-[#E29626]">
            Lng: {data.location.longitude.toFixed(4)}°
          </div>
        </div>

        {/* Ascendant */}
        <div className="bg-[#0F0D0C] border border-[#2D241E] rounded p-3">
          <div className="text-xs text-stone-500 mb-1">Ascendant (Lagna)</div>
          <div className="text-lg font-bold text-[#E29626]">
            {data.ascendant.sign} {data.ascendant.degree.toFixed(2)}°
          </div>
          <div className="text-xs font-mono text-stone-400">
            Lon: {data.ascendant.longitude.toFixed(2)}°
          </div>
        </div>

        {/* Info Box */}
        <div className="text-xs text-stone-500 bg-[#0F0D0C] p-2 rounded border border-[#2D241E]">
          <div className="font-semibold text-stone-400 mb-1">Vedic Chart</div>
          <div>
            Whole sign houses based on Ascendant. Planets are mapped relative to Lagna.
          </div>
        </div>
      </div>
    </div>
  );
}