# Planet Entity System - Quick Reference

## 🎬 Getting Started

The main component is **NativityMeetPlanetsTab** which handles the complete summon-to-display workflow.

```tsx
import NativityMeetPlanetsTab from './NativityMeetPlanetsTab';

// Use it with a nativity chart ID
<NativityMeetPlanetsTab nativityChartId="user-chart-123" />
```

## 📦 What Each File Does

| File | Purpose | Key Exports |
|------|---------|-------------|
| `PlanetCharacter3D.tsx` | Renders 3D planet with Three.js | Component |
| `personalityParser.ts` | Extracts personality from LLM text | `parsePersonality()`, `getDefaultPersonality()` |
| `PlanetEntityDisplay.tsx` | Shows personality traits and narrative | Component |
| `PlanetEntitySystemGuide.tsx` | Onboarding tutorial dialog | Component |
| `usePlanetEntities.ts` | State management hook | `usePlanetEntities()` |
| `entityConfig.ts` | All configurable settings | `ENTITY_CONFIG` object |
| `planetEntityTypes.ts` | TypeScript definitions | All `interface`s and `type`s |

## 🔧 Common Customizations

### Change Animation Speed
```typescript
// In entityConfig.ts
ANIMATION: {
  idleFloatSpeed: 1.5,  // Faster float (was 0.8)
}
```

### Add a New Mood
```typescript
// In personalityParser.ts
const MOOD_KEYWORDS: Record<string, string[]> = {
  mystical: ['enchant', 'magic', 'twilight'],
  // ...existing moods...
};

// Add to mood color mapping
const MOOD_GRADIENTS = {
  mystical: 'from-purple-700 to-indigo-900',
  // ...existing moods...
};
```

### Customize 3D Model
```typescript
// In PlanetCharacter3D.tsx, modify CharacterMesh function
// Change geometry:
<mesh>
  <icosahedronGeometry args={[1, 5]} />  // Instead of sphere
  <meshStandardMaterial color={colorValue} />
</mesh>

// Add particles:
<Points positions={particlePositions} />

// Add additional rings:
<mesh rotation={[Math.PI / 6, 0, 0]}>
  <torusGeometry args={[1.8, 0.08, 32, 32]} />
  <meshStandardMaterial color={colorValue} transparent opacity={0.3} />
</mesh>
```

### Change Trait Extraction Logic
```typescript
// In personalityParser.ts, modify extractTraits()
function extractTraits(text: string): string[] {
  // Currently: takes first word from each sentence (max 5)
  // You could instead:
  // - Extract adjectives using NLP
  // - Use LLM to generate traits
  // - Parse XML tags from LLM response
  // - Use dominant words by frequency
}
```

### Adjust Energy Calculation
```typescript
// In personalityParser.ts, modify calculateEnergy()
function calculateEnergy(text: string): number {
  // Currently: based on length, exclamation marks, questions
  // Could also consider:
  // - All caps words (intensity)
  // - Repeated punctuation (!!!!)
  // - Sentiment score (more positive = more energy)
  // - Action verb presence
}
```

## 🎨 Working with Moods

Each mood has:
1. **Detection keywords** - text patterns that trigger it
2. **UI emoji** - visual representation
3. **UI gradient** - color scheme for display
4. **Associated traits** - default traits if parsing fails

```typescript
// View all mood mappings
console.log(MOOD_KEYWORDS);      // Detection keywords
console.log(MOOD_ICONS);          // Emoji
console.log(MOOD_GRADIENTS);      // Color gradients
// Call getDefaultPersonality(planet) to see default traits
```

## 🔗 Integrating with External Systems

### Hook into Planet Entity Creation
```tsx
const { addEntity } = usePlanetEntities();

// After LLM response
const personality = parsePersonality(llmText, planet);
addEntity(planet, llmText);
```

### Access Summoned Planets
```tsx
const { entities, getAllEntities } = usePlanetEntities();

// Get one planet
const mars = entities['Mars'];

// Get all
const all = getAllEntities();
```

### Subscribe to Changes
```tsx
const [planetCharacters, setPlanetCharacters] = useState({});

// When planet summoned:
setPlanetCharacters(prev => ({
  ...prev,
  [planet]: { planet, personality, avatar }
}));
```

## 📊 Understanding Energy Levels

Energy (0-1 scale) indicates personality expressiveness:

- **0.0-0.33**: Low energy - quiet, reserved, subtle
- **0.33-0.66**: Medium energy - balanced, moderate expression
- **0.66-1.0**: High energy - vivid, expressive, intense

Visual indicators:
- Larger aura rings at high energy
- Brighter glow and emission at high energy
- More intense colors at high energy
- Slower animations at low energy

## 🚨 Troubleshooting

### 3D Characters Not Rendering
- Check browser supports WebGL
- Verify Three.js and React Three Fiber installed
- Check console for THREE.js errors
- Ensure Canvas has proper size (not 0 height)

### Personality Not Parsing Correctly
- Check `personalityParser.ts` console logs
- Verify LLM response is not empty
- Ensure mood keywords match your LLM output
- Add debug logs to `parsePersonality()`

### Performance Issues
- Reduce canvas resolution in entityConfig
- Limit simultaneous summoned planets
- Disable auto-rotate when active
- Use Shared Canvas instead of individual canvases

## 📖 Files to Read First

1. **IMPLEMENTATION_SUMMARY.md** - High-level overview
2. **PLANET_ENTITIES_README.md** - Detailed system guide
3. **planetEntityTypes.ts** - Understand the data structures
4. **personalityParser.ts** - How personalities are extracted
5. **PlanetCharacter3D.tsx** - How 3D rendering works

## 🚀 Next Steps

1. **Test it**: Summon planets and see personalities emerge
2. **Customize**: Adjust colors, animations, moods to fit your vision
3. **Extend**: Add planet interactions, sound, persistent memory
4. **Integrate**: Connect with other app features (transits, relationships, etc.)

## 💬 Comments & Logs

Enable debug logging:
```typescript
// In personalityParser.ts, add:
console.log('Parsing:', { text: avatarText, mood, traits, energy });

// In NativityMeetPlanetsTab.tsx, add:
console.log('Summoned:', { planet, personality, avatar });
```

Use browser DevTools to inspect:
- React component state
- Three.js scene graph
- Network requests to LLM API
- WebGL shader compilation
