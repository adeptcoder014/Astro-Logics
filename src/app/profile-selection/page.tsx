'use client'
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { 
  Calendar, MapPin, Globe, EyeOff, 
  ArrowUpRight, Star, Clock, Compass 
} from 'lucide-react';

export default function ProfileBentoSelection() {
  const router = useRouter();
  const { data: charts, isLoading } = api.nativity.getCharts.useQuery();

  if (isLoading) return <div className="min-h-screen bg-[var(--color-primary-light)] animate-pulse" />;
  
  // Using the specific data point provided
  const profile = Array.isArray(charts) ? charts[0] : charts;

  return (
    <div className="min-h-screen bg-[var(--color-primary-light)] p-6 lg:p-12 text-[var(--color-primary-dark)]">
      <div className="mx-auto max-w-6xl">
        
        {/* Header Section */}
        <header className="mb-12 flex items-end justify-between border-b border-[var(--color-ring-bronze)] pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-orange)]">
              System Entry // Auth-01
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tighter">SELECT NATIVITY</h1>
          </div>
          <div className="text-right font-mono text-sm opacity-60">
            {new Date().toLocaleDateString()} // {profile?.locationName?.toUpperCase()}
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div 
          onClick={() => router.push('/dashboard')}
          className="group cursor-pointer grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-500 hover:scale-[1.01]"
        >
          
          {/* Main Identity Block (Cosmic Blue) */}
          <div className="md:col-span-2 md:row-span-2 bg-[var(--color-primary-dark)] rounded-2xl p-8 flex flex-col justify-between text-[var(--color-primary-light)] relative overflow-hidden shadow-2xl">
            <div className="z-10">
              <div className="inline-block px-3 py-1 rounded-full border border-[var(--color-accent-glow)] text-[var(--color-accent-glow)] text-[10px] font-bold tracking-widest uppercase mb-6">
                Active Collective
              </div>
              <h2 className="text-6xl font-black tracking-tighter leading-none mb-2 italic">
                {profile?.name}
              </h2>
              <p className="text-[var(--color-accent-glow)] font-medium opacity-80 uppercase tracking-widest text-sm">
                Lagna // Uncalibrated
              </p>
            </div>
            
            <div className="z-10 mt-12 flex items-center gap-4">
              <div className="h-px flex-1 bg-[var(--color-accent-glow)] opacity-30" />
              <ArrowUpRight size={32} className="text-[var(--color-accent-orange)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            {/* Background Decorative Rings (Matching your logo style) */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-[1px] border-[var(--color-ring-bronze)] opacity-20" />
            <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full border-[1px] border-[var(--color-accent-glow)] opacity-10" />
          </div>

          {/* Spatio-Temporal Block */}
          <div className="bg-white/50 backdrop-blur-md border border-[var(--color-ring-bronze)] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <Clock size={20} className="text-[var(--color-accent-orange)]" />
            <div>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Birth Epoch</p>
              <p className="font-bold text-lg leading-tight">1995-07-14</p>
              <p className="text-xs opacity-70">14:28:00 UTC+5.5</p>
            </div>
          </div>

          {/* Coordinate System Block */}
          <div className="bg-[var(--color-accent-orange)] rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg">
            <Compass size={20} />
            <div>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Coordinate System</p>
              <p className="font-bold text-2xl tracking-tighter">{profile?.coordinateSystem}</p>
            </div>
          </div>

          {/* Location Block */}
          <div className="md:col-span-2 bg-white/80 border border-[var(--color-ring-bronze)] rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-primary-light)] rounded-xl">
                <MapPin size={24} className="text-[var(--color-primary-dark)]" />
              </div>
              <div>
                <p className="text-[10px] font-bold opacity-50 uppercase">Geo Location</p>
                <p className="font-bold text-xl">{profile?.locationName}, IN</p>
                <p className="text-xs font-mono opacity-60 italic">{profile?.latitude}°N / {profile?.longitude}°E</p>
              </div>
            </div>
            <Star size={20} className="text-[var(--color-accent-glow)] fill-current" />
          </div>

        </div>

        {/* System Mechanics Footer */}
        <footer className="mt-12 flex justify-between items-center text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
          <p>Engine ID // SEC-01</p>
          <p>Validated Matrix // {profile?._id?.substring(0,8)}</p>
        </footer>
      </div>
    </div>
  );
}