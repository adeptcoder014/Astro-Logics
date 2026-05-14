'use client'

import React, { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import { 
  Play, 
  GitBranch, 
  Loader2, 
  Package, 
  ArrowRight, 
  Layers, 
  Globe, 
  Clock,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Save,
  X
} from 'lucide-react';

interface TemplateBrowserProps {
  onSelectTemplate: (template: any) => void;
  onViewRuns: () => void;
}

export default function TemplateBrowser({ onSelectTemplate, onViewRuns }: TemplateBrowserProps) {
  const templatesQuery = api.agents.listGraphTemplates.useQuery();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorText, setEditorText] = useState('');
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorError(null);
    setEditingTemplate(null);
  };

  const createMutation = api.agents.createGraphTemplate.useMutation({
    onSuccess: () => {
      templatesQuery.refetch();
      closeEditor();
    },
  });

  const updateMutation = api.agents.updateGraphTemplate.useMutation({
    onSuccess: () => {
      templatesQuery.refetch();
      closeEditor();
    },
  });

  const deleteMutation = api.agents.deleteGraphTemplate.useMutation({
    onSuccess: () => templatesQuery.refetch(),
  });

  const topologyQuery = api.agents.getGraphTopology.useQuery(
    editingTemplate
      ? { templateId: editingTemplate.id, version: editingTemplate.version }
      : { templateId: '', version: '' },
    { enabled: !!editingTemplate },
  );

  useEffect(() => {
    if (topologyQuery.data && editorMode === 'edit') {
      setEditorText(JSON.stringify(topologyQuery.data, null, 2));
    }
  }, [topologyQuery.data, editorMode]);

  const buildBlankTemplate = () => ({
    id: `graph-${Date.now()}`,
    version: '0.1.0',
    name: 'New Graph Template',
    domain: 'custom',
    description: 'Describe this template',
    entryPoint: 'start',
    nodes: [
      {
        id: 'start',
        type: 'custom',
        label: 'Start',
        description: 'Entry node',
      },
    ],
    edges: [],
  });

  const openCreateEditor = () => {
    setEditorMode('create');
    setEditorError(null);
    setEditingTemplate(null);
    setEditorText(JSON.stringify(buildBlankTemplate(), null, 2));
    setEditorOpen(true);
  };

  const openEditEditor = (template: any) => {
    setEditorMode('edit');
    setEditorError(null);
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handleSave = () => {
    setEditorError(null);
    let payload: any;
    try {
      payload = JSON.parse(editorText);
    } catch {
      setEditorError('Invalid JSON. Please fix syntax errors before saving.');
      return;
    }

    if (!payload || typeof payload !== 'object') {
      setEditorError('Template must be a JSON object.');
      return;
    }

    if (!payload.id && payload.templateId) {
      payload.id = payload.templateId;
      delete payload.templateId;
    }

    if (!payload.id || !payload.version || !payload.name || !payload.domain || !payload.description || !payload.entryPoint) {
      setEditorError('Template is missing required fields (id, version, name, domain, description, entryPoint).');
      return;
    }

    if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) {
      setEditorError('Template must include nodes[] and edges[] arrays.');
      return;
    }

    if (editorMode === 'create') {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
  };

  const handleDelete = (template: any) => {
    if (!confirm(`Delete graph template ${template.id} v${template.version}?`)) {
      return;
    }
    deleteMutation.mutate({ templateId: template.id, version: template.version });
  };

  if (templatesQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
          <div className="absolute inset-0 blur-xl bg-amber-500/20 animate-pulse" />
        </div>
        <p className="text-stone-500 font-medium animate-pulse">Fetching latest blueprints...</p>
      </div>
    );
  }

  const templates = templatesQuery.data || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- Page Header --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-800/60 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Architecture Registry</span>
          </div>
          <h2 className="text-4xl font-bold text-stone-100 tracking-tight">Graph Templates</h2>
          <p className="text-stone-400 max-w-xl leading-relaxed">
            Standardized execution blueprints for autonomous agents. Deploy pre-configured 
            logic flows across your infrastructure.
          </p>
        </div>
        
        <button
          onClick={onViewRuns}
          className="group flex items-center gap-3 px-6 py-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-200 text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]"
        >
          Execution History
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={openCreateEditor}
          className="group flex items-center gap-3 px-6 py-3 bg-amber-500 hover:bg-amber-400 border border-amber-400 rounded-xl text-stone-950 text-sm font-semibold transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </header>

      {/* --- Template Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={`${template.id}-${template.version}`}
            onClick={() => onSelectTemplate(template)}
            className="group relative flex flex-col bg-stone-900/30 border border-stone-800 rounded-2xl p-6 transition-all duration-300 hover:border-amber-500/40 hover:bg-stone-900/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] cursor-pointer overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full group-hover:bg-amber-500/10 transition-colors" />

            {/* Top Bar */}
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 bg-stone-800 border border-stone-700 rounded-xl group-hover:scale-110 group-hover:border-amber-500/50 transition-all duration-500">
                <Package className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-800 text-stone-400 rounded-full border border-stone-700">
                  v{template.version}
                </span>
                <span className="text-[9px] font-bold text-stone-600 uppercase tracking-widest">
                  STABLE RELEASE
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditEditor(template);
                    }}
                    className="p-2 rounded-lg border border-stone-800 text-stone-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                    title="Edit template"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(template);
                    }}
                    className="p-2 rounded-lg border border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-stone-100 mb-2 group-hover:text-amber-500 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed mb-6 line-clamp-2">
                {template.description}
              </p>
            </div>

            {/* Meta Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-stone-950/50 rounded-lg border border-stone-800/50">
                <GitBranch className="w-3.5 h-3.5 text-stone-600" />
                <span className="text-xs font-medium text-stone-400">{template.nodeCount} Steps</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-stone-950/50 rounded-lg border border-stone-800/50">
                <Globe className="w-3.5 h-3.5 text-stone-600" />
                <span className="text-xs font-medium text-stone-400 truncate capitalize">{template.domain}</span>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectTemplate(template);
              }}
              className="relative w-full overflow-hidden px-4 py-3 bg-amber-500 text-stone-950 font-bold rounded-xl transition-all active:scale-[0.98] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Configure Pipeline
              </div>
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </div>
        ))}
      </div>

      {/* --- Empty State --- */}
      {templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-stone-800 rounded-3xl bg-stone-900/10">
          <div className="w-20 h-20 bg-stone-900 rounded-2xl flex items-center justify-center mb-6">
            <Layers className="w-10 h-10 text-stone-700" />
          </div>
          <h3 className="text-xl font-bold text-stone-300">No Templates Found</h3>
          <p className="text-stone-500 mt-2 max-w-sm text-center">
            Your organization hasn't published any graph blueprints yet. Check back later or sync with the master registry.
          </p>
        </div>
      )}

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-4xl bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest">
                  {editorMode === 'create' ? 'Create Template' : 'Edit Template'}
                </p>
                <h3 className="text-lg font-bold text-stone-100">Graph Template JSON</h3>
              </div>
              <button
                onClick={closeEditor}
                className="p-2 rounded-lg border border-stone-800 text-stone-400 hover:text-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {editorMode === 'edit' && topologyQuery.isLoading && (
                <div className="flex items-center gap-2 text-stone-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading template topology...
                </div>
              )}

              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                className="w-full h-[420px] bg-black border border-stone-800 rounded-xl text-xs text-stone-200 font-mono p-4 focus:outline-none focus:border-amber-500/50"
              />

              {editorError && (
                <div className="text-xs text-rose-400">{editorError}</div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800">
              <div className="text-[10px] text-stone-500 uppercase tracking-widest">
                Ensure JSON is valid before saving.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeEditor}
                  className="px-4 py-2 text-sm text-stone-400 border border-stone-800 rounded-lg hover:text-stone-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm font-bold text-stone-950 bg-amber-500 rounded-lg disabled:bg-stone-800 disabled:text-stone-600"
                >
                  <span className="inline-flex items-center gap-2">
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Template
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}