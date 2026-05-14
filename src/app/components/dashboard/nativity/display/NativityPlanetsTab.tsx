'use client'
import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Heart,
  AlertCircle,
  Lightbulb,
  Zap,
} from 'lucide-react';
import type { PlanetPersonality, PlanetRelationship } from '~/server/services/planetaryPersonality';

interface NativityPlanetsTabProps {
  planets: PlanetPersonality[];
}

export default function NativityPlanetsTab({
  planets,
}: NativityPlanetsTabProps) {
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<{
    planet: string;
    relationship: PlanetRelationship;
  } | null>(null);

  return (
    <div className="h-full flex flex-col p-6 bg-[#0F0D0C] overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#E29626] mb-2">
          Your Planetary Cast
        </h3>
        <p className="text-xs text-stone-400">
          Meet your inner characters - each planet represents an archetype within you
        </p>
      </div>

      {/* Planets List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {planets.map((planet) => (
          <div key={planet.planet} className="space-y-2">
            {/* Planet Card Header */}
            <button
              onClick={() =>
                setExpandedPlanet(
                  expandedPlanet === planet.planet ? null : planet.planet,
                )
              }
              className="w-full p-4 bg-[#1A1714] border border-[#2D241E] rounded-lg hover:border-[#E29626] transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  {/* Planet Icon/Color */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: planet.colorCode }}
                  >
                    {planet.planet.substring(0, 2)}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-stone-100">
                      {planet.planet}
                    </h4>
                    <p className="text-xs text-stone-400">
                      {planet.archetype}
                    </p>
                  </div>
                </div>

                {/* Strength Indicator */}
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-24 h-2 bg-[#2D241E] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E29626] transition-all"
                      style={{ width: `${planet.strength * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#E29626] font-bold w-8">
                    {Math.round(planet.strength * 100)}%
                  </span>
                </div>

                {/* Expand Icon */}
                {expandedPlanet === planet.planet ? (
                  <ChevronUp size={18} className="text-[#E29626]" />
                ) : (
                  <ChevronDown size={18} className="text-stone-500" />
                )}
              </div>

              {/* Quick Info Row */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span
                  className="px-2 py-1 rounded bg-[#2D241E] text-stone-300"
                  style={{
                    borderLeft: `3px solid ${planet.colorCode}`,
                  }}
                >
                  {planet.zodiacSign} in House {planet.house}
                </span>
                <span className="text-stone-400">
                  {planet.currentExpression}
                </span>
                {planet.isRetrograde && (
                  <span className="px-2 py-1 rounded bg-red-900/30 text-red-300 text-xs font-semibold">
                    ℜ Retrograde
                  </span>
                )}
              </div>
            </button>

            {/* Expanded Details */}
            {expandedPlanet === planet.planet && (
              <div className="bg-[#0D0B0A] border border-[#2D241E] rounded-lg overflow-hidden">
                {/* Core Theme */}
                <div className="p-4 border-b border-[#2D241E]">
                  <p className="text-sm font-semibold text-[#E29626] mb-2">
                    {planet.primaryTheme}
                  </p>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    <span className="font-semibold">Function:</span>{' '}
                    {planet.psychologicalFunction}
                  </p>
                  <p className="text-xs text-stone-300 leading-relaxed mt-2">
                    <span className="font-semibold">Life Domain:</span>{' '}
                    {planet.lifeDomain}
                  </p>
                </div>

                {/* Relationships Section */}
                {planet.relationships.length > 0 && (
                  <div className="p-4 border-b border-[#2D241E]">
                    <h5 className="text-xs font-bold text-[#E29626] mb-3 flex items-center gap-2">
                      <Heart size={14} />
                      Relationships in Your Chart
                    </h5>
                    <div className="space-y-2">
                      {planet.relationships.map((rel, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            setSelectedRelationship({
                              planet: planet.planet,
                              relationship: rel,
                            })
                          }
                          className="w-full p-2 rounded bg-[#1A1714] hover:bg-[#2D241E] transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{rel.icon}</span>
                            <span className="text-xs font-semibold text-stone-200">
                              {rel.planet}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${getRelationshipBadgeColor(rel.relationshipType)}`}
                            >
                              {rel.relationshipType}
                            </span>
                            <span className="text-xs text-stone-500">
                              {rel.aspectType}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 ml-6">
                            {rel.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges & Potentials */}
                <div className="p-4 space-y-3">
                  {planet.challenges.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Growth Edges
                      </h5>
                      <ul className="space-y-1">
                        {planet.challenges.map((challenge, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-stone-300 leading-relaxed flex gap-2"
                          >
                            <span className="text-red-400 mt-1">→</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {planet.potentials.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-green-400 mb-2 flex items-center gap-2">
                        <Lightbulb size={14} />
                        Your Gifts
                      </h5>
                      <ul className="space-y-1">
                        {planet.potentials.map((potential, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-stone-300 leading-relaxed flex gap-2"
                          >
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{potential}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Therapeutic Guidance */}
                <div className="p-4 bg-[#1A1714] border-t border-[#2D241E]">
                  <h5 className="text-xs font-bold text-[#E29626] mb-2 flex items-center gap-2">
                    <Zap size={14} />
                    Your Path Forward
                  </h5>
                  <p className="text-xs text-stone-300 leading-relaxed italic">
                    "{planet.therapeuticGuidance}"
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Relationship Detail Modal */}
      {selectedRelationship && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRelationship(null)}
        >
          <div
            className="bg-[#1A1714] border border-[#2D241E] rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#E29626] mb-4">
              {selectedRelationship.planet} ♥ {selectedRelationship.relationship.planet}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-stone-400 mb-1">
                  Relationship Type
                </p>
                <p className={`text-sm font-bold ${getRelationshipColor(selectedRelationship.relationship.relationshipType)}`}>
                  {selectedRelationship.relationship.relationshipType.charAt(0).toUpperCase() +
                    selectedRelationship.relationship.relationshipType.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 mb-1">
                  Aspect
                </p>
                <p className="text-sm text-stone-300">
                  {selectedRelationship.relationship.aspectType} (
                  {selectedRelationship.relationship.orb.toFixed(1)}°)
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 mb-1">
                  Meaning
                </p>
                <p className="text-sm text-stone-300">
                  {selectedRelationship.relationship.description}
                </p>
              </div>
              <div className="pt-2 border-t border-[#2D241E]">
                <p className="text-xs font-semibold text-stone-400 mb-2">
                  Therapeutic Perspective
                </p>
                <p className="text-sm text-stone-200 italic">
                  "{selectedRelationship.relationship.therapeuticMeaning}"
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRelationship(null)}
              className="mt-6 w-full px-4 py-2 bg-[#E29626] text-[#0F0D0C] font-bold rounded hover:bg-[#D9851F] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getRelationshipBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    ally: 'bg-green-900/30 text-green-300',
    neutral: 'bg-blue-900/30 text-blue-300',
    challenger: 'bg-orange-900/30 text-orange-300',
    teacher: 'bg-purple-900/30 text-purple-300',
  };
  return colors[type] || 'bg-stone-900/30 text-stone-300';
}

function getRelationshipColor(type: string): string {
  const colors: Record<string, string> = {
    ally: 'text-green-400',
    neutral: 'text-blue-400',
    challenger: 'text-orange-400',
    teacher: 'text-purple-400',
  };
  return colors[type] || 'text-stone-400';
}
