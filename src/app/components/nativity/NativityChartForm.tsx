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
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai',
  'Asia/Tokyo', 'Australia/Sydney',
];

export default function NativityChartForm({ isLoading, isError, error, onSubmit }: NativityChartFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    birthDateTime: new Date().toISOString().slice(0, 16),
    timezone: 'UTC',
    latitude: '',
    longitude: '',
    locationName: '',
    coordinateSystem: 'SIDEREAL',
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, birthDateTime: new Date(formData.birthDateTime), latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) });
  };

  // Field styles: Dark background, light text, bold borders
  const fieldClass = "w-full px-4 py-3 rounded-lg bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] border-2 border-[var(--color-primary-dark)] focus:border-[var(--color-accent-orange)] outline-none font-mono text-sm transition-all";
  const labelClass = "block text-[11px] font-black text-slate-800 uppercase tracking-widest mb-1.5";

  return (
    <div className="bg-[var(--color-primary-light)] w-full h-full p-8 bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {isError && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold">{error?.message}</div>}

        <div>
          <label className={labelClass}>Chart Name</label>
          <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={fieldClass} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date & Time (UTC)</label>
            <input type="datetime-local" value={formData.birthDateTime} onChange={e => setFormData({ ...formData, birthDateTime: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Timezone</label>
            <select value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })} className={fieldClass}>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Location Coordinates</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} placeholder="LAT" className={fieldClass} />
            <input type="number" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} placeholder="LONG" className={fieldClass} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-[var(--color-accent-orange)] text-[var(--color-primary-dark)] font-black uppercase tracking-[0.2em] text-sm hover:brightness-110 transition-all shadow-lg active:scale-[0.98]"
        >
          {isLoading ? <Loader size={18} className="animate-spin mx-auto" /> : 'GENERATE CHART'}
        </button>
      </form>
    </div>
  );
}