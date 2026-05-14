/**
 * Visual persona derived from natal chart context
 * This is the ONLY contract between astrology engine and renderer
 */

export type PlanetPersona = {
  // Which planet (visual asset set)
  planet: 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';
  
  // Emotional/behavioral state
  temperament: 'calm' | 'agitated' | 'authoritative' | 'playful';
  
  // Raw energy level (0–1)
  energy: number;
  
  // Astrological dignity status
  dignity: 'exalted' | 'own' | 'neutral' | 'debilitated';
  
  // Expression tendencies
  expressionBias: {
    talkative: number;    // 0–1, how vocal
    reserved: number;     // 0–1, how withdrawn
    sharp: number;        // 0–1, how cutting/analytical
    warm: number;         // 0–1, how nurturing
  };
};
