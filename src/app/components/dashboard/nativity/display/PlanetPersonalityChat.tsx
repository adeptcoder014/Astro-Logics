'use client'
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

  // Initial greeting from planet
  useEffect(() => {
    if (isActive && !initialized && messages.length === 0) {
      initializePlanetConversation();
    }
  }, [isActive, initialized]);

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

    // Add user message
    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Get planet response
    chatMutation.mutate(
      {
        chartContext: JSON.stringify(context),
        userMessage: input,
        conversationHistory: messages.map(m => ({
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
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-gradient-to-b from-[#1A1815] to-[#0F0D0C] rounded border border-[#2D241E]">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#2D241E] to-[#1A1815] p-4 border-b border-[#3D3530]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#E29626]">
              {context.planet}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              {context.zodiacSign} in {context.houseCusp}° House
              {context.isRetrograde && ' • ℞'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-500">
              {Math.abs(context.speed).toFixed(2)}°/day
            </div>
          </div>
        </div>
      </div>

      {/* Quick Context Tags */}
      {context.aspectsWithOthers.length > 0 && (
        <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-[#2D241E]">
          <p className="text-xs text-stone-500 mb-2">Aspects:</p>
          <div className="flex flex-wrap gap-2">
            {context.aspectsWithOthers.slice(0, 4).map((aspect) => (
              <span
                key={aspect.planet}
                className="text-xs bg-[#2D241E] text-[#E29626] px-2 py-1 rounded border border-[#3D3530]"
                title={`${aspect?.aspectType} (orb: ${aspect?.orb?.toFixed(2)}°)`}
              >
                {aspect.aspectType[0]} {aspect.planet}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container - Fixed scrollable height */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-stone-500">
                Begin your dialogue with {context.planet}...
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[#E29626] text-black'
                  : 'bg-[#2D241E] text-stone-200 border border-[#3D3530]'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
              <p className="text-xs opacity-60 mt-1">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#2D241E] text-stone-400 px-4 py-2 rounded-lg border border-[#3D3530]">
              <p className="text-sm">
                <span className="inline-block animate-pulse">Listening to the stars</span>
                <span className="inline-block animate-bounce ml-1">.</span>
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-[#2D241E] p-4 bg-[#0F0D0C]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Ask ${context.planet}...`}
            className="flex-1 bg-[#2D241E] border border-[#3D3530] rounded px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#E29626] transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-[#E29626] hover:bg-[#D17F1F] disabled:bg-stone-700 disabled:cursor-not-allowed text-black px-4 py-2 rounded font-semibold text-sm transition-colors"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-stone-600 mt-2">
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
