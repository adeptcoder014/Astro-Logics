'use client'
import React, { useState } from 'react';
import { Loader, AlertCircle, MapPin } from 'lucide-react';

interface NativityChartFormProps {
  isLoading: boolean;
  isError: boolean;
  error: any;
  onSubmit: (data: any) => Promise<void>;
}

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const COORDINATE_SYSTEMS = [
  { value: 'SIDEREAL', label: 'Sidereal (Vedic/Lahiri)' },
  { value: 'TROPICAL', label: 'Tropical (Western)' },
];

export default function NativityChartForm({
  isLoading,
  isError,
  error,
  onSubmit,
}: NativityChartFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    birthDateTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    timezone: 'UTC',
    latitude: '',
    longitude: '',
    locationName: '',
    coordinateSystem: 'SIDEREAL',
    timeResolution: 'MINUTE',
  });

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const handleGetGeolocation = async () => {
    setGeoLoading(true);
    setGeoError('');
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Try to get location name from coordinates
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        const locationName =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          'Location';

        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(4),
          longitude: longitude.toFixed(4),
          locationName,
        }));
      } catch {
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(4),
          longitude: longitude.toFixed(4),
        }));
      }
    } catch (err) {
      setGeoError('Failed to get location. Please enable geolocation or enter manually.');
    } finally {
      setGeoLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a chart name');
      return;
    }

    if (!formData.birthDateTime) {
      alert('Please enter birth date and time');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      alert('Please enter latitude and longitude');
      return;
    }

    if (!formData.locationName.trim()) {
      alert('Please enter location name');
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        birthDateTime: new Date(formData.birthDateTime),
        timezone: formData.timezone,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        locationName: formData.locationName,
        coordinateSystem: formData.coordinateSystem,
        timeResolution: formData.timeResolution,
      });
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6">
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        {/* Error Messages */}
        {isError && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/30 flex gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-500">
              {error?.message || 'Failed to create chart. Please try again.'}
            </div>
          </div>
        )}

        {geoError && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/30 flex gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-500">{geoError}</div>
          </div>
        )}

        {/* Chart Name */}
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">
            Chart Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Birth Chart - Jane Doe"
            className="w-full px-3 py-2 rounded bg-[#1A1714] border border-[#2D241E] text-sm text-white placeholder-stone-600 focus:border-[#E29626] focus:outline-none transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional notes about this chart..."
            rows={2}
            className="w-full px-3 py-2 rounded bg-[#1A1714] border border-[#2D241E] text-sm text-white placeholder-stone-600 focus:border-[#E29626] focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Birth Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Birth Date & Time (UTC) *
            </label>
            <input
              type="datetime-local"
              name="birthDateTime"
              value={formData.birthDateTime}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[#1A1714] border border-[#2D241E] text-sm text-white focus:border-[#E29626] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Timezone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[#1A1714] border border-[#2D241E] text-sm text-white focus:border-[#E29626] focus:outline-none transition-colors"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-2">
            Location *
          </label>
          <div className="space-y-2">
            <input
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
              placeholder="e.g., New York, USA"
              className="w-full px-3 py-2 rounded bg-[#1A1714] border border-[#2D241E] text-sm text-white placeholder-stone-600 focus:border-[#E29626] focus:outline-none transition-colors"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Latitude (-90 to 90)"
                step="0.0001"
                min="-90"
                max="90"
                className="px-3 py-2 rounded bg-[#1A1714] border border-[#2D241E] text-sm text-white placeholder-stone-600 focus:border-[#E29626] focus:outline-none transition-colors"
              />
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Longitude (-180 to 180)"
                step="0.0001"
                min="-180"
                max="180"
                className="px-3 py-2 rounded bg-[#1A1714] border border-[#2D241E] text-sm text-white placeholder-stone-600 focus:border-[#E29626] focus:outline-none transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleGetGeolocation}
              disabled={geoLoading}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold bg-[#2D241E] text-stone-300 rounded hover:bg-[#3D3428] transition-colors disabled:opacity-50"
            >
              {geoLoading ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin size={12} />
                  Use Current Location
                </>
              )}
            </button>
          </div>
        </div>

        {/* Coordinate System */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Coordinate System
            </label>
            <select
              name="coordinateSystem"
              value={formData.coordinateSystem}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[#1A1714] border border-[#2D241E] text-sm text-white focus:border-[#E29626] focus:outline-none transition-colors"
            >
              {COORDINATE_SYSTEMS.map((system) => (
                <option key={system.value} value={system.value}>
                  {system.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Time Resolution
            </label>
            <select
              name="timeResolution"
              value={formData.timeResolution}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[#1A1714] border border-[#2D241E] text-sm text-white focus:border-[#E29626] focus:outline-none transition-colors"
            >
              <option value="MINUTE">Minute</option>
              <option value="SECOND">Second</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 pt-4 border-t border-[#2D241E]">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-[#E29626] text-[#0F0D0C] rounded hover:bg-[#F0A030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Creating...
              </>
            ) : (
              'Create Chart'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
