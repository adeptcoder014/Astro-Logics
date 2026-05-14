'use client'
import React from 'react';
import { MapPin, Clock, Calendar, Loader } from 'lucide-react';

interface LocationTimeSelectorProps {
  state: {
    dateTime: Date;
    latitude: number;
    longitude: number;
    timezone: string;
    useCurrentLocation: boolean;
  };
  onLocationChange: (lat: number, lng: number) => void;
  onDateTimeChange: (dateTime: Date) => void;
  onTimezoneChange: (timezone: string) => void;
  onRequestCurrentLocation: () => void;
  isLoadingLocation: boolean;
  locationError: string | null;
}

const COMMON_TIMEZONES = [
  { label: "UTC", value: "+0:00" },
  { label: "IST (India)", value: "+5:30" },
  { label: "EST (US East)", value: "-5:00" },
  { label: "CST (US Central)", value: "-6:00" },
  { label: "PST (US West)", value: "-8:00" },
  { label: "GMT+1 (Europe)", value: "+1:00" },
  { label: "GMT+2 (Europe)", value: "+2:00" },
];

export default function LocationTimeSelector({
  state,
  onLocationChange,
  onDateTimeChange,
  onTimezoneChange,
  onRequestCurrentLocation,
  isLoadingLocation,
  locationError,
}: LocationTimeSelectorProps) {
  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    onLocationChange(val, state.longitude);
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    onLocationChange(state.latitude, val);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(state.dateTime);
    newDate.setUTCFullYear(year, month - 1, day);
    onDateTimeChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newDate = new Date(state.dateTime);
    newDate.setUTCHours(hours, minutes, 0);
    onDateTimeChange(newDate);
  };

  const dateStr = state.dateTime.toISOString().split('T')[0];
  const timeStr = `${String(state.dateTime.getUTCHours()).padStart(2, '0')}:${String(state.dateTime.getUTCMinutes()).padStart(2, '0')}`;

  return (
    <div className="bg-[#1A1815] border border-[#2D241E] rounded p-4">
      <div className="flex items-start gap-6">
        {/* Location Section */}
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold text-stone-400 flex items-center gap-1">
            <MapPin size={12} />
            Location
          </label>

          <button
            onClick={onRequestCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full px-2 py-1.5 text-xs font-semibold text-center bg-[#E29626] text-[#0F0D0C] rounded hover:bg-[#F0A030] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
          >
            {isLoadingLocation ? (
              <>
                <Loader size={12} className="animate-spin" />
                Locating...
              </>
            ) : (
              <>
                <MapPin size={12} />
                Use Current Location
              </>
            )}
          </button>

          {locationError && (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-700 rounded p-2">
              {locationError}
            </div>
          )}

          {state.useCurrentLocation && (
            <div className="text-xs text-green-400 bg-green-900/20 border border-green-700 rounded p-2">
              Using current location
            </div>
          )}

          <div className="text-xs text-gray-600 bg-purple-50 p-2 rounded border border-rose-200">
            📍 Current: {state.latitude.toFixed(4)}°, {state.longitude.toFixed(4)}°
          </div>
        </div>

        {/* Time Section - Placeholder for future time controls */}
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold text-stone-400 flex items-center gap-1">
            <Clock size={12} />
            Time Controls
          </label>
          <div className="text-xs text-stone-500 p-2 bg-stone-800/50 rounded border border-stone-700">
            Time controls will be added here
          </div>
        </div>
      </div>
    </div>
  );
}
