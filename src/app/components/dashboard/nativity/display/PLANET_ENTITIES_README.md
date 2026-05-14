# Planet Entity System - Living Planets

This system transforms the "Meet your Planets" section into an interactive experience where each planet becomes a **living entity** with its own personality, energy, and character

## Overview

- **PlanetCharacter3D.tsx** - Three.js 3D visualization of planets with animated auras and orbs
- **personalityParser.ts** - Converts LLM responses into structured personality data
- **PlanetEntityDisplay.tsx** - Rich text display of planet personality and traits
- **usePlanetEntities.ts** - React hook for managing planet entity state
- **NativityMeetPlanetsTab.tsx** - Main component orchestrating the summon experience

## How It Works

### 1. Summoning a Planet
When a user clicks "Summon" on a planet:

```
1. API call to generatePlanetAvatar with planet name
2. LLM generates a personality description/narrative
3. parsePersonality() extracts:
   - mood (radiant, contemplative, passionate, etc.)
   - traits (personality characteristics)
   - color (planet-specific)
   - energy (0-1, based on text expressiveness)
4. 3D character renders with personality-driven visuals
5. Traits and narrative display below
```

### 2. Personality Parsing

The system analyzes the LLM response to determine:

**Mood Detection:**
- Scans for keyword patterns to determine emotional state
- Maps to archetypal moods: radiant, contemplative, passionate, gentle, chaotic, analytical

**Trait Extraction:**
- Pulls the first meaningful word from each sentence
- Limits to 5 traits for clean display
- Filters out small words and punctuation

**Energy Calculation:**
- Text length contributes to overall energy
- Exclamation marks increase passion
- Question marks indicate thoughtfulness
- Results in a 0-1 energy value

**Color Assignment:**
- Each planet has a signature color (Sun=gold, Moon=silver, Mars=crimson, etc.)
- Colors match astrological tradition
- Used in 3D rendering and UI

### 3. 3D Visualization

The PlanetCharacter3D component renders:
- **Core sphere** - main body with planetary color and glow
- **Energy auras** - expanding rings based on energy level
- **Point lights** - emissive lighting matching personality
- **Animations** - idle float, hover scaling, rotation
- **Info overlay** - planet name, mood, energy bar

### 4. Entity State Management

Each planet entity stores:
```typescript
{
  planet: string,           // "Mars", "Venus", etc.
  personality: {
    mood: string,           // "passionate"
    traits: string[],       // ["fierce", "courageous", "driven"]
    color: string,          // "#DC143C"
    energy: number,         // 0.9
  },
  avatar: string,           // Full LLM response
  summonedAt: Date,        // When summoned
  isActive: boolean,       // Currently displayed
}
```

## Customization Points

### Add More Moods
Edit `MOOD_KEYWORDS` in `personalityParser.ts`:
```typescript
const MOOD_KEYWORDS: Record<string, string[]> = {
  mystical: ['enchant', 'magic', 'portal', 'cosmic'],
  // Add more moods here
};
```

### Change Planet Colors
Edit `PLANET_COLORS` in `personalityParser.ts`:
```typescript
const PLANET_COLORS: Record<string, string> = {
  CustomPlanet: '#FF00FF',
  // Modify as needed
};
```

### Enhance 3D Visuals
In `PlanetCharacter3D.tsx`, modify the `CharacterMesh` component:
- Change geometry (currently spheres and toruses)
- Add particle effects
- Implement custom animations
- Add sound reactivity

### Extend Personality Display
In `PlanetEntityDisplay.tsx`:
- Add more visual indicators
- Implement hover interactions
- Create personality charts/graphs
- Add relational compatibility displays

## Future Enhancements

1. **Interactivity:**
   - Click planets to "communicate" with them
   - Personality evolves based on chart transits
   - Multi-planet interactions showing relationships

2. **Sound Design:**
   - Each mood has a sonic signature
   - Tone frequencies based on planetary associations
   - Audio reactivity in 3D visualization

3. **Procedural Models:**
   - Generate unique character models based on aspects (conjunctions, trines, etc.)
   - Each birth chart gets unique visual styles

4. **Persistent Memory:**
   - Store previous summoned entities
   - Track personality evolution
   - Build relationships between planets over time

5. **Integration with Chart:**
   - Show planet strengths/weaknesses in aspects
   - Visualize planetary conflicts
   - Display dignity and debility visually

## Technical Notes

- Uses React Three Fiber for 3D rendering
- Canvas rendered inside each planet card for isolation
- parsePersonality() is deterministic - same text produces same personality
- No external model files needed - all geometry procedural
- GPU-accelerated animations for smooth 60fps

## Performance Considerations

- Each planet gets its own Canvas element (could be optimized to shared canvas)
- Animations use requestAnimationFrame for smooth performance
- Personality parsing is fast (O(n) on text length)
- Memory usage scales linearly with number of summoned planets
