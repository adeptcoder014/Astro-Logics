/**
 * TITAN Engine: Base class and planetary implementations
 * 
 * Each TITAN is a domain-bounded cognitive engine with:
 * - deterministic computation
 * - no prose generation
 * - no UI artifacts
 * - structured output only
 */

import {
  type TitanEngine,
  type TitanComputeInput,
  type DomainInterpretation,
  type PlanetName,
  type DomainType,
  type TemporalMood,
} from "~/types/titans";

// ============================================================================
// ABSTRACT BASE CLASS
// ============================================================================

export abstract class BaseTitanEngine implements TitanEngine {
  abstract planet: PlanetName;
  abstract domain: DomainType;

  abstract compute(input: TitanComputeInput): DomainInterpretation;

  abstract label(): string;

  /**
   * Helper: Calculate dignity strength (0–1)
   */
  protected calculateDignityStrength(
    planet: PlanetName,
    sign: string,
    house: number
  ): number {
    const domicileMap: Record<PlanetName, string[]> = {
      SUN: ["LEO"],
      MOON: ["CANCER"],
      MERCURY: ["GEMINI", "VIRGO"],
      VENUS: ["TAURUS", "LIBRA"],
      MARS: ["ARIES", "SCORPIO"],
      JUPITER: ["SAGITTARIUS", "PISCES"],
      SATURN: ["CAPRICORN", "AQUARIUS"],
      URANUS: ["AQUARIUS"],
      NEPTUNE: ["PISCES"],
      PLUTO: ["SCORPIO"],
      MEAN_NODE: ["GEMINI", "SAGITTARIUS"],
      TRUE_NODE: ["GEMINI", "SAGITTARIUS"],
    };

    const isDomicile = domicileMap[planet]?.includes(sign) ?? false;
    const angularBonus = [1, 4, 7, 10].includes(house) ? 0.15 : 0;
    const exiltedBonus = this.isExalted(planet, sign) ? 0.1 : 0;

    if (isDomicile) {
      return Math.min(1.0, 0.8 + angularBonus + exiltedBonus);
    }
    return Math.min(1.0, 0.5 + angularBonus + exiltedBonus);
  }

  /**
   * Helper: Check if planet is exalted in sign
   */
  protected isExalted(planet: PlanetName, sign: string): boolean {
    const exaltationMap: Record<PlanetName, string[]> = {
      SUN: ["ARIES"],
      MOON: ["TAURUS"],
      MERCURY: ["VIRGO"],
      VENUS: ["PISCES"],
      MARS: ["CAPRICORN"],
      JUPITER: ["CANCER"],
      SATURN: ["LIBRA"],
      URANUS: ["SCORPIO"],
      NEPTUNE: ["LEO"],
      PLUTO: ["ARIES"],
      MEAN_NODE: [],
      TRUE_NODE: [],
    };

    return exaltationMap[planet]?.includes(sign) ?? false;
  }

  /**
   * Helper: Determine temporal mood based on transit aspects
   */
  protected calculateTemporalMood(input: TitanComputeInput): TemporalMood {
    const transits = input.activeTransits;
    const hardAspects = transits.filter((t) =>
      ["square", "opposition", "quincunx"].includes(t.aspectingNatalPlanets[0]?.aspect ?? "")
    ).length;

    const softAspects = transits.filter((t) =>
      ["trine", "sextile", "conjunction"].includes(t.aspectingNatalPlanets[0]?.aspect ?? "")
    ).length;

    if (hardAspects > softAspects) {
      return input.planetaryProfile.retrograde ? "dormant" : "pressurized";
    }
    if (softAspects > hardAspects) {
      return "releasing";
    }
    return "building";
  }

  /**
   * Helper: Extract constraint flags
   */
  protected extractConstraintFlags(input: TitanComputeInput): string[] {
    const flags: string[] = [];

    if (input.planetaryProfile.retrograde) {
      flags.push("retrograde");
    }
    if (input.planetaryProfile.stationary) {
      flags.push("stationary");
    }

    // Check if combust (within 8.5° of Sun)
    const sunLongitude = input.natalBaseline.planetaryWeighting["SUN"] ?? 0;
    const distance = Math.abs(input.planetaryProfile.longitude - sunLongitude);
    if (distance < 8.5 || distance > 351.5) {
      flags.push("combust");
    }

    // Check dignity
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );
    if (dignityStrength < 0.4) {
      flags.push("debilitated");
    }

    // Check for out-of-bounds
    if (Math.abs(input.planetaryProfile.declination) > 23.44) {
      flags.push("out-of-bounds");
    }

    return flags;
  }

  /**
   * Helper: Determine behavioral biases
   */
  protected extractDecisionBiases(input: TitanComputeInput): string[] {
    const biases: string[] = [];
    const aspectTension = input.activeTransits.filter((t) =>
      t.aspectingNatalPlanets.some((a) =>
        ["square", "opposition"].includes(a.aspect)
      )
    ).length;

    if (input.planetaryProfile.retrograde) {
      biases.push("introspective");
      biases.push("delayed-response");
    } else {
      biases.push("immediate-expression");
    }

    if (aspectTension > 2) {
      biases.push("defensive");
      biases.push("reactive");
    } else if (aspectTension === 0) {
      biases.push("autonomous");
      biases.push("self-directed");
    }

    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    if (dignityStrength > 0.8) {
      biases.push("confident");
      biases.push("assertive");
    } else if (dignityStrength < 0.4) {
      biases.push("uncertain");
      biases.push("hesitant");
    }

    return biases;
  }
}

// ============================================================================
// INDIVIDUAL TITAN IMPLEMENTATIONS
// ============================================================================

export class SunTitan extends BaseTitanEngine {
  planet: PlanetName = "SUN";
  domain: DomainType = "IDENTITY";

  label(): string {
    return "Core Identity & Will";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    const natalStrength = dignityStrength;
    const energyLevel = (natalStrength * 50 + transitInfluence * 50) * (input.planetaryProfile.retrograde ? 0.7 : 1.0);

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, energyLevel),
      agency: Math.min(100, natalStrength * 100),
      tension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 20,
      clarity: (1 - input.activeTransits.length * 0.1) * 100,
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: this.extractDecisionBiases(input),
      natalStrength,
      transitInfluence,
      aspectalTension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 0.25,
      authorityScore: (natalStrength + transitInfluence) / 2,
    };
  }
}

export class MoonTitan extends BaseTitanEngine {
  planet: PlanetName = "MOON";
  domain: DomainType = "EMOTION";

  label(): string {
    return "Emotional Needs & Response";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    // Moon speed increases energy
    const speedBonus = Math.min(input.planetaryProfile.speed / 14, 1);
    const energyLevel = (dignityStrength * 40 + speedBonus * 30 + transitInfluence * 30) * 100;

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, energyLevel),
      agency: Math.min(100, dignityStrength * 80),
      tension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 25,
      clarity: Math.min(100, input.planetaryProfile.house <= 6 ? 60 : 80),
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "emotionally-reactive"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 0.25,
      authorityScore: (dignityStrength + transitInfluence) / 2,
    };
  }
}

export class MercuryTitan extends BaseTitanEngine {
  planet: PlanetName = "MERCURY";
  domain: DomainType = "COMMUNICATION";

  label(): string {
    return "Reasoning & Expression";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    const speedBonus = Math.min(Math.abs(input.planetaryProfile.speed) / 2, 1);
    const energyLevel = (dignityStrength * 40 + speedBonus * 40 + transitInfluence * 20) * 100;

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, energyLevel),
      agency: Math.min(100, dignityStrength * 90),
      tension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 15,
      clarity: (dignityStrength * 100) * (input.planetaryProfile.retrograde ? 0.6 : 1.0),
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "analytical"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 0.2,
      authorityScore: (dignityStrength * 0.6 + transitInfluence * 0.4),
    };
  }
}

export class VenusTitan extends BaseTitanEngine {
  planet: PlanetName = "VENUS";
  domain: DomainType = "DESIRE";

  label(): string {
    return "Values & Attraction";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    const energyLevel = (dignityStrength * 50 + transitInfluence * 50) * (input.planetaryProfile.retrograde ? 0.5 : 1.0);

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, energyLevel),
      agency: Math.min(100, dignityStrength * 75),
      tension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 20,
      clarity: Math.min(100, 70),
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "socially-motivated"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 0.25,
      authorityScore: (dignityStrength + transitInfluence) / 2,
    };
  }
}

export class MarsTitan extends BaseTitanEngine {
  planet: PlanetName = "MARS";
  domain: DomainType = "WILL";

  label(): string {
    return "Action & Assertion";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    const speedBonus = Math.min(Math.abs(input.planetaryProfile.speed) / 1, 1);
    const energyLevel = (dignityStrength * 40 + speedBonus * 40 + transitInfluence * 20) * 100;

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, energyLevel),
      agency: Math.min(100, (dignityStrength + speedBonus) / 2 * 100),
      tension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 25,
      clarity: 70,
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "action-oriented"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 0.3,
      authorityScore: (dignityStrength * 0.5 + transitInfluence * 0.5),
    };
  }
}

export class JupiterTitan extends BaseTitanEngine {
  planet: PlanetName = "JUPITER";
  domain: DomainType = "EXPANSION";

  label(): string {
    return "Growth & Opportunity";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    const energyLevel = (dignityStrength * 50 + transitInfluence * 50) * 100;

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, energyLevel),
      agency: Math.min(100, dignityStrength * 85),
      tension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 15,
      clarity: Math.min(100, (dignityStrength + 0.5) * 100),
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "optimistic"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 0.2,
      authorityScore: (dignityStrength + transitInfluence) / 2,
    };
  }
}

export class SaturnTitan extends BaseTitanEngine {
  planet: PlanetName = "SATURN";
  domain: DomainType = "LIMITATION";

  label(): string {
    return "Structure & Consequence";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    const energyLevel = (dignityStrength * 40 + transitInfluence * 60) * 100;

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, energyLevel),
      agency: Math.min(100, (dignityStrength * 0.8) * 100),
      tension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 30,
      clarity: Math.min(100, dignityStrength * 100),
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "cautious", "dutiful"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 0.35,
      authorityScore: (dignityStrength * 0.4 + transitInfluence * 0.6),
    };
  }
}

export class MeanNodeTitan extends BaseTitanEngine {
  planet: PlanetName = "MEAN_NODE";
  domain: DomainType = "DESTINY";

  label(): string {
    return "Destiny & Karmic Direction";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    const energyLevel = (dignityStrength * 50 + transitInfluence * 50) * 100;

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, energyLevel),
      agency: Math.min(100, dignityStrength * 70),
      tension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 20,
      clarity: Math.min(100, (0.6 + dignityStrength * 0.4) * 100),
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "fated", "karmic"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: input.activeTransits.filter((t) =>
        t.aspectingNatalPlanets.some((a) => ["square", "opposition"].includes(a.aspect))
      ).length * 0.25,
      authorityScore: (dignityStrength * 0.5 + transitInfluence * 0.5),
    };
  }
}

export class UranusTitan extends BaseTitanEngine {
  planet: PlanetName = "URANUS";
  domain: DomainType = "INNOVATION";

  label(): string {
    return "Innovation & Disruption";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, (dignityStrength * 50 + transitInfluence * 50) * 100),
      agency: Math.min(100, dignityStrength * 80),
      tension: 60,
      clarity: 65,
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "unconventional"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: 0.3,
      authorityScore: (dignityStrength * 0.5 + transitInfluence * 0.5),
    };
  }
}

export class NeptuneTitan extends BaseTitanEngine {
  planet: PlanetName = "NEPTUNE";
  domain: DomainType = "DISSOLUTION";

  label(): string {
    return "Transcendence & Dissolution";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, (dignityStrength * 40 + transitInfluence * 60) * 100),
      agency: Math.min(100, dignityStrength * 60),
      tension: 50,
      clarity: 30,
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "intuitive", "elusive"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: 0.25,
      authorityScore: (dignityStrength * 0.4 + transitInfluence * 0.6),
    };
  }
}

export class PlutoTitan extends BaseTitanEngine {
  planet: PlanetName = "PLUTO";
  domain: DomainType = "TRANSFORMATION";

  label(): string {
    return "Death & Rebirth";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, (dignityStrength * 50 + transitInfluence * 50) * 100),
      agency: Math.min(100, (dignityStrength + 0.3) * 100 * 0.7),
      tension: 75,
      clarity: 55,
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "transformative", "obsessive"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: 0.35,
      authorityScore: (dignityStrength * 0.45 + transitInfluence * 0.55),
    };
  }
}

export class TrueNodeTitan extends BaseTitanEngine {
  planet: PlanetName = "TRUE_NODE";
  domain: DomainType = "DESTINY";

  label(): string {
    return "True Destiny Path";
  }

  compute(input: TitanComputeInput): DomainInterpretation {
    const dignityStrength = this.calculateDignityStrength(
      input.planetaryProfile.planet,
      input.planetaryProfile.sign,
      input.planetaryProfile.house
    );

    const transitInfluence = input.activeTransits.reduce((sum, t) => {
      const maxExactness = Math.max(
        ...t.aspectingNatalPlanets.map((a) => a.exactness)
      );
      return sum + maxExactness;
    }, 0) / Math.max(input.activeTransits.length, 1);

    return {
      planet: this.planet,
      domain: this.domain,
      energyLevel: Math.min(100, (dignityStrength * 50 + transitInfluence * 50) * 100),
      agency: Math.min(100, dignityStrength * 70),
      tension: 40,
      clarity: 55,
      temporalMood: this.calculateTemporalMood(input),
      constraintFlags: this.extractConstraintFlags(input),
      decisionBiases: [...this.extractDecisionBiases(input), "soul-directed"],
      natalStrength: dignityStrength,
      transitInfluence,
      aspectalTension: 0.2,
      authorityScore: (dignityStrength * 0.5 + transitInfluence * 0.5),
    };
  }
}

// ============================================================================
// TITAN REGISTRY
// ============================================================================

export const titanRegistry: Record<PlanetName, BaseTitanEngine> = {
  SUN: new SunTitan(),
  MOON: new MoonTitan(),
  MERCURY: new MercuryTitan(),
  VENUS: new VenusTitan(),
  MARS: new MarsTitan(),
  JUPITER: new JupiterTitan(),
  SATURN: new SaturnTitan(),
  URANUS: new UranusTitan(),
  NEPTUNE: new NeptuneTitan(),
  PLUTO: new PlutoTitan(),
  MEAN_NODE: new MeanNodeTitan(),
  TRUE_NODE: new TrueNodeTitan(),
};

export function getTitanEngine(planet: PlanetName): BaseTitanEngine {
  const engine = titanRegistry[planet];
  if (!engine) {
    throw new Error(`No TITAN engine registered for planet: ${planet}`);
  }
  return engine;
}
