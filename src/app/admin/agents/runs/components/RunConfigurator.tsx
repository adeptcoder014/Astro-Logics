'use client'

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Loader2,
  Send,
  Edit2,
  Check,
  X,
  Brain,
  Target,
  Zap,
  Heart,
} from 'lucide-react';
import { api } from '~/trpc/react';

interface RunConfiguratorProps {
  onBack: () => void;
  onRunCreated: (runId: string) => void;
}

const DEFAULT_USER_ID = '698ec5c422019a6189d2a864';

export default function RunConfigurator({ onBack, onRunCreated }: RunConfiguratorProps) {
  const [message, setMessage] = useState<string>('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTraits, setEditTraits] = useState('');
  const [editGoals, setEditGoals] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; text: string; timestamp: number }>>([
    {
      role: 'agent',
      text: 'I am your Vedic astrology companion. I can analyze your natal chart, provide personalized insights about planetary positions, aspects, and help you understand your astrological profile.',
      timestamp: Date.now(),
    }
  ]);
  const [isWittyChatOpen, setIsWittyChatOpen] = useState(false);
  const [wittyMessages, setWittyMessages] = useState<Array<{ role: 'user' | 'agent'; text: string; timestamp: number }>>([
    {
      role: 'agent',
      text: 'Hey there! I\'m your cosmic companion. Ready for some stellar conversation? 🌟',
      timestamp: Date.now(),
    }
  ]);
  const [wittyMessage, setWittyMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Queries
  const profileQuery = api.agents.getAgentProfile.useQuery(
    { userId: DEFAULT_USER_ID },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  // Mutations
  const runAgentMutation = api.agents.runAgent.useMutation({
    onSuccess: (result) => {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: result.answer || 'Process completed.',
        timestamp: Date.now(),
      }]);
      onRunCreated(result.runId);
      // Refetch profile after agent interaction to update memories
      profileQuery.refetch();
    },
    onError: (error) => {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: `Error: ${error.message || 'Failed to process request'}`,
        timestamp: Date.now(),
      }]);
    },
  });

  const updateProfileMutation = api.agents.updateAgentProfile.useMutation({
    onSuccess: () => {
      profileQuery.refetch();
      setIsEditingProfile(false);
    },
  });

  const wittyChatMutation = api.agents.wittyChat.useMutation({
    onSuccess: (result) => {
      setWittyMessages(prev => [...prev, {
        role: 'agent',
        text: result.answer || 'That was fun! What else is on your mind?',
        timestamp: Date.now(),
      }]);
    },
    onError: (error) => {
      setWittyMessages(prev => [...prev, {
        role: 'agent',
        text: `Oops! ${error.message || 'Something went wrong'}`,
        timestamp: Date.now(),
      }]);
    },
  });

  const agentProfile = profileQuery.data?.profile;
  const agentMemories = profileQuery.data?.memories || [];
  console.log('Agent Profile:', profileQuery.data);
  // console.log('Agent Memories:', agentMemories);  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (agentProfile) {
      setEditName(agentProfile.name);
      setEditTraits((agentProfile.traits || []).join(', '));
      setEditGoals((agentProfile.goals || []).join(', '));
    }
  }, [agentProfile]);

  const onSend = () => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, {
      role: 'user',
      text: message,
      timestamp: Date.now(),
    }]);

    runAgentMutation.mutate({
      message,
      context: {
        userId: DEFAULT_USER_ID,
      },
    });

    setMessage('');
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      userId: DEFAULT_USER_ID,
      name: editName,
      traits: editTraits.split(',').map(t => t.trim()).filter(Boolean),
      goals: editGoals.split(',').map(g => g.trim()).filter(Boolean),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleWittySend = () => {
    if (!wittyMessage.trim()) return;

    setWittyMessages(prev => [...prev, {
      role: 'user',
      text: wittyMessage,
      timestamp: Date.now(),
    }]);

    wittyChatMutation.mutate({
      message: wittyMessage,
      context: {
        userId: DEFAULT_USER_ID,
      },
    });

    setWittyMessage('');
  };

  const handleWittyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleWittySend();
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar - Agent Persona & Memory */}
      <aside className="w-80 border-r border-rose-200 bg-gradient-to-b from-purple-50 to-rose-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-rose-200 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-rose-200 text-gray-600 hover:text-gray-700 hover:bg-rose-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-stone-100">Agent Persona</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsWittyChatOpen(!isWittyChatOpen)}
              className={`p-2 rounded-lg border transition ${
                isWittyChatOpen
                  ? 'border-amber-500/50 text-amber-500 bg-amber-500/10'
                  : 'border-[#2D241E] text-stone-400 hover:text-stone-100 hover:bg-[#2D241E]'
              }`}
              title="Toggle Witty Chat"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="p-2 rounded-lg border border-[#2D241E] text-amber-500 hover:bg-[#2D241E] transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Agent Profile */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Identity Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Agent name..."
                    className="w-full bg-[#1A1614] border border-[#2D241E] rounded-lg px-2 py-1 text-sm text-stone-200 focus:border-amber-500/50 outline-none"
                  />
                ) : (
                  <h3 className="font-bold text-stone-100">
                    {profileQuery.isLoading ? 'Loading...' : (agentProfile?.name || 'Agent')}
                  </h3>
                )}
              </div>
            </div>
          </div>

          {/* Traits Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-3 h-3" /> Core Traits
            </label>
            {isEditingProfile ? (
              <textarea
                value={editTraits}
                onChange={(e) => setEditTraits(e.target.value)}
                placeholder="e.g., analytical, empathetic, curious (comma-separated)"
                className="w-full bg-[#1A1614] border border-[#2D241E] rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-600 resize-none focus:border-amber-500/50 outline-none"
                rows={3}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileQuery.isLoading ? (
                  <p className="text-xs text-stone-500 italic">Loading traits...</p>
                ) : (agentProfile?.traits || []).length > 0 ? (
                  (agentProfile.traits || []).map((trait, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400">
                      {trait}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 italic">No traits defined</p>
                )}
              </div>
            )}
          </div>

          {/* Goals Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3 h-3" /> Strategic Goals
            </label>
            {isEditingProfile ? (
              <textarea
                value={editGoals}
                onChange={(e) => setEditGoals(e.target.value)}
                placeholder="e.g., provide accurate readings, help users understand themselves (comma-separated)"
                className="w-full bg-[#1A1614] border border-[#2D241E] rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-600 resize-none focus:border-amber-500/50 outline-none"
                rows={3}
              />
            ) : (
              <div className="space-y-1">
                {profileQuery.isLoading ? (
                  <p className="text-xs text-stone-500 italic">Loading goals...</p>
                ) : (agentProfile?.goals || []).length > 0 ? (
                  (agentProfile.goals || []).map((goal, i) => (
                    <div key={i} className="text-xs text-stone-300 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">→</span>
                      <span>{goal}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 italic">No goals defined</p>
                )}
              </div>
            )}
          </div>

          {/* Edit Actions */}
          {isEditingProfile && (
            <div className="flex gap-2 pt-2 border-t border-[#2D241E]">
              <button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 transition flex items-center justify-center gap-2 text-xs font-medium disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-stone-700/20 border border-stone-600/50 text-stone-400 hover:bg-stone-700/30 transition flex items-center justify-center gap-2 text-xs font-medium"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          )}

          {/* Recent Memories */}
          <div className="space-y-2 border-t border-[#2D241E] pt-4">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
              <Brain className="w-3 h-3" /> Recent Memories
            </label>
            <div className="space-y-2">
              {profileQuery.isLoading ? (
                <p className="text-xs text-stone-500 italic">Loading memories...</p>
              ) : agentMemories.length > 0 ? (
                agentMemories.slice(0, 5).map((memory, i) => (
                  <div key={i} className="p-2 rounded-lg bg-stone-900/50 border border-stone-800 hover:border-amber-500/30 transition">
                    <p className="text-[10px] text-stone-400 line-clamp-2">{memory.content}</p>
                    <p className="text-[9px] text-stone-600 mt-1">
                      {memory.metadata?.intent ? `📌 ${memory.metadata.intent}` : '📝 Recorded'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 italic">No memories yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="border-t border-[#2D241E] px-6 py-3 bg-stone-950/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-stone-500">Agent Active</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-rose-50">
        {/* Header */}
        <div className="border-b border-rose-200 px-6 py-4 bg-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" /> Command Center
            </h2>
            <p className="text-xs text-gray-600">Interact with your Vedic astrology intelligence</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Status</p>
            <p className="text-sm font-semibold text-green-600">Ready</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              {msg.role === 'agent' && (
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-amber-500" />
                </div>
              )}

              <div
                className={`max-w-xl px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-50'
                    : 'bg-stone-800/50 border border-stone-700 text-stone-200'
                  }`}
              >
                {msg.text}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-stone-700/50 border border-stone-600 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-stone-400 rounded-full" />
                </div>
              )}
            </div>
          ))}

          {runAgentMutation.isPending && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
              </div>
              <div className="bg-stone-800/50 border border-stone-700 text-stone-300 px-4 py-3 rounded-xl">
                <span className="text-sm">Analyzing your request...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2D241E] bg-[#1A1614] p-6 shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 min-w-0">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your astrological profile, chart analysis, planetary insights, birth remedies..."
                rows={3}
                className="w-full bg-[#0F0D0C] border border-[#2D241E] rounded-xl px-4 py-3 text-sm text-stone-200 placeholder-stone-600 resize-none focus:border-amber-500/50 focus:outline-none transition"
              />
            </div>
            <button
              onClick={onSend}
              disabled={!message.trim() || runAgentMutation.isPending}
              className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${!message.trim() || runAgentMutation.isPending
                  ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-[#0F0D0C] shadow-lg hover:shadow-amber-500/50'
                }`}
            >
              {runAgentMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-stone-600 mt-2">Press Enter or click Send • Shift+Enter for new line</p>
        </div>
      </main>

      {/* Witty Chat Panel */}
      {isWittyChatOpen && (
        <aside className="w-80 border-l border-rose-200 bg-gradient-to-b from-rose-50 to-purple-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#2D241E] px-4 py-3 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-500" /> Witty Chat
            </h2>
            <button
              onClick={() => setIsWittyChatOpen(false)}
              className="p-2 rounded-lg border border-[#2D241E] text-stone-400 hover:text-stone-100 hover:bg-[#2D241E] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {wittyMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'agent' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-3 h-3 text-amber-500" />
                  </div>
                )}

                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-50'
                      : 'bg-stone-800/50 border border-stone-700 text-stone-200'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-stone-700/50 border border-stone-600 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                  </div>
                )}
              </div>
            ))}

            {wittyChatMutation.isPending && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                </div>
                <div className="bg-stone-800/50 border border-stone-700 text-stone-300 px-3 py-2 rounded-lg">
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-[#2D241E] bg-[#1A1614] p-4 shrink-0">
            <div className="flex gap-2 items-end">
              <div className="flex-1 min-w-0">
                <textarea
                  value={wittyMessage}
                  onChange={(e) => setWittyMessage(e.target.value)}
                  onKeyDown={handleWittyKeyDown}
                  placeholder="Chat with your cosmic companion..."
                  rows={2}
                  className="w-full bg-[#0F0D0C] border border-[#2D241E] rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-600 resize-none focus:border-amber-500/50 focus:outline-none transition"
                />
              </div>
              <button
                onClick={handleWittySend}
                disabled={!wittyMessage.trim() || wittyChatMutation.isPending}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition flex-shrink-0 ${
                  !wittyMessage.trim() || wittyChatMutation.isPending
                    ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-[#0F0D0C]'
                }`}
              >
                {wittyChatMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}