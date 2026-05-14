/**
 * TITANS System: Domain-Bounded Cognitive Engines
 * 
 * TITANS are planetary intelligences with:
 * - deterministic inputs
 * - constrained reasoning
 * - structured outputs
 * - zero narrative authority
 * 
 * They compute state. They do not generate prose.
 */

// ============================================================================
// CORE ENUMS & LITERALS
// ============================================================================

export type PlanetName =
  | "SUN"
  | "MOON"
  | "MERCURY"
  | "VENUS"
  | "MARS"
  | "JUPITER"
  | "SATURN"
  | "URANUS"
  | "NEPTUNE"
  | "PLUTO"
  | "MEAN_NODE"
  | "TRUE_NODE";

export type DomainType =
  | "IDENTITY"        // SUN
  | "EMOTION"         // MOON
  | "COMMUNICATION"   // MERCURY
  | "DESIRE"          // VENUS
  | "WILL"            // MARS
  | "EXPANSION"       // JUPITER
  | "LIMITATION"      // SATURN
  | "TRANSFORMATION"  // PLUTO
  | "DESTINY"         // MEAN_NODE
  | "INNOVATION"      // URANUS
  | "DISSOLUTION";    // NEPTUNE

export type TemporalMood =
  | "dormant"
  | "building"
  | "pressurized"
  | "releasing";

// ============================================================================
// PLANETARY STATE & PROFILE
// ============================================================================

export interface PlanetaryProfile {
  planet: PlanetName;
  longitude: number;           // ecliptic longitude (0–360)
  latitude: number;            // ecliptic latitude
  speed: number;               // degrees per day
  retrograde: boolean;
  stationary: boolean;
  sign: string;                // zodiac sign (ARIES–PISCES)
  house: number;               // 1–12
  declination: number;         // north–south
}

export interface TransitState {
  planet: PlanetName;
  longitude: number;
  retrograde: boolean;
  aspectingNatalPlanets: Array<{
    planet: PlanetName;
    aspect: string;            // "conjunction", "square", "trine", etc.
    orb: number;
    exactness: number;          // 0–1, where 1 is exact
  }>;
}

export interface HouseState {
  house: number;
  sign: string;
  cusp: number;
  ruler: PlanetName;
  planets: PlanetName[];        // planets in this house
}

export interface NatalBiasProfile {
  sunSignElement: "fire" | "earth" | "air" | "water";
  moonSignElement: "fire" | "earth" | "air" | "water";
  ascendantElement: "fire" | "earth" | "air" | "water";
  dominantElement: "fire" | "earth" | "air" | "water";
  planetaryWeighting: Record<PlanetName, number>; // strength distribution
  chartShapeType: string;                          // "bundle", "splash", etc.
}

// ============================================================================
// TITAN COMPUTATION INPUT
// ============================================================================

export interface TitanComputeInput {
  planetaryProfile: PlanetaryProfile;
  activeTransits: TransitState[];
  houseContext: HouseState;
  natalBaseline: NatalBiasProfile;
  timestamp: number;
}

// ============================================================================
// DOMAIN INTERPRETATION (TITAN OUTPUT)
// ============================================================================

/**
 * STRICT output from TitanEngine.compute()
 * 
 * ❌ No prose
 * ❌ No emotions
 * ❌ No UI artifacts
 * 
 * Only state, metrics, flags.
 */
export interface DomainInterpretation {
  planet: PlanetName;
  domain: DomainType;

  // Raw metrics
  energyLevel: number;         // 0–100
  agency: number;              // 0–100, ability to act
  tension: number;             // 0–100, internal friction
  clarity: number;             // 0–100, mental coherence

  // Time-based mood
  temporalMood: TemporalMood;

  // Constraint flags (why action is difficult)
  constraintFlags: string[];   // e.g., "debilitated", "combust", "retrograde", "out-of-bounds"

  // Decision biases (psychological tendencies)
  decisionBiases: string[];    // e.g., "risk-seeking", "defensive", "strategic", "avoidant"

  // Active influences
  natalStrength: number;       // 0–1 (dignity, angular position)
  transitInfluence: number;    // 0–1 (transit aspect strength)
  aspectalTension: number;     // 0–1 (how many hard aspects)

  // Authority score (is this TITAN prominent in this moment?)
  authorityScore: number;      // 0–1
}

// ============================================================================
// TITAN ENGINE INTERFACE
// ============================================================================

export interface TitanEngine {
  planet: PlanetName;
  domain: DomainType;

  /**
   * Compute planetary state and interpretation.
   * This is the ONLY entry point.
   * 
   * @param input structured astrological state
   * @returns DomainInterpretation (PURE DATA, no prose)
   */
  compute(input: TitanComputeInput): DomainInterpretation;

  /**
   * Get human-readable label for this TITAN
   */
  label(): string;
}

// ============================================================================
// PERSONALITY STATE (AGGREGATE OF ALL TITANS)
// ============================================================================

/**
 * PersonalityState is computed by PersonalityProjector
 * It is the bridge between TITAN outputs and human perception.
 */
export interface PersonalityState {
  chartId: string;
  timestamp: number;

  // Which TITANs are dominant in this moment
  dominantTitans: Array<{
    planet: PlanetName;
    authorityScore: number;
  }>;

  // Aggregate emotional signature
  emotionalVector: {
    intensity: number;         // 0–100, overall energy
    volatility: number;        // 0–100, unpredictability
    focus: number;             // 0–100, mental clarity
  };

  // Aggregate decision tendencies
  behavioralBiases: string[];

  // How to express this state
  expressionProfile: {
    motionStyle: "sharp" | "fluid" | "restrained";
    tempo: number;             // 0–1, speed of action
    colorPalette: string[];    // hex colors for visual rendering
  };

  // Visual constraints
  visualInfluences: {
    posture: "upright" | "tilted" | "bent" | "prostrate";
    gazeDirection: "forward" | "skyward" | "inward" | "downward";
    idleAnimationStyle: "steady" | "fidgeting" | "restless" | "still";
  };
}

// ============================================================================
// LLM CONSTRAINT ENVELOPE
// ============================================================================

/**
 * What the LLM is allowed to do and say.
 * Generated from DomainInterpretation.
 */
export interface LlmConstraints {
  planet: PlanetName;
  domain: DomainType;
  temperamentFlags: string[];  // "thoughtful", "aggressive", "cautious", etc.
  forbiddenTopics: string[];   // "prediction", "certainty", "control"
  requiredQualifiers: string[]; // "perhaps", "tendency", "pattern"
  toneGuidance: {
    aggression: number;        // 0–1
    compassion: number;        // 0–1
    clarity: number;           // 0–1
    mystery: number;           // 0–1
  };
}

// ============================================================================
// MEMORY GOVERNANCE
// ============================================================================

/**
 * What can be stored and where.
 */
export interface MemoryIntent {
  type: "FACT" | "NARRATIVE" | "INTERPRETATION";
  content: string;
  source: "NATAL_ENGINE" | "TRANSIT_ENGINE" | "TITAN_ENGINE" | "LLM";
  authoritative: boolean;       // Can this be stored as truth?
  timestamp: number;
}

export interface MemoryRecord {
  id: string;
  chartId: string;
  timestamp: number;
  type: "FACT" | "NARRATIVE";
  content: string;
  source: string;
  embedding?: number[];         // vector DB embedding
}
