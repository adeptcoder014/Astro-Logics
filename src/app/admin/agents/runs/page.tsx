'use client'

import React, { useState } from 'react';
import {
  LayoutGrid,
  Play,
  Wrench,
  Workflow,
} from 'lucide-react';
import TemplateBrowser from './components/TemplateBrowser';
import RunConfigurator from './components/RunConfigurator';
import RunViewer from './components/RunViewer';
import ToolCatalog from './components/ToolCatalog';

type View = 'templates' | 'builder' | 'runs' | 'run-detail' | 'tools';

export default function StudioPage() {
  const [view, setView] = useState<View>('builder');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const renderView = () => {
    switch (view) {
      case 'templates':
        return (
          <TemplateBrowser
            onSelectTemplate={(template) => {
              setSelectedTemplate(template);
              setView('builder');
            }}
            onViewRuns={() => setView('runs')}
          />
        );
      
      case 'builder':
        return (
          <RunConfigurator
            template={selectedTemplate}
            onBack={() => setView('templates')}
            onRunCreated={(runId) => {
              setSelectedRunId(runId);
              setView('run-detail');
            }}
          />
        );
      
      case 'runs':
      case 'run-detail':
        return (
          <RunViewer
            onSelectRun={(runId) => {
              setSelectedRunId(runId);
              setView('run-detail');
            }}
            onBack={() => setView('templates')}
            selectedRunId={selectedRunId}
          />
        );
      
      case 'tools':
        return <ToolCatalog onBack={() => setView('templates')} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-rose-50 text-gray-700">
      {/* Top Navigation */}
      <div className="border-b border-rose-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-rose-400 rounded-lg">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-700">Domain Intelligence Studio</h1>
                <p className="text-xs text-gray-600">Graph execution and configuration</p>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('templates')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'templates'
                    ? 'bg-[#2D241E] text-stone-100'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-[#1F1916]'
                }`}
              >
                <LayoutGrid className="w-4 h-4 inline mr-2" />
                Templates
              </button>
              <button
                onClick={() => setView('builder')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'builder'
                    ? 'bg-[#2D241E] text-stone-100'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-[#1F1916]'
                }`}
              >
                <Workflow className="w-4 h-4 inline mr-2" />
                Builder
              </button>
              <button
                onClick={() => setView('runs')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'runs' || view === 'run-detail'
                    ? 'bg-[#2D241E] text-stone-100'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-[#1F1916]'
                }`}
              >
                <Play className="w-4 h-4 inline mr-2" />
                Runs
              </button>
              <button
                onClick={() => setView('tools')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'tools'
                    ? 'bg-[#2D241E] text-stone-100'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-[#1F1916]'
                }`}
              >
                <Wrench className="w-4 h-4 inline mr-2" />
                Tools
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-6">
        {renderView()}
      </div>
    </div>
  );
}
