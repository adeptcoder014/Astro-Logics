'use client'
import React from 'react';
import { Trash2, Eye, Loader, AlertCircle, Calendar, MapPin, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface Chart {
  id: string;
  name: string;
  description?: string | null;
  birthDateTime: Date;
  locationName?: string | null;
  latitude: number;
  longitude: number;
  coordinateSystem: string;
  createdAt: Date;
}

interface NativityChartListProps {
  charts: Chart[];
  isLoading: boolean;
  isError: boolean;
  onSelectChart: (chart: { id: string; name: string }) => void;
  onDeleteChart: (chartId: string) => void;
}

export default function NativityChartList({
  charts,
  isLoading,
  isError,
  onSelectChart,
  onDeleteChart,
}: NativityChartListProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4 text-[var(--color-primary-dark)]">
          <Loader size={32} className="animate-spin text-[var(--color-accent-orange)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Decrypting Archives...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-red-600">
          <AlertCircle size={32} strokeWidth={1.5} />
          <span className="text-[10px] font-black uppercase tracking-widest">Signal Interrupted</span>
        </div>
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-12 text-center">
        <div className="max-w-xs">
          <div className="w-16 h-16 bg-[var(--color-primary-dark)]/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Globe className="text-[var(--color-ring-bronze)] opacity-30" size={32} />
          </div>
          <p className="text-[var(--color-primary-dark)] font-serif italic text-xl mb-2">The heavens are silent.</p>
          <p className="text-[var(--color-ring-bronze)] text-[10px] font-black uppercase tracking-[0.1em]">No records found in this sector.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {charts.map((chart, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={chart.id}
            className="group relative bg-white border border-[var(--color-ring-bronze)]/10 rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-[var(--color-accent-orange)]/30 transition-all duration-500 overflow-hidden"
          >
            {/* Background Accent Flare */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-glow)]/5 rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-700" />

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-black text-[var(--color-primary-dark)] tracking-tighter truncate leading-none mb-2 group-hover:text-[var(--color-accent-orange)] transition-colors">
                {chart.name}
              </h3>
              {chart.description ? (
                <p className="text-xs text-[var(--color-ring-bronze)] line-clamp-1 font-medium italic">
                  {chart.description}
                </p>
              ) : (
                <div className="h-4" />
              )}
            </div>

            {/* Technical Data Grid */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-[10px] font-bold text-[var(--color-primary-dark)]/60">
                <Calendar size={12} className="mr-2 text-[var(--color-accent-orange)]" />
                <span className="uppercase tracking-widest mr-auto">Birth</span>
                <span className="text-[var(--color-primary-dark)] font-black">
                   {new Date(chart.birthDateTime).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center text-[10px] font-bold text-[var(--color-primary-dark)]/60">
                <MapPin size={12} className="mr-2 text-[var(--color-accent-orange)]" />
                <span className="uppercase tracking-widest mr-auto">Location</span>
                <span className="text-[var(--color-primary-dark)] font-black truncate max-w-[120px]">
                  {chart.locationName || 'Unmarked'}
                </span>
              </div>

              <div className="flex items-center text-[10px] font-bold text-[var(--color-primary-dark)]/60">
                <Globe size={12} className="mr-2 text-[var(--color-accent-orange)]" />
                <span className="uppercase tracking-widest mr-auto">System</span>
                <span className="text-[var(--color-primary-dark)] font-black">{chart.coordinateSystem}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex gap-3 pt-5 border-t border-[var(--color-ring-bronze)]/5">
              <button
                onClick={() => onSelectChart({ id: chart.id, name: chart.name })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] rounded-xl hover:bg-[var(--color-accent-orange)] hover:text-white transition-all duration-300 shadow-lg shadow-[var(--color-primary-dark)]/10"
              >
                <Eye size={14} strokeWidth={2.5} />
                Engage
              </button>
              <button
                onClick={() => onDeleteChart(chart.id)}
                className="px-4 py-3 text-[var(--color-ring-bronze)]/40 hover:text-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl group/delete"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Subtle Timestamp */}
            <div className="absolute top-4 right-6 text-[8px] font-black uppercase tracking-widest text-[var(--color-ring-bronze)]/20">
              {formatDistanceToNow(new Date(chart.createdAt), { addSuffix: true })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}