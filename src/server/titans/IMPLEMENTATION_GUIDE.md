# TITANS System Implementation Guide

> **Architecture**: Decision-intelligence platform using TITANS (domain-bounded cognitive engines)
> **Version**: 1.0
> **Status**: Core framework implemented

## 📋 What Was Implemented

### 1. **Core TITAN Types & Interfaces** [src/types/titans.ts](src/types/titans.ts)
- ✅ `TitanEngine` interface (abstract contract for all planetary engines)
- ✅ `DomainInterpretation` output format (pure state, no prose)
- ✅ `PersonalityState` (aggregated perception from all TITANs)
- ✅ `LlmConstraints` (what LLMs can/cannot say)
- ✅ `MemoryIntent` (routing facts vs narratives)
- ✅ `PlanetaryProfile`, `TransitState`, `HouseState`, `NatalBiasProfile`

### 2. **TITAN Engine Implementations** [src/server/titans/titanEngine.ts](src/server/titans/titanEngine.ts)
- ✅ `BaseTitanEngine` abstract class with helper methods
- ✅ Sun TITAN (Identity & Will)
- ✅ Moon TITAN (Emotion & Response)
- ✅ Mercury TITAN (Communication & Reasoning)
- ✅ Venus TITAN (Desire & Values)
- ✅ Mars TITAN (Will & Action)
- ✅ Jupiter TITAN (Expansion & Opportunity)
- ✅ Saturn TITAN (Limitation & Structure)
- ✅ Mean Node TITAN (Destiny & Karma)
- ✅ TITAN Registry for easy access

**Key Principle**: Each TITAN computes `DomainInterpretation` (pure state) with:
- Energy level, agency, tension, clarity metrics
- Temporal mood (dormant/building/pressurized/releasing)
- Constraint flags (retrograde, combust, debilitated, etc.)
- Decision biases (psychological tendencies)
- Authority score (prominence in this moment)

### 3. **Personality Projector Service** [src/server/services/personalityProjector.ts](src/server/services/personalityProjector.ts)
- ✅ Aggregates TITAN interpretations → `PersonalityState`
- ✅ Calculates emotional vector (intensity, volatility, focus)
- ✅ Derives behavioral biases across all planets
- ✅ Maps expressions (motion style, tempo, colors)
- ✅ Determines visual influences (posture, gaze, animation)
- ✅ `deriveLlmConstraints()` generates constraint envelope for LLMs

**Purpose**: Bridge between deterministic state (TITANS) and human perception (UI/LLM)

### 4. **Memory Gateway Service** [src/server/services/memoryGateway.ts](src/server/services/memoryGateway.ts)
- ✅ Enforces authority: Facts ↔ Narratives separation
- ✅ Routes intents: FACT → SQL, NARRATIVE → Vector DB
- ✅ Validates LLM cannot write facts (only narratives)
- ✅ TITANS can only request storage, gateway decides
- ✅ Creates checkpoints (snapshots of state + narrative)
- ✅ Prevents narrative corruption of reality

**Rules Enforced**:
- LLM source cannot create `type: FACT`
- Only `NATAL_ENGINE` can create authoritative facts
- Memory writes checked before persistence

### 5. **LLM Constraint Enforcer** [src/server/services/llmConstraintEnforcer.ts](src/server/services/llmConstraintEnforcer.ts)
- ✅ Pre-generation: Builds constrained system prompt
- ✅ Post-generation: Validates output against constraints
- ✅ Checks forbidden topics
- ✅ Ensures required qualifiers present
- ✅ Sanitizes violations
- ✅ Logs enforcement actions

**Workflow**:
```
LLM Input: buildConstrainedPrompt(PersonalityState + LlmConstraints)
     ↓
LLM Output: validateDialogue(response, constraints)
     ↓
Result: Approved | Sanitized | Rejected
```

### 6. **TITANS tRPC Router** [src/server/api/routers/titans.ts](src/server/api/routers/titans.ts)
- ✅ `getTitanInterpretations()` - All TITANs at timestamp
- ✅ `computeTitanState()` - Single TITAN computation
- ✅ `getPersonalityState()` - Aggregated perception
- ✅ `getTitanLlmConstraints()` - Constraint envelope for a TITAN
- ✅ Helper: `buildTitanInput()` - Constructs ephemeris + context

**Data Flow**:
```
Chart + Timestamp
     ↓
[Ephemeris] → TitanComputeInput
     ↓
getTitanEngine(planet).compute(input) → DomainInterpretation[]
     ↓
PersonalityProjector.project() → PersonalityState
     ↓
UI Receives: PersonalityState | LlmConstraints
```

### 7. **Router Integration**
- ✅ Added `titansRouter` to [src/server/api/root.ts](src/server/api/root.ts)
- ✅ tRPC procedures enforce type safety

---

## 🚀 Usage Examples

### Get Personality State for UI Rendering
```typescript
const personalityState = await trpc.titans.getPersonalityState.query({
  chartId: "abc123",
  timestamp: Date.now() // defaults to birth time
});

// Returns:
{
  dominantTitans: [
    { planet: "SUN", authorityScore: 0.8 },
    { planet: "MOON", authorityScore: 0.7 }
  ],
  emotionalVector: {
    intensity: 72,
    volatility: 45,
    focus: 60
  },
  expressionProfile: {
    motionStyle: "fluid",
    tempo: 0.72,
    colorPalette: ["#FFD700", "#FFA500", "..."]
  },
  visualInfluences: {
    posture: "upright",
    gazeDirection: "forward",
    idleAnimationStyle: "steady"
  }
}
```

### Get LLM Constraints Before Dialogue
```typescript
const constraints = await trpc.titans.getTitanLlmConstraints.query({
  chartId: "abc123",
  planet: "MARS"
});

// Use in LLM prompt:
const systemPrompt = LlmConstraintEnforcer.systemPrompt({
  chartId,
  planet: "MARS",
  personalityState,
  constraints,
  userPrompt: "What does Mars want?",
  model: "ollama"
});

// Query LLM with systemPrompt
const llmResponse = await callOllama(systemPrompt);

// Validate before storing
const result = await LlmConstraintEnforcer.validateDialogue(
  llmResponse,
  { chartId, planet: "MARS", personalityState, constraints, userPrompt, model: "ollama" }
);

// Store narrative
await MemoryGateway.processIntent(chartId, result.memoryIntent);
```

### Direct TITAN Computation
```typescript
const titanInput = await buildTitanInput(chart, "MERCURY", timestamp);
const mercuryState = getTitanEngine("MERCURY").compute(titanInput);

// Returns:
{
  planet: "MERCURY",
  domain: "COMMUNICATION",
  energyLevel: 65,
  agency: 78,
  tension: 35,
  clarity: 82,
  temporalMood: "building",
  constraintFlags: ["retrograde"],
  decisionBiases: ["analytical", "introspective", "delayed-response"],
  natalStrength: 0.75,
  transitInfluence: 0.45,
  aspectalTension: 0.2,
  authorityScore: 0.58
}
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Natal Chart (One-Time)                   │
│              [Ephemeris @ Birth Time]                        │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ↓                                 ↓
┌──────────────────┐            ┌──────────────────┐
│ NATAL_ENGINE     │            │ TRANSIT_ENGINE   │
│ (one-time calc)  │            │ (dynamic)        │
│                  │            │                  │
│ PlanetaryProfile │            │ ActiveTransits   │
│ HouseContext     │            │ TransitStress    │
│ NatalBiases      │            │                  │
└────────┬─────────┘            └────────┬─────────┘
         │                               │
         └───────────────┬───────────────┘
                         ↓
        ┌────────────────────────────────┐
        │     TITAN Engines (8 major)    │
        │                                │
        │ Sun → Identity                 │
        │ Moon → Emotion                 │
        │ Mercury → Communication        │
        │ Venus → Desire                 │
        │ Mars → Will                    │
        │ Jupiter → Expansion            │
        │ Saturn → Limitation            │
        │ MeanNode → Destiny             │
        │                                │
        │ Input: TitanComputeInput       │
        │ Output: DomainInterpretation[] │
        └────────────┬────────────────────┘
                     │
                     ↓
         ┌───────────────────────────┐
         │ PersonalityProjector      │
         │                           │
         │ Aggregates 8 TITANs       │
         │ → PersonalityState        │
         │                           │
         │ (Dominant planets, colors,│
         │  emotion vector, biases,  │
         │  postural expression)     │
         └──────┬────────────────────┘
                │
        ┌───────┴──────────┬──────────────┐
        │                  │              │
        ↓                  ↓              ↓
   ┌────────────┐   ┌────────────┐  ┌──────────┐
   │ UI/Three.js│   │ LLM Layer  │  │ Memory   │
   │            │   │            │  │ Gateway  │
   │ (Visual)   │   │ Dialogue   │  │          │
   │ Rendering  │   │ Generation │  │ Facts→SQL│
   │            │   │            │  │ Narr→Vec │
   └────────────┘   └────────────┘  └──────────┘
                        │
                  LlmConstraintEnforcer
                  (Validates output)
```

---

## 🎯 Key Architectural Principles

### 1. **No Narrative Corruption**
```typescript
// ❌ FORBIDDEN:
llm.generateStory() → DB.save(story)

// ✅ CORRECT:
llm.generateNarrative(constraints) 
  → validateDialogue(output) 
  → MemoryGateway.processIntent(type: NARRATIVE)
  → Vector DB
```

### 2. **TITANS Never Hallucinate**
- All inputs are deterministic (ephemeris + state)
- All outputs are metrics, not prose
- No LLM involvement in TITAN computation
- Facts are immutable (SQL only)

### 3. **LLMs Are Interpretation-Only**
- Receive `PersonalityState` (perception layer)
- Cannot modify facts
- Cannot decide what to store
- Output is narrative flavor, not reality

### 4. **Three-Layer Authority**
```
Truth Layer (TITANS)      → DomainInterpretation (pure state)
Perception Layer (Projector) → PersonalityState (human-readable)
Narrative Layer (LLM)     → Dialogue (constrained interpretation)
```

### 5. **Memory-Safe by Default**
- All writes go through `MemoryGateway`
- Authority enforced before storage
- Source validation on every intent
- Narrative never corrupts facts

---

## 📂 File Structure

```
src/
├── types/
│   └── titans.ts                    # Core TITAN interfaces
│
├── server/
│   ├── titans/
│   │   └── titanEngine.ts           # TITAN implementations
│   │
│   ├── services/
│   │   ├── personalityProjector.ts  # Aggregation layer
│   │   ├── memoryGateway.ts         # Authority enforcement
│   │   └── llmConstraintEnforcer.ts # LLM validation
│   │
│   └── api/
│       ├── root.ts                  # Router registry (updated)
│       └── routers/
│           └── titans.ts            # tRPC procedures
```

---

## ❌ Known Limitations (Phase 2+)

### Still TODO:
1. **Vector DB Integration** - memoryGateway uses placeholder for narrative storage
2. **Transit Aspects** - `calculateActiveTransits()` in titans router is stubbed
3. **Coordinate System Conversion** - Currently assumes all ephemeris in same system
4. **Time Resolution Enforcement** - Schema allows but not validated
5. **Extended TITANs** - Uranus, Neptune, Pluto not yet implemented
6. **Chart Shape Analysis** - `chartShapeType` hardcoded to "splash"
7. **Animation FSM** - No formal state machine for character animation
8. **Embedding Generation** - Vector DB embeddings not yet implemented

### Workarounds:
- Use `prisma migrate` to add narrative table schema
- Integrate Pinecone/pgvector for production vector storage
- Add middleware for coordinate system validation
- Implement transit aspects from swissEph calculations

---

## 🧪 Testing the System

### Quick Validation Script
```typescript
import { getTitanEngine } from '~/server/titans/titanEngine';
import { PersonalityProjector } from '~/server/services/personalityProjector';

// 1. Build a test chart
const chart = {
  birthDateTime: new Date("2000-01-01"),
  latitude: 40.7128,
  longitude: -74.0060,
  coordinateSystem: "SIDEREAL"
};

// 2. Compute all TITANS
const interpretations = [];
for (const planet of ["SUN", "MOON", "MERCURY", "VENUS", "MARS"]) {
  const input = await buildTitanInput(chart, planet, Date.now());
  const engine = getTitanEngine(planet);
  interpretations.push(engine.compute(input));
}

// 3. Project to PersonalityState
const personality = PersonalityProjector.project(
  "chart123",
  Date.now(),
  interpretations
);

// 4. Derive LLM constraints
const constraints = PersonalityProjector.deriveLlmConstraints(
  interpretations[0]
);

console.log("Personality:", personality);
console.log("Constraints:", constraints);
```

---

## 🔐 Security & Validation

### Memory Authority:
```typescript
const authority = await MemoryGateway.enforceAuthority(source, intent);
// FALSE if:
// - source === "LLM" && intent.authoritative
// - source === "LLM" && intent.type === "FACT"
```

### LLM Output Validation:
```typescript
const result = await LlmConstraintEnforcer.validateDialogue(response, request);
// Checks:
// - No forbidden topics
// - Required qualifiers present
// - Authority compliance
// Result: approved | sanitized | rejected
```

---

## 📝 Next Steps

### Phase 2 (Memory & Narrative)
1. Implement Vector DB integration
2. Add narrative schema to Prisma
3. Generate embeddings for semantic search
4. Create narrative retrieval procedures

### Phase 3 (Animation & FSM)
1. Add character animation state machine
2. Connect PersonalityState → Three.js parameters
3. Implement CharacterRig interface setters
4. Test posture + gaze + motion feedback

### Phase 4 (Extended TITANs)
1. Implement Uranus, Neptune, Pluto engines
2. Add lunar nodes (True Node)
3. Add aspects-specific constraints
4. Implement chart shape analysis

### Phase 5 (UI)
1. Create TITANS dashboard view
2. Display personality state metrics
3. Show dominant TITANS with energy scores
4. Real-time constraint monitoring

---

## ⚠️ Critical Reminders

**This system succeeds because of discipline, not code size.**

If Copilot (or any system) violates these rules:
- ❌ LLM returning prose from TITAN engine
- ❌ Personality parsed client-side instead of backend
- ❌ Memory written without gateway
- ❌ Constraints ignored in LLM output
- ❌ Facts mixed with narrative

**It's wrong. Delete it. Start over.**

The architecture only works if boundaries are respected.

---

**Status**: ✅ Core framework complete. Ready for integration testing.
