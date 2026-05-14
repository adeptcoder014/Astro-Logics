'use client'
import React, { useState } from 'react';
import { Plus, Loader, AlertCircle, ChevronLeft, Star, Trash2 } from 'lucide-react';
import { api } from '~/trpc/react';
import { motion, AnimatePresence } from 'framer-motion';
import NativityChartList from '../nativity/NativityChartList';
import NativityChartForm from '../nativity/NativityChartForm';
import NativityChartViewer from '../nativity/NativityChartViewer';

type ViewMode = 'list' | 'create' | 'view';

interface SelectedChart {
  id: string;
  name: string;
}

export default function NativityChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedChart, setSelectedChart] = useState<SelectedChart | null>(null);

  const chartsQuery = api.nativity.getCharts.useQuery();
  const createMutation = api.nativity.createChart.useMutation({
    onSuccess: (newChart) => {
      chartsQuery.refetch();
      setSelectedChart({ id: newChart.id, name: newChart.name });
      setViewMode('view');
    },
  });

  const deleteChart = api.nativity.deleteChart.useMutation({
    onSuccess: () => {
      chartsQuery.refetch();
      setViewMode('list');
      setSelectedChart(null);
    },
  });

  const handleSelectChart = (chart: SelectedChart) => {
    setSelectedChart(chart);
    setViewMode('view');
  };

  const handleCreateChart = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  const handleDeleteChart = async (chartId: string) => {
    if (confirm('Are you sure you want to delete this chart?')) {
      await deleteChart.mutateAsync({ id: chartId });
    }
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedChart(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--color-primary-dark)] overflow-hidden">
      {/* Cinematic Header: Saturnine Theme */}
      <div className="border-b border-[var(--color-ring-bronze)]/20 p-6 bg-black/40 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[var(--color-accent-orange)]/10 rounded-lg border border-[var(--color-accent-orange)]/20">
            <Star size={16} className="text-[var(--color-accent-orange)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-ring-bronze)]">
              {viewMode === 'list' ? 'Archive' : 'Navigation'}
            </span>
            <h2 className="text-sm font-black uppercase tracking-tighter text-[var(--color-primary-light)]">
              {viewMode === 'list' && 'Nativity Charts'}
              {viewMode === 'create' && 'New Origin Point'}
              {viewMode === 'view' && `${selectedChart?.name || 'Chart Explorer'}`}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {viewMode === 'list' ? (
            <button
              onClick={() => setViewMode('create')}
              className="flex items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-[var(--color-accent-glow)] text-[var(--color-primary-dark)] rounded-full hover:bg-[var(--color-primary-light)] transition-all shadow-[0_0_20px_rgba(164,196,217,0.2)] active:scale-95"
            >
              <Plus size={14} strokeWidth={3} />
              Add Chart
            </button>
          ) : (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-ring-bronze)] hover:text-[var(--color-primary-light)] transition-colors border border-[var(--color-ring-bronze)]/20 rounded-full"
            >
              <ChevronLeft size={14} strokeWidth={3} />
              Back
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Reintroducing Moon Background */}
      <div className="flex-1 relative overflow-hidden bg-[var(--color-primary-dark)] p-2 md:p-4">
        <motion.div 
          layout
          className="w-full h-full bg-[var(--color-primary-light)] rounded-[32px] overflow-hidden shadow-2xl relative"
        >
          {/* Subtle noise and light glow for texture */}
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/20 to-transparent" />

          <div className="relative z-10 h-full w-full overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="h-full"
              >
                {viewMode === 'list' && (
                  <div className="p-8">
                    <NativityChartList
                      charts={chartsQuery.data || []}
                      isLoading={chartsQuery.isLoading}
                      isError={chartsQuery.isError}
                      onSelectChart={handleSelectChart}
                      onDeleteChart={handleDeleteChart}
                    />
                  </div>
                )}

                {viewMode === 'create' && (
                  <div className="p-8 flex justify-center">
                    <div className="w-full max-w-2xl bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] p-10 rounded-[40px] shadow-2xl">
                       <NativityChartForm
                        isLoading={createMutation.isPending}
                        isError={createMutation.isError}
                        error={createMutation.error}
                        onSubmit={handleCreateChart}
                      />
                    </div>
                  </div>
                )}

                {viewMode === 'view' && selectedChart && (
                  <div className="h-full">
                    <NativityChartViewer
                      chartId={selectedChart.id}
                      onDelete={() => handleDeleteChart(selectedChart.id)}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-ring-bronze);
          border-radius: 10px;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
}