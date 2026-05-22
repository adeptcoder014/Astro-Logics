'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '~/trpc/react';
import type { PlanetContext } from './PlanetPersonalityBuilder';

interface Message {
  role: 'user' | 'planet';
  content: string;
  timestamp: Date;
}

interface PlanetPersonalityChatProps {
  planet: string;
  context: PlanetContext;
  isActive: boolean;
}

export default function PlanetPersonalityChat({
  planet,
  context,
  isActive,
}: PlanetPersonalityChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = api.nativity.chatWithPlanet.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset or initialize conversation when active planet context changes
  useEffect(() => {
    if (isActive) {
      setMessages([]);
      setInitialized(false);
      setInput('');
    }
  }, [planet]);

  // Initial greeting from planet
  useEffect(() => {
    if (isActive && !initialized && messages.length === 0) {
      initializePlanetConversation();
    }
  }, [isActive, initialized, planet]);

  const initializePlanetConversation = () => {
    setInitialized(true);
    setIsLoading(true);

    chatMutation.mutate(
      {
        chartContext: JSON.stringify(context),
        userMessage: 'greet',
      },
      {
        onSuccess: (response) => {
          setMessages([
            {
              role: 'planet',
              content: response.message,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      }
    );
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    chatMutation.mutate(
      {
        chartContext: JSON.stringify(context),
        userMessage: currentInput,
        conversationHistory: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
      {
        onSuccess: (response) => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'planet',
              content: response.message,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
          // Restore input text if request fails so user doesn't lose it
          setInput(currentInput); 
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-black/10 rounded-xl border border-(--color-primary-light)/10 overflow-hidden">
      {/* Header telemetry area */}
      <div className="flex-shrink-0 bg-gradient-to-r from-black/40 to-transparent p-4 border-b border-(--color-primary-light)/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-(--color-accent-orange)">
              {context.planet}
            </h3>
            <p className="text-xs text-(--color-primary-light) font-medium mt-1 opacity-90">
              {context.zodiacSign} <span className="text-(--color-ring-bronze)/80">in</span> {context.houseCusp}° House
              {context.isRetrograde && <span className="text-(--color-accent-orange) ml-1" title="Retrograde">℞</span>}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono tracking-wider px-2 py-0.5 bg-black/30 rounded border border-(--color-primary-light)/5 text-(--color-accent-glow)">
              {Math.abs(context.speed).toFixed(2)}°/d
            </div>
          </div>
        </div>
      </div>

      {/* Quick Context Aspects */}
      {context.aspectsWithOthers && context.aspectsWithOthers.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 bg-black/10 border-b border-(--color-primary-light)/10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-(--color-primary-light)/40 mr-1">Aspects:</span>
            {context.aspectsWithOthers.slice(0, 4).map((aspect, idx) => (
              <span
                key={`${aspect.planet}-${idx}`}
                className="text-[10px] font-semibold bg-black/30 text-(--color-primary-light)/90 px-2 py-0.5 rounded border border-(--color-primary-light)/10 hover:border-(--color-accent-glow)/30 transition-colors"
                title={`${aspect?.aspectType} (orb: ${aspect?.orb?.toFixed(2)}°)`}
              >
                {aspect.aspectType[0]} {aspect.planet}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-center p-4">
            <p className="text-xs text-(--color-primary-light)/40 max-w-[200px] leading-relaxed">
              Establishing celestial channel. Begin your dialogue with {context.planet}...
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-md text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-(--color-accent-orange) text-(--bg-main) rounded-tr-sm font-medium'
                    : 'bg-black/40 text-(--color-primary-light) rounded-tl-sm border border-(--color-primary-light)/10'
                }`}
              >
                <p>{msg.content}</p>
                <span className={`block text-[9px] mt-1 font-mono text-right opacity-50 ${isUser ? 'text-(--bg-main)' : 'text-(--color-accent-glow)'}`}>
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-black/20 text-(--color-accent-glow) px-4 py-2.5 rounded-2xl rounded-tl-sm border border-(--color-primary-light)/5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide">
                <span className="inline-block animate-pulse">Reading alignments</span>
                <span className="flex gap-0.5 ml-0.5">
                  <span className="animate-bounce delay-0 font-bold">.</span>
                  <span className="animate-bounce delay-150 font-bold">.</span>
                  <span className="animate-bounce delay-300 font-bold">.</span>
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Action Panel */}
      <div className="flex-shrink-0 border-t border-(--color-primary-light)/10 p-4 bg-black/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Address the energy of ${context.planet}...`}
            className="flex-1 bg-black/40 border border-(--color-primary-light)/10 rounded-xl px-4 py-2.5 text-xs text-(--color-primary-light) placeholder-(--color-primary-light)/30 focus:outline-none focus:border-(--color-accent-glow) focus:ring-1 focus:ring-(--color-accent-glow)/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-(--color-accent-orange) hover:brightness-110 disabled:bg-white/5 disabled:text-(--color-primary-light)/20 disabled:cursor-not-allowed text-(--bg-main) font-bold px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        <div className="flex justify-between text-[10px] text-(--color-primary-light)/30 mt-2 px-1 font-medium">
          <span>Shift + Enter for break</span>
          <span>✦ Connected</span>
        </div>
      </div>
    </div>
  );
}