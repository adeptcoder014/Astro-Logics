# Planet Entity System - Architecture Diagram

## Component Hierarchy

```
NativityMeetPlanetsTab (Main Component)
├── PlanetEntitySystemGuide (Onboarding)
├── for each planet:
│   ├── Planet Card Header
│   │   ├── Planet Name
│   │   └── Summon Button
│   └── State Based Rendering:
│       ├── If Summoned & Has Data:
│       │   ├── PlanetCharacter3D
│       │   │   └── Three.js Canvas
│       │   │       ├── CharacterMesh
│       │   │       │   ├── Core Sphere
│       │   │       │   ├── Primary Ring
│       │   │       │   ├── Secondary Ring
│       │   │       │   └── Point Light
│       │   │       ├── Lighting
│       │   │       └── OrbitControls
│       │   └── Character Info Panel
│       │       ├── Personality Traits
│       │       └── Collapsible Whispers
│       ├── If Loading:
│       │   └── Loading Spinner
│       └── If Not Summoned:
│           └── Placeholder
```

## Data Flow

```
User Action (Click Summon)
    ↓
handleMeet(planet)
    ├── Set loading state
    ├── API Call: generatePlanetAvatar(chartId, planet)
    │   ↓ [Backend/LLM]
    │   LLM generates personality narrative
    │   ↓
    ├── Receive avatar string
    ├── parsePersonality(avatar, planet)
    │   ├── Extract mood from keywords
    │   ├── Extract traits from sentences
    │   ├── Calculate energy from text metrics
    │   └── Get planet color
    │   ↓
    ├── Returns PlanetPersonality object
    ├── Store in state: planetCharacters[planet]
    ├── Clear loading state
    ↓
React Re-render
    ├── Render PlanetCharacter3D
    │   ├── Create Three.js scene
    │   ├── Render personality-driven 3D model
    │   └── Start animations
    ├── Display trait tags
    └── Show collapsible narrative
```

## State Management

```
NativityMeetPlanetsTab State:
├── selected: string | null
│   └── Which planet is currently displayed
├── planetCharacters: Record<string, PlanetWithPersonality>
│   └── { planet, personality, avatar } for each summoned planet
├── loadingPlanet: string | null
│   └── Which planet is being summoned
└── showGuide: boolean
    └── Is onboarding guide visible?
```

## Type System

```
PlanetPersonality
├── mood: PlanetMood ('radiant' | 'contemplative' | ...)
├── traits: string[] (max 5)
├── color: string (hex)
└── energy: number (0-1)

PlanetEntity (Extended state)
├── planet: string
├── personality: PlanetPersonality
├── avatar: string
├── summonedAt?: Date
└── isActive?: boolean
```

## Module Dependencies

```
NativityMeetPlanetsTab
├── Imports:
│   ├── api (tRPC)
│   ├── PlanetCharacter3D
│   ├── PlanetEntitySystemGuide
│   ├── parsePersonality
│   └── useState (React)

PlanetCharacter3D
├── Imports:
│   ├── Canvas, useFrame (React Three Fiber)
│   ├── OrbitControls (drei)
│   ├── THREE
│   └── ENTITY_CONFIG

personalityParser
├── Exports:
│   ├── parsePersonality()
│   ├── getDefaultPersonality()
│   └── Helper functions
└── Dependencies:
    └── PLANET_COLORS, MOOD_KEYWORDS, MOOD_GRADIENTS

PlanetEntitySystemGuide
└── Pure presentational component

entityConfig
└── Configuration constants and objects

usePlanetEntities
└── React hook for entity state management

planetEntityTypes
└── TypeScript type definitions only
```

## Three.js Scene Graph

```
Scene
├── Ambient Light (0.6 intensity)
├── Directional Light (0.8 intensity)
├── Camera (50 FOV, position [0,0,3])
├── Group (animated container)
│   ├── Mesh 1: Core Sphere
│   │   ├── Geometry: SphereGeometry(1, 64, 64)
│   │   └── Material: MeshStandardMaterial (emissive)
│   ├── Mesh 2: Primary Ring
│   │   ├── Geometry: TorusGeometry(scale, width, 32, 32)
│   │   └── Material: MeshStandardMaterial (transparent)
│   ├── Mesh 3: Secondary Ring
│   │   ├── Geometry: TorusGeometry(scale, width, 32, 32)
│   │   └── Material: MeshStandardMaterial (transparent)
│   └── Point Light (color matched to personality)
├── OrbitControls (interaction layer)
└── Renderer (WebGL)
```

## Configuration Hierarchy

```
entityConfig (global)
├── ANIMATION
│   ├── idleFloatSpeed
│   ├── hoverScaleAmount
│   └── ...
├── VISUALS
│   ├── primaryRingScale()
│   ├── metalness
│   └── ...
├── CAMERA
│   ├── fov
│   ├── defaultPosition
│   └── ...
└── PARSING
    ├── maxTraits
    ├── minWordLength
    └── ...
```

## Personality Parsing Pipeline

```
LLM Response (string)
    ↓
sentenceTokenizer() → sentences[]
    ↓
for each sentence:
    ├── word tokenizer
    ├── filter by word length
    └── first word → trait
    ↓
traits[] (max 5)

Text Analysis:
├── mood keywords scan → mood string
├── calculate energy:
│   ├── length metric (0-1)
│   ├── exclamation count
│   ├── question count
│   └── sum with weights
└── energy (0-1)

Color Lookup:
├── planet name → PLANET_COLORS
└── color (hex)

Result: PlanetPersonality object
```

## Performance Considerations

```
Rendering Performance:
├── Canvas per planet (not shared)
├── GPU accelerated animations
├── Lazy loading (only render summoned)
└── 60fps target on modern hardware

Memory Usage:
├── Linear with summoned planets count
├── Each planet: ~1MB (Canvas + state)
└── No external model files

CPU Usage:
├── parsePersonality(): O(n) on text length
├── Animation: 60fps via requestAnimationFrame
└── Interactions: handled by OrbitControls
```

## Future Enhancement Paths

```
Multi-Planet System:
├── Shared Canvas
├── Planet relationship visualization
└── Interactive communication nodes

AI Integration:
├── LLM personality refinement
├── Dynamic trait generation
└── Chart-aware personality

Visual Enhancements:
├── Custom geometry per mood
├── Particle effects
├── Shader-based auras
└── Audio reactivity

Persistence:
├── Store summoned entities
├── Track evolution over time
├── Build planet relationships
└── Create entity memory
```

---

This system is designed to be modular and extensible. Each component has a clear responsibility, making it easy to understand, maintain, and enhance.
