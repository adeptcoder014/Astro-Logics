# TITANS System: Architecture Reference

## Quick Start for Developers

### 1. Computing TITAN State
```typescript
// In your API endpoint or service:
import { getTitanEngine } from '~/server/titans/titanEngine';
import { PersonalityProjector } from '~/server/services/personalityProjector';

// Scenario: User views a chart
const chartId = "user-chart-123";
const timestamp = Date.now(); // or specific moment

// Get all TITAN interpretations
const planets = ["SUN", "MOON", "MERCURY", "VENUS", "MARS", "JUPITER", "SATURN", "MEAN_NODE"];
const interpretations = [];

for (const planet of planets) {
  const titanInput = await buildTitanInput(chart, planet, timestamp);
  const engine = getTitanEngine(planet);
  const interpretation = engine.compute(titanInput);
  interpretations.push(interpretation);
}

// Project into human-perceivable state
const personality = PersonalityProjector.project(chartId, timestamp, interpretations);

// Result: PersonalityState ready for UI
// {
//   dominantTitans: [...],
//   emotionalVector: { intensity, volatility, focus },
//   expressionProfile: { motionStyle, tempo, colorPalette },
//   visualInfluences: { posture, gazeDirection, idleAnimationStyle }
// }
```

### 2. Generating Constrained Dialogue
```typescript
import { LlmConstraintEnforcer } from '~/server/services/llmConstraintEnforcer';
import { MemoryGateway } from '~/server/services/memoryGateway';

// User asks a question about a planet
const userPrompt = "What does Mars want?";
const planet = "MARS";

// Get constraints from TITAN state
const constraints = PersonalityProjector.deriveLlmConstraints(interpretation);

// Build system prompt
const systemPrompt = LlmConstraintEnforcer.buildConstrainedPrompt(
  userPrompt,
  { chartId, planet, personalityState, constraints, model: "ollama" }
);

// Call LLM with constraints
const llmResponse = await ollama.generate({
  system: systemPrompt,
  prompt: userPrompt,
  model: "neural-chat"
});

// Validate output
const result = await LlmConstraintEnforcer.validateDialogue(llmResponse, {
  chartId,
  planet,
  personalityState,
  constraints,
  userPrompt,
  model: "ollama"
});

if (result.approved) {
  // Store as narrative
  await MemoryGateway.processIntent(chartId, result.memoryIntent);
  
  // Return to user
  return result.text;
} else {
  // Log violations and return sanitized version
  console.log("Violations:", result.warnings);
  return result.text;
}
```

### 3. Understanding DomainInterpretation
```typescript
// This is what TITAN engines output - pure state, no prose

interface DomainInterpretation {
  planet: "MARS";                           // Which planet
  domain: "WILL";                           // Which domain
  
  // Metrics (0-100 scale)
  energyLevel: 65;                          // How much energy available
  agency: 78;                               // Can act independently
  tension: 45;                              // Internal friction
  clarity: 72;                              // Mental coherence
  
  // Temporal context
  temporalMood: "building";                 // dormant|building|pressurized|releasing
  
  // Constraints (flags, not prose)
  constraintFlags: ["retrograde"];          // retrograde, combust, debilitated, etc.
  
  // Decision tendencies (not personality)
  decisionBiases: [
    "action-oriented",
    "immediate-expression",
    "confident"
  ];
  
  // How strong is this TITAN right now
  natalStrength: 0.75;                      // 0-1 (natal dignity)
  transitInfluence: 0.45;                   // 0-1 (transits affecting it)
  aspectalTension: 0.3;                     // 0-1 (hard aspects present)
  authorityScore: 0.58;                     // 0-1 (prominence in this moment)
}
```

### 4. Understanding PersonalityState
```typescript
// This is what gets sent to UI and LLMs - perception layer

interface PersonalityState {
  chartId: "user-chart-123";
  timestamp: 1707465600000;
  
  // Which planets are dominant right now
  dominantTitans: [
    { planet: "SUN", authorityScore: 0.85 },
    { planet: "MARS", authorityScore: 0.72 },
    { planet: "MOON", authorityScore: 0.68 }
  ];
  
  // How does this feel?
  emotionalVector: {
    intensity: 73,                          // Overall energy level
    volatility: 48,                         // How unpredictable
    focus: 65                               // Mental clarity
  };
  
  // What are the decision tendencies?
  behavioralBiases: [
    "action-oriented",
    "confident",
    "assertive",
    "immediate-expression"
  ];
  
  // How should this be expressed?
  expressionProfile: {
    motionStyle: "fluid",                   // sharp|fluid|restrained
    tempo: 0.73,                            // 0-1, speed of action
    colorPalette: ["#FFD700", "#DAA520", "#8B4513"]
  };
  
  // What does the body do?
  visualInfluences: {
    posture: "upright",                     // upright|tilted|bent|prostrate
    gazeDirection: "forward",               // forward|skyward|inward|downward
    idleAnimationStyle: "steady"            // steady|fidgeting|restless|still
  };
}
```

### 5. Understanding LlmConstraints
```typescript
// This is what LLMs receive - rules for what they can say

interface LlmConstraints {
  planet: "MARS";
  domain: "WILL";
  
  // Temperament guidance
  temperamentFlags: ["assertive", "confident", "action-oriented"];
  
  // FORBIDDEN WORDS
  forbiddenTopics: ["prediction", "certainty", "control"];
  
  // REQUIRED LANGUAGE
  requiredQualifiers: ["perhaps", "may", "tends"];
  
  // Tone calibration
  toneGuidance: {
    aggression: 0.65,                       // 0-1, how forceful
    compassion: 0.3,                        // 0-1, how warm
    clarity: 0.72,                          // 0-1, how clear
    mystery: 0.28                           // 0-1, how uncertain
  };
}
```

---

## Common Patterns

### Pattern 1: Dynamic Constraint Adjustment
```typescript
// Constraints change based on planetary state

if (interpretation.tension > 75) {
  // High tension → require more hedging qualifiers
  constraints.requiredQualifiers.push("carefully", "tentatively");
}

if (interpretation.constraintFlags.includes("retrograde")) {
  // Retrograde → encourage introspection
  constraints.toneGuidance.mystery += 0.2;
  constraints.toneGuidance.clarity -= 0.1;
}

if (interpretation.clarity < 40) {
  // Low clarity → more uncertainty
  constraints.forbiddenTopics.push("definitive", "absolute");
}
```

### Pattern 2: Personality-Driven UI
```typescript
// Use PersonalityState to drive Three.js animation parameters

const { visualInfluences, expressionProfile, emotionalVector } = personalityState;

character.setPosture(visualInfluences.posture);
character.setGazeDirection(visualInfluences.gazeDirection);
character.setIdleAnimation(visualInfluences.idleAnimationStyle);

// Apply motion style
gsap.to(character, {
  duration: 2 / expressionProfile.tempo,
  opacity: emotionalVector.intensity / 100,
  rotation: expressionProfile.motionStyle === "sharp" ? 5 : 1,
  ease: expressionProfile.motionStyle === "fluid" ? "power1.inOut" : "power2.out"
});

// Apply colors
character.material.color.set(expressionProfile.colorPalette[0]);
```

### Pattern 3: Memory-Safe Narrative Storage
```typescript
// Only narratives can be stored from LLM

const memoryIntent = {
  type: "NARRATIVE",           // NOT "FACT"
  content: llmResponse,
  source: "LLM",
  authoritative: false,        // LLM is never authoritative
  timestamp: Date.now()
};

// Gateway enforces this
const result = await MemoryGateway.processIntent(chartId, memoryIntent);
if (result.success) {
  console.log(`Stored to ${result.location}`);  // "VECTOR" (narrative DB)
}
```

### Pattern 4: Comparing Planetary States Over Time
```typescript
// Create checkpoints to see how personality evolved

await MemoryGateway.createCheckpoint(
  chartId,
  "Mars Station Direct",
  {
    eventType: "mars-station",
    description: "Mars stations direct, energy shifts",
    beforeState: personalityStateBefore,
    afterState: personalityStateAfter
  }
);

// Later: retrieve to show progression narrative
const narratives = await MemoryGateway.retrieveNarratives(
  chartId,
  "mars transition"  // semantic search
);
```

---

## Error Handling

### TITAN Computation Failure
```typescript
try {
  const interpretation = engine.compute(titanInput);
} catch (error) {
  console.error(`TITAN computation failed for ${planet}:`, error);
  
  // Return safe default state
  return {
    planet,
    domain,
    energyLevel: 50,
    agency: 50,
    tension: 50,
    clarity: 50,
    temporalMood: "building",
    constraintFlags: ["computation-failed"],
    decisionBiases: [],
    natalStrength: 0,
    transitInfluence: 0,
    aspectalTension: 0,
    authorityScore: 0
  };
}
```

### Constraint Violation Detection
```typescript
const result = await LlmConstraintEnforcer.validateDialogue(response, request);

if (!result.approved) {
  // Log for audit
  await LlmConstraintEnforcer.logEnforcement(
    chartId,
    planet,
    "sanitized",
    result.warnings.join(" | ")
  );
  
  // Use sanitized version
  return result.text;
}
```

### Memory Authority Failure
```typescript
const authorized = await MemoryGateway.enforceAuthority(source, intent);

if (!authorized) {
  console.error(`[SECURITY] Memory authority violation: ${source} attempted ${intent.type}`);
  
  // Reject write
  return { success: false, location: "REJECTED" };
}
```

---

## Integration Checklist

- [ ] Import TITAN types in your components
- [ ] Call `titans.getTitanInterpretations()` from dashboard
- [ ] Use `PersonalityProjector` to get UI state
- [ ] Pass constraints to all LLM calls
- [ ] Use `LlmConstraintEnforcer` to validate LLM output
- [ ] Store narratives via `MemoryGateway`
- [ ] Connect `PersonalityState` to Three.js character controller
- [ ] Test constraint violations are caught and sanitized
- [ ] Implement audit logging for memory writes
- [ ] Add Vector DB integration for narrative storage

---

## Real-World Example: Mars Dialogue Flow

```typescript
// 1. User asks about Mars in their chart
const userPrompt = "What's my Mars trying to do?";
const planet = "MARS";
const chartId = "user-123";

// 2. Compute Mars state
const titanInput = await buildTitanInput(chart, "MARS", Date.now());
const marsEngine = getTitanEngine("MARS");
const marsState = marsEngine.compute(titanInput);

// Result:
{
  planet: "MARS",
  domain: "WILL",
  energyLevel: 72,
  agency: 85,
  tension: 38,
  clarity: 68,
  temporalMood: "building",
  constraintFlags: [],
  decisionBiases: ["action-oriented", "confident"],
  authorityScore: 0.75
}

// 3. Project personality
const personality = PersonalityProjector.project(chartId, Date.now(), [marsState]);
// { dominantTitans: [...], emotionalVector: {...}, ... }

// 4. Derive LLM constraints
const constraints = PersonalityProjector.deriveLlmConstraints(marsState);
// { temperamentFlags: ["assertive", "confident"], 
//   forbiddenTopics: ["prediction"], 
//   requiredQualifiers: ["perhaps", "may"],
//   toneGuidance: { aggression: 0.65, ... } }

// 5. Build constrained prompt
const systemPrompt = LlmConstraintEnforcer.buildConstrainedPrompt(userPrompt, {
  chartId,
  planet: "MARS",
  personalityState: personality,
  constraints,
  model: "ollama"
});

// System prompt includes:
// - Energy Level: 72/100
// - Clarity: 68/100
// - Temperament Flags: assertive, confident
// - FORBIDDEN: prediction, certainty
// - MUST USE: perhaps, may
// - Assertiveness: 65%, Compassion: 20%, Clarity: 68%, Mystery: 32%

// 6. Call LLM
const response = await ollama.generate({
  system: systemPrompt,
  prompt: userPrompt,
  model: "neural-chat"
});

// Possible response:
// "Mars is building energy for action. Perhaps it wants to assert itself 
// in a situation where you've been holding back. The strong aspect to 
// Venus suggests this might be about relationships or values. Mars tends 
// to want directness and confidence here."

// 7. Validate
const result = await LlmConstraintEnforcer.validateDialogue(response, {
  chartId,
  planet: "MARS",
  personalityState: personality,
  constraints,
  userPrompt,
  model: "ollama"
});

// Checks:
// ✓ No forbidden words
// ✓ Uses "perhaps", "might", "tends" (required qualifiers)
// ✓ No predictions ("will happen")
// ✓ No certainty claims

// 8. Store & return
await MemoryGateway.processIntent(chartId, result.memoryIntent);
const textToUser = result.text;
```

---

## Testing TITANS

```bash
# Unit test a single TITAN
npm test -- titans.test.ts

# Integration test the full flow
npm test -- titans-integration.test.ts

# Type check
npx tsc --noEmit

# Lint architecture rules
npm run lint --rule="no-direct-llm-fact-writes"
```

---

## Performance Considerations

- **TITAN Computation**: ~5-10ms per planet (lightweight)
- **PersonalityProjector**: ~2ms for 8 planets (aggregation only)
- **LlmConstraintEnforcer**: ~1ms (text validation)
- **MemoryGateway**: ~50-100ms (database writes)
- **LLM Generation**: 1-5 seconds (model-dependent)

**Recommendation**: Cache `PersonalityState` for 60-120 seconds per chart to avoid recomputation.

---

## Next: Integration with Existing Services

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for full Phase 2-5 roadmap.
