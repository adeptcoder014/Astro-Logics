'use client'

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import { 
  ArrowLeft, 
  Wrench, 
  Loader2, 
  ChevronRight, 
  Search, 
  Database, 
  Activity, 
  Code2,
  ExternalLink 
} from 'lucide-react';

interface ToolCatalogProps {
  onBack: () => void;
}

export default function ToolCatalog({ onBack }: ToolCatalogProps) {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const toolsQuery = api.agents.listTools.useQuery({ domain: selectedDomain });
  const toolDetailQuery = api.agents.getTool.useQuery(
    { id: selectedToolId! },
    { enabled: !!selectedToolId }
  );

  const tools = toolsQuery.data || [];
  const domains = Array.from(new Set(tools.map(t => t.domain)));
  
  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* --- Enterprise Header --- */}
      <header className="flex items-center justify-between mb-8 pb-6 border-b border-stone-800/50">
        <div className="flex items-center gap-5">
          <button
            onClick={onBack}
            className="group flex items-center justify-center w-10 h-10 rounded-full border border-stone-800 hover:border-stone-600 hover:bg-stone-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-stone-100" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-semibold tracking-tight text-stone-100">Registry</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">v2.4</span>
            </div>
            <p className="text-sm text-stone-500 font-medium">Global capability and tool discovery engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-stone-900/50 border border-stone-800 text-sm rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
        {/* --- Sidebar: Tool Navigation --- */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          {/* Filters */}
          <div className="flex gap-1.5 p-1 bg-stone-900/80 rounded-xl border border-stone-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedDomain(undefined)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                !selectedDomain ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              All Toolsets
            </button>
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDomain === domain ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>

          {/* List Container */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {toolsQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
                <p className="text-sm font-medium text-stone-500 italic">Indexing tools...</p>
              </div>
            ) : filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedToolId(tool.id)}
                className={`w-full group text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedToolId === tool.id
                    ? 'bg-amber-500/[0.03] border-amber-500/40 shadow-[0_0_15px_rgba(226,150,38,0.05)]'
                    : 'bg-stone-900/30 border-stone-800/60 hover:border-stone-700 hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="p-2 rounded-lg bg-stone-800 border border-stone-700 group-hover:border-stone-600 transition-colors">
                    <Wrench className={`w-4 h-4 ${selectedToolId === tool.id ? 'text-amber-500' : 'text-stone-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${selectedToolId === tool.id ? 'text-amber-500' : 'text-stone-100'}`}>
                      {tool.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-medium">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-stone-600" />
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-tight">{tool.domain}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-stone-600" />
                        <span className="text-[10px] font-medium text-stone-600 italic">{tool.latencyClass}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${selectedToolId === tool.id ? 'text-amber-500 translate-x-1' : 'text-stone-700'}`} />
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* --- Main Detail View --- */}
        <main className="col-span-12 lg:col-span-8 overflow-y-auto custom-scrollbar">
          {selectedToolId ? (
            <div className="bg-stone-900/20 border border-stone-800 rounded-2xl overflow-hidden min-h-full flex flex-col">
              {toolDetailQuery.isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                   <Loader2 className="w-10 h-10 animate-spin text-amber-500/20" />
                </div>
              ) : toolDetailQuery.data ? (
                <div className="p-8">
                  {/* Title & Metadata */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-800 text-stone-400 border border-stone-700">
                        {toolDetailQuery.data.domain} / Interface
                      </div>
                      <h2 className="text-3xl font-bold text-stone-100 tracking-tight leading-tight">
                        {toolDetailQuery.data.name}
                      </h2>
                      <p className="text-lg text-stone-400 max-w-2xl leading-relaxed">
                        {toolDetailQuery.data.description}
                      </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black text-sm font-bold rounded-lg transition-colors shadow-lg shadow-amber-900/10">
                      <ExternalLink className="w-4 h-4" />
                      Test Endpoint
                    </button>
                  </div>

                  {/* Latency Stats Card */}
                  <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                      <p className="text-[10px] font-bold text-stone-500 uppercase mb-1">Latency Class</p>
                      <p className="text-lg font-semibold text-stone-200">{toolDetailQuery.data.latencyClass}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                      <p className="text-[10px] font-bold text-stone-500 uppercase mb-1">Avg Execution</p>
                      <p className="text-lg font-semibold text-stone-200">~{toolDetailQuery.data.avgLatencyMs}ms</p>
                    </div>
                    <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                      <p className="text-[10px] font-bold text-stone-500 uppercase mb-1">Stability</p>
                      <p className="text-lg font-semibold text-emerald-500">99.9%</p>
                    </div>
                  </div>

                  {/* Schema Sections */}
                  <div className="space-y-8">
                    <SchemaBlock title="Input Parameters" data={toolDetailQuery.data.inputSchema} />
                    <SchemaBlock title="Output Response" data={toolDetailQuery.data.outputSchema} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-full border border-dashed border-stone-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-stone-900 rounded-2xl border border-stone-800 flex items-center justify-center mb-6">
                <Wrench className="w-8 h-8 text-stone-700" />
              </div>
              <h3 className="text-lg font-semibold text-stone-300">No Tool Selected</h3>
              <p className="text-sm text-stone-500 mt-2 max-w-[240px]">
                Select a tool from the catalog to view its technical specifications and schemas.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Sub-component for code/schema display
function SchemaBlock({ title, data }: { title: string; data: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Code2 className="w-4 h-4 text-amber-500/70" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">{title}</h3>
      </div>
      <div className="relative group">
        <div className="absolute top-4 right-4 text-[10px] font-mono text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity">
          JSON
        </div>
        <pre className="bg-[#0A0A0A] p-6 rounded-xl border border-stone-800/60 text-[13px] leading-relaxed text-amber-100/80 overflow-auto font-mono custom-scrollbar max-h-[400px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}