'use client'
import React, { useRef, useEffect, Suspense } from 'react';
import { Loader } from 'lucide-react';
import { api } from '~/trpc/react';
import {
  Send,
  Zap,
  Heart,
  Brain,
  Volume2,
} from 'lucide-react';

// Lazy load the 3D component to avoid Three.js SSR issues
const GameScene3D = React.lazy(() => import('./NativityGameOfLifeTab3D'));

interface PlanetEntity {
  id: string;
  planet: string;
  position: [number, number, number];
  energy: number;
  mood: string;
  color: string;
  personality: string;
  lastMessage: string;
  isActive: boolean;
}

interface GameOfLifeTabProps {
  nativityChartId: string;
}

function getMoodFromStrength(strength: number): string {
  if (strength > 0.85) return '🌟 Radiant';
  if (strength > 0.7) return '✨ Vibrant';
  if (strength > 0.55) return '💫 Active';
  if (strength > 0.4) return '🌙 Gentle';
  return '🌑 Emerging';
}

function getPlanetColor(planet: string): string {
  const colorMap: Record<string, string> = {
    SUN: '#FFD700',
    MOON: '#E0E0E0',
    MERCURY: '#87CEEB',
    VENUS: '#FFC0CB',
    MARS: '#DC143C',
    JUPITER: '#FFA500',
    SATURN: '#DAA520',
    URANUS: '#4FD0E7',
    NEPTUNE: '#4169E1',
    PLUTO: '#8B4513',
    MEAN_NODE: '#9370DB',
  };
  return colorMap[planet] || '#888888';
}

export default function NativityGameOfLifeTab({
  nativityChartId,
}: GameOfLifeTabProps) {
  const [selectedPlanet, setSelectedPlanet] = React.useState<PlanetEntity | null>(null);
  const [planets, setPlanets] = React.useState<PlanetEntity[]>([]);
  const [conversation, setConversation] = React.useState<
    Array<{ role: 'user' | 'planet'; text: string; planet?: string }>
  >([]);
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Fetch planets with personality
  const { data: planetsData } = api.nativity.getNativityPlanets.useQuery(
    { nativityChartId },
    { enabled: !!nativityChartId }
  );

  // Initialize planets
  useEffect(() => {
    if (planetsData?.planets) {
      const initialized = planetsData.planets.map((p: any, idx: number) => {
        const angle = (idx / (planetsData.planets.length || 10)) * Math.PI * 2;
        const distance = 4 + idx * 2;
        const color = getPlanetColor(p.planet);
        return {
          id: p.planet,
          planet: p.planet,
          position: [
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 3,
            Math.sin(angle) * distance,
          ] as [number, number, number],
          energy: Math.round(p.strength * 100),
          mood: getMoodFromStrength(p.strength),
          color,
          personality: p.archetype || 'Energy',
          lastMessage: `I am ${p.archetype || 'an energy'}`,
          isActive: true,
        };
      });
      setPlanets(initialized);
      if (initialized.length > 0) {
        setSelectedPlanet(initialized[0]);
      }
    }
  }, [planetsData]);

  // Auto-scroll to latest message
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const interactionMutation = api.nativity.interactWithPlanetEntity.useMutation({
    onSuccess: (data) => {
      setConversation((prev) => [
        ...prev,
        {
          role: 'planet',
          text: data.response,
          planet: selectedPlanet?.planet,
        },
      ]);
      setIsLoading(false);

      // Update planet energy/mood
      if (selectedPlanet) {
        setPlanets((prev) =>
          prev.map((p) =>
            p.id === selectedPlanet.id
              ? {
                  ...p,
                  energy: Math.min(100, Math.max(0, p.energy + data.energyShift)),
                  mood: data.mood,
                }
              : p
          )
        );
      }
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedPlanet || isLoading) return;

    setConversation((prev) => [
      ...prev,
      { role: 'user', text: inputText },
    ]);

    setInputText('');
    setIsLoading(true);

    try {
      await interactionMutation.mutateAsync({
        nativityChartId,
        planet: selectedPlanet.planet,
        userMessage: inputText,
        currentEnergy: selectedPlanet.energy,
        actionType: 'message',
      });
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleNarrate = () => {
    if (!selectedPlanet || !conversation.length) return;

    const lastMessage = conversation[conversation.length - 1].text;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(lastMessage);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleEnergyBoost = async () => {
    if (!selectedPlanet) return;

    setConversation((prev) => [
      ...prev,
      { role: 'user', text: '✨ *sends energy boost*' },
    ]);

    setIsLoading(true);

    try {
      await interactionMutation.mutateAsync({
        nativityChartId,
        planet: selectedPlanet.planet,
        userMessage: 'I send you positive energy and support',
        currentEnergy: selectedPlanet.energy,
        actionType: 'boost',
      });
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleHeal = async () => {
    if (!selectedPlanet) return;

    setConversation((prev) => [
      ...prev,
      { role: 'user', text: '💚 *initiates healing*' },
    ]);

    setIsLoading(true);

    try {
      await interactionMutation.mutateAsync({
        nativityChartId,
        planet: selectedPlanet.planet,
        userMessage: 'I acknowledge your struggles and support your healing',
        currentEnergy: selectedPlanet.energy,
        actionType: 'heal',
      });
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleChallenge = async () => {
    if (!selectedPlanet) return;

    setConversation((prev) => [
      ...prev,
      { role: 'user', text: '⚡ *challenges your limits*' },
    ]);

    setIsLoading(true);

    try {
      await interactionMutation.mutateAsync({
        nativityChartId,
        planet: selectedPlanet.planet,
        userMessage: 'Show me your full potential and what you can transform',
        currentEnergy: selectedPlanet.energy,
        actionType: 'challenge',
      });
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#0F0D0C]">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#E29626] mb-2">
          🎮 Game of Life: Inner Planets
        </h3>
        <p className="text-xs text-stone-400">
          Interact with your planetary forces as living entities. Engage, nurture, or challenge them.
        </p>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex gap-4 min-h-0 mb-4">
        {/* 3D Canvas - Lazily loaded */}
        <Suspense
          fallback={
            <div className="flex-1 border border-[#2D241E] rounded bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
              <Loader size={32} className="animate-spin text-[#E29626]" />
            </div>
          }
        >
          <GameScene3D planets={planets} selectedPlanet={selectedPlanet} onSelectPlanet={setSelectedPlanet} />
        </Suspense>

        {/* Interaction Panel */}
        <div className="w-96 flex flex-col gap-3 bg-[#1A1714] border border-[#2D241E] rounded p-4 overflow-hidden">
          {/* Selected Planet Info */}
          {selectedPlanet && (
            <>
              <div className="mb-3 pb-3 border-b border-[#2D241E]">
                <h4 className="text-sm font-bold text-[#E29626] mb-2">
                  {selectedPlanet.planet} - {selectedPlanet.personality}
                </h4>

                {/* Energy Bar */}
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-yellow-400" />
                  <div className="flex-1 h-2 bg-[#2D241E] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#E29626] transition-all"
                      style={{ width: `${selectedPlanet.energy}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-400">
                    {selectedPlanet.energy}%
                  </span>
                </div>

                {/* Mood */}
                <p className="text-xs text-stone-300">
                  <span className="font-semibold">Mood:</span> {selectedPlanet.mood}
                </p>
              </div>

              {/* Conversation */}
              <div className="flex-1 overflow-y-auto mb-3 space-y-2 flex flex-col">
                {conversation.length === 0 && (
                  <div className="text-xs text-stone-500 text-center mt-4">
                    Start a conversation with {selectedPlanet.planet}...
                  </div>
                )}

                {conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`text-xs p-2 rounded ${
                      msg.role === 'user'
                        ? 'bg-[#E29626]/20 text-[#E29626] ml-4'
                        : 'bg-[#2D241E] text-stone-300 mr-4'
                    }`}
                  >
                    <p className="font-semibold mb-1">
                      {msg.role === 'user' ? 'You' : msg.planet}
                    </p>
                    <p className="text-[11px] leading-relaxed">{msg.text}</p>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Loader size={12} className="animate-spin" />
                    {selectedPlanet.planet} is responding...
                  </div>
                )}

                <div ref={conversationEndRef} />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  onClick={handleEnergyBoost}
                  disabled={isLoading}
                  className="px-3 py-2 bg-yellow-900/30 text-yellow-300 rounded text-xs font-bold hover:bg-yellow-900/50 transition-colors disabled:opacity-50"
                  title="Boost energy"
                >
                  <Zap size={14} className="mx-auto mb-1" />
                  Boost
                </button>
                <button
                  onClick={handleHeal}
                  disabled={isLoading}
                  className="px-3 py-2 bg-green-900/30 text-green-300 rounded text-xs font-bold hover:bg-green-900/50 transition-colors disabled:opacity-50"
                  title="Heal wounds"
                >
                  <Heart size={14} className="mx-auto mb-1" />
                  Heal
                </button>
                <button
                  onClick={handleChallenge}
                  disabled={isLoading}
                  className="px-3 py-2 bg-red-900/30 text-red-300 rounded text-xs font-bold hover:bg-red-900/50 transition-colors disabled:opacity-50"
                  title="Challenge growth"
                >
                  <Brain size={14} className="mx-auto mb-1" />
                  Challenge
                </button>
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handleSendMessage()
                  }
                  placeholder="Say something..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-[#2D241E] border border-[#3D3220] rounded text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#E29626] disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="px-3 py-2 bg-[#E29626] text-[#0F0D0C] rounded text-xs font-bold hover:bg-[#D9851F] transition-colors disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>

              {/* Speak Button */}
              <button
                onClick={handleNarrate}
                disabled={!conversation.length}
                className={`w-full px-3 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  isSpeaking
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-[#2D241E] text-[#E29626] hover:bg-[#3D3220]'
                } disabled:opacity-50`}
              >
                <Volume2 size={14} />
                {isSpeaking ? 'Stop' : 'Narrate'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="text-xs text-stone-500 bg-[#1A1714] border border-[#2D241E] rounded p-3">
        💡 <span className="font-semibold">Gameplay Tips:</span> Click planets to select them. Use
        Boost to increase energy, Heal to resolve conflicts, Challenge to encourage growth. Type
        messages for deeper interaction. Your actions influence planetary moods and power.
      </div>
    </div>
  );
}
