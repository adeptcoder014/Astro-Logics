'use client'

import React, { useState, useRef, useEffect } from 'react';
import { api } from '~/trpc/react';
import {
  Send,
  Loader2,
  Bot,
  User,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  plan?: {
    goal: string;
    steps: Array<{
      id: string;
      description: string;
      tool?: string;
      completed: boolean;
      inputs?: Record<string, unknown>;
    }>;
  };
  executionResults?: Array<{
    stepId: string;
    tool?: string | null;
    output: any;
  }>;
}

interface NativityAgentTabProps {
  nativityChartId: string;
}

export default function NativityAgentTab({ nativityChartId }: NativityAgentTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: "👋 Hello! I'm your personal astrology AI agent. I can help you understand your natal chart, interpret planetary positions, explore your TITANS personality system, and answer questions about your astrological profile. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>(`session-${nativityChartId}-${Date.now()}`);
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [showExecutionPlane, setShowExecutionPlane] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Execute agent mutation
  const executeAgent = api.agents.runAgent.useMutation({
    onSuccess: (data) => {
      // Track the run ID for execution plane
      if (data.runId) {
        setLastRunId(data.runId);
        setShowExecutionPlane(true);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'Task completed.',
        timestamp: new Date(),
        plan: data.plan as any,
        executionResults: data.executionResults as any,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => {
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `❌ Error: ${error.message}. Make sure the agent-runtime server is running on port 3001.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });
console.log('executeAgent___',executeAgent)
// Fetch trace for execution plane
const runTraceQuery = api.agents.getRunTrace.useQuery(
  { runId: lastRunId! },
  { enabled: !!lastRunId }
);

console.log('runTraceQuery',runTraceQuery)
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || executeAgent.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Execute agent
    await executeAgent.mutateAsync({
      message: input,
      nativityChartId,
      sessionId,
      context: {
        chartId: nativityChartId,
      },
    });
  };

  const handleClearSession = () => {
    const newSessionId = `session-${nativityChartId}-${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([
      {
        id: 'welcome-new',
        role: 'system',
        content: "🔄 Session cleared. Starting fresh! How can I help you?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };


  const quickPrompts = [
    "where are my planets?",
    "show me my planetary positions",
    "what's in my natal chart?",
    "analyze my planet placements",
  ];

  return (
    <div className="h-full flex flex-col bg-[#14110F]">
      {/* Header */}
      <div className="border-b border-[#2D241E] bg-[#1A1614] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#E29626] to-[#C17817] rounded-lg">
            <Bot className="w-5 h-5 text-[#0F0D0C]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-100">AI Agent Assistant</h2>
            <p className="text-xs text-stone-500">Powered by LangChain & TITANS</p>
          </div>
        </div>
        <button
          onClick={handleClearSession}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-400 hover:text-[#E29626] hover:bg-[#2D241E] rounded transition-all"
          title="Clear conversation"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                  ? 'bg-[#E29626]'
                  : message.role === 'system'
                    ? 'bg-[#2D241E]'
                    : 'bg-gradient-to-br from-purple-600 to-blue-600'
                }`}
            >
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-[#0F0D0C]" />
              ) : message.role === 'system' ? (
                <Sparkles className="w-4 h-4 text-stone-400" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''
                }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${message.role === 'user'
                    ? 'bg-[#E29626] text-[#0F0D0C]'
                    : message.role === 'system'
                      ? 'bg-[#2D241E] text-stone-400'
                      : 'bg-[#1A1614] text-stone-200 border border-[#2D241E]'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Execution Plan */}
                {message.plan && (
                  <div className="mt-3 pt-3 border-t border-[#2D241E]">
                    <p className="text-xs font-bold text-stone-400 mb-2">
                      <Zap className="w-3 h-3 inline mr-1" />
                      Execution Plan: {message.plan.goal}
                    </p>
                    <div className="space-y-1">
                      {message.plan.steps.map((step) => (
                        <div
                          key={step.id}
                          className="flex items-start gap-2 text-xs text-stone-500"
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-stone-600 flex-shrink-0 mt-0.5" />
                          )}
                          <span>{step.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Results */}
                {message.executionResults && message.executionResults.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2D241E]">
                    <p className="text-xs font-bold text-stone-400 mb-2">Results:</p>
                    <div className="space-y-2">
                      {message.executionResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs"
                        >
                          {result.success ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-stone-500">
                            {result.success
                              ? typeof result.result === 'string'
                                ? result.result
                                : 'Success'
                              : result.error || 'Failed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-stone-600 mt-1 px-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {executeAgent.isPending && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 rounded-lg bg-[#1A1614] border border-[#2D241E]">
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-stone-500 mb-2">Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-1.5 text-xs font-medium text-stone-400 bg-[#1A1614] hover:bg-[#2D241E] hover:text-[#E29626] border border-[#2D241E] rounded-full transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Execution Plane */}
      {showExecutionPlane && lastRunId && (
        <div className="border-t border-[#2D241E] bg-[#1A1614] p-4 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-stone-300 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Execution Plane
            </h4>
            <button
              onClick={() => setShowExecutionPlane(false)}
              className="text-xs text-stone-600 hover:text-stone-400"
            >
              ✕
            </button>
          </div>

          {runTraceQuery.isLoading ? (
            <p className="text-xs text-stone-500">Loading trace events...</p>
          ) : runTraceQuery.data && (runTraceQuery.data as any[]).length > 0 ? (
            <div className="space-y-2">
              {(runTraceQuery.data as any[]).map((event, idx) => (
                <div key={idx} className="p-2 bg-[#0F0D0C] rounded border border-[#2D241E] text-[10px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-stone-400 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-[#E29626] font-semibold">{event.type}</span>
                  </div>
                  {event.nodeId && (
                    <div className="text-stone-600 mb-1">Node: {event.nodeId}</div>
                  )}
                  {event.payload && Object.keys(event.payload).length > 0 && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-stone-500 hover:text-stone-400">
                        Details
                      </summary>
                      <pre className="mt-1 p-1 bg-[#14110F] rounded text-[9px] text-stone-400 overflow-x-auto max-h-32">
                        {JSON.stringify(event.payload, null, 1)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-600">No trace events yet</p>
          )}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#2D241E] bg-[#1A1614] p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your chart..."
            disabled={executeAgent.isPending}
            className="flex-1 px-4 py-2.5 bg-[#14110F] border border-[#2D241E] rounded-lg text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#E29626] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || executeAgent.isPending}
            className="px-4 py-2.5 bg-gradient-to-r from-[#E29626] to-[#C17817] text-[#0F0D0C] font-semibold rounded-lg hover:from-[#C17817] hover:to-[#E29626] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {executeAgent.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-xs text-stone-600 mt-2 text-center">
          Powered by agent-runtime • Make sure server is running on port 3001
        </p>
      </div>
    </div>
  );
}
