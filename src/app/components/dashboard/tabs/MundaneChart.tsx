'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Calendar, Clock, RefreshCw, Loader } from 'lucide-react';
import { api } from '~/trpc/react';
import PlanetaryPositionsDisplay from '../mundane/PlanetaryPositionsDisplay';
import HousePositionsDisplay from '../mundane/HousePositionsDisplay';
import ChartDetailsPanel from '../mundane/ChartDetailsPanel';
import LocationTimeSelector from '../mundane/LocationTimeSelector';

interface MundaneState {
  dateTime: Date;
  latitude: number;
  longitude: number;
  timezone: string;
  useCurrentLocation: boolean;
}

export default function MundaneChart() {
  const [state, setState] = useState<MundaneState>({
    dateTime: new Date(),
    latitude: 28.6139,
    longitude: 77.209,
    timezone: "+5:30",
    useCurrentLocation: false,
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // TRPC query for chart calculation
  const calculateChartQuery = api.mundane.calculateChart.useQuery(
    {
      dateTime: state.dateTime,
      latitude: state.latitude,
      longitude: state.longitude,
      timezone: state.timezone,
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Request browser geolocation
  const requestCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported in this browser");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          latitude: Math.round(position.coords.latitude * 10000) / 10000,
          longitude: Math.round(position.coords.longitude * 10000) / 10000,
          useCurrentLocation: true,
        }));
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError(`Geolocation error: ${error.message}`);
        setIsLoadingLocation(false);
      }
    );
  }, []);

  // Handle state updates
  const handleLocationChange = (lat: number, lng: number) => {
    setState((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      useCurrentLocation: false,
    }));
  };

  const handleDateTimeChange = (dateTime: Date) => {
    setState((prev) => ({
      ...prev,
      dateTime,
    }));
  };

  const handleTimezoneChange = (timezone: string) => {
    setState((prev) => ({
      ...prev,
      timezone,
    }));
  };

  const handleRefresh = () => {
    setState((prev) => ({
      ...prev,
      dateTime: new Date(),
    }));
  };

  const isLoading = calculateChartQuery.isLoading;
  const isError = calculateChartQuery.isError;
  const data = calculateChartQuery.data;

  return (
    <div className="w-full h-full flex flex-col bg-[#0F0D0C] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#2D241E] p-4 bg-[#14110F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#E29626]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#E29626]">
            Mundane Chart (Sidereal)
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`p-1.5 rounded transition-colors ${
            isLoading
              ? 'text-stone-600 cursor-not-allowed'
              : 'text-stone-400 hover:text-[#E29626]'
          }`}
          title="Refresh to current time"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto flex gap-4 p-4">
          {/* Left Panel: Chart Details */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto">
            {data && (
              <ChartDetailsPanel
                data={data}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right Panel: Displays */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto relative">
            {isLoading && (
              <div className="flex items-center justify-center h-96 gap-2 text-stone-500">
                <Loader size={20} className="animate-spin" />
                <span>Calculating chart...</span>
              </div>
            )}

            {isError && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded text-red-300 text-xs">
                {calculateChartQuery.error?.message || "Failed to calculate chart"}
              </div>
            )}

            {data && !isLoading && (
              <div className="relative">
                <div className="absolute top-4 left-4 z-20 w-full max-w-md">
                  <LocationTimeSelector
                    state={state}
                    onLocationChange={handleLocationChange}
                    onDateTimeChange={handleDateTimeChange}
                    onTimezoneChange={handleTimezoneChange}
                    onRequestCurrentLocation={requestCurrentLocation}
                    isLoadingLocation={isLoadingLocation}
                    locationError={locationError}
                  />
                </div>

                <div className="pt-64">
                  <PlanetaryPositionsDisplay planets={data.planets} data={data} />

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}