/**
 * TITANS Router: Domain-bounded cognitive engines as first-class system entities
 * 
 * Data flow:
 * 1. User specifies chart + timestamp
 * 2. TITAN Engines compute DomainInterpretation (pure state)
 * 3. PersonalityProjector aggregates → PersonalityState
 * 4. LLM receives PersonalityState + LlmConstraints (constrained)
 * 5. MemoryGateway routes outputs (facts ↔ narrative)
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { getSwissEph } from "~/server/astro/swissEph";
import {
  getTitanEngine,
  type BaseTitanEngine,
} from "~/server/titans/titanEngine";
import { PersonalityProjector } from "~/server/services/personalityProjector";
import { MemoryGateway } from "~/server/services/memoryGateway";
import {
  type TitanComputeInput,
  type DomainInterpretation,
  type PersonalityState,
  type PlanetName,
} from "~/types/titans";

// ============================================================================
// SCHEMAS
// ============================================================================

const GetTitansForChartSchema = z.object({
  chartId: z.string(),
  timestamp: z.number().optional(), // defaults to chart birth time
});

const ComputeTitanStateSchema = z.object({
  chartId: z.string(),
  planet: z.enum([
    "SUN",
    "MOON",
    "MERCURY",
    "VENUS",
    "MARS",
    "JUPITER",
    "SATURN",
    "URANUS",
    "NEPTUNE",
    "PLUTO",
    "MEAN_NODE",
    "TRUE_NODE",
  ]),
  timestamp: z.number().optional(),
});

const GetPersonalityStateSchema = z.object({
  chartId: z.string(),
  timestamp: z.number().optional(),
});

const GetLlmConstraintsSchema = z.object({
  chartId: z.string(),
  planet: z.enum([
    "SUN",
    "MOON",
    "MERCURY",
    "VENUS",
    "MARS",
    "JUPITER",
    "SATURN",
    "URANUS",
    "NEPTUNE",
    "PLUTO",
    "MEAN_NODE",
    "TRUE_NODE",
  ]),
  timestamp: z.number().optional(),
});

// ============================================================================
// TITANS ROUTER
// ============================================================================

export const titansRouter = createTRPCRouter({
  /**
   * Get all TITAN interpretations for a chart at a specific moment
   * 
   * Returns DomainInterpretation[] (pure state, no prose)
   */
  getTitanInterpretations: protectedProcedure
    .input(GetTitansForChartSchema)
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.chartId },
      });

      if (!chart || chart.userId !== ctx.session.user.id) {
        throw new Error("Chart not found or unauthorized");
      }

      // Use input timestamp or default to birth time
      const timestamp = input.timestamp ?? chart.birthDateTime.getTime();

      // Compute state for all major planets
      const planets: PlanetName[] = [
        "SUN",
        "MOON",
        "MERCURY",
        "VENUS",
        "MARS",
        "JUPITER",
        "SATURN",
        "MEAN_NODE",
      ];

      const interpretations: DomainInterpretation[] = [];

      for (const planet of planets) {
        try {
          const titanInput = await buildTitanInput(
            chart,
            planet,
            timestamp
          );
          const engine = getTitanEngine(planet);
          const interpretation = engine.compute(titanInput);
          interpretations.push(interpretation);
        } catch (error) {
          console.error(`Failed to compute TITAN for ${planet}:`, error);
        }
      }

      // Store facts in memory gateway
      await MemoryGateway.processIntent(input.chartId, {
        type: "FACT",
        content: JSON.stringify({
          planets: interpretations.map((i) => ({
            planet: i.planet,
            energy: i.energyLevel,
            agency: i.agency,
            tension: i.tension,
          })),
        }),
        source: "NATAL_ENGINE",
        authoritative: true,
        timestamp,
      });

      return interpretations;
    }),

  /**
   * Compute a single TITAN's state
   */
  computeTitanState: protectedProcedure
    .input(ComputeTitanStateSchema)
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.chartId },
      });

      if (!chart || chart.userId !==  ctx.session.user.id) {
        throw new Error("Chart not found or unauthorized");
      }

      const timestamp = input.timestamp ?? chart.birthDateTime.getTime();
      const titanInput = await buildTitanInput(
        chart,
        input.planet,
        timestamp
      );

      const engine = getTitanEngine(input.planet);
      const interpretation = engine.compute(titanInput);

      return interpretation;
    }),

  /**
   * Get aggregate PersonalityState (for UI rendering)
   * 
   * Combines all TITAN interpretations into human-perceivable state
   */
  getPersonalityState: protectedProcedure
    .input(GetPersonalityStateSchema)
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.chartId },
      });

      if (!chart || chart.userId !== ctx.session.user.id) {
        throw new Error("Chart not found or unauthorized");
      }

      const timestamp = input.timestamp ?? chart.birthDateTime.getTime();

      // Get all TITAN interpretations
      const planets: PlanetName[] = [
        "SUN",
        "MOON",
        "MERCURY",
        "VENUS",
        "MARS",
        "JUPITER",
        "SATURN",
        "MEAN_NODE",
      ];

      const interpretations: DomainInterpretation[] = [];

      for (const planet of planets) {
        try {
          const titanInput = await buildTitanInput(
            chart,
            planet,
            timestamp
          );

          
          const engine = getTitanEngine(planet);
          const interpretation = engine.compute(titanInput);
          interpretations.push(interpretation);
        } catch (error) {
          console.error(`Failed to compute TITAN for ${planet}:`, error);
        }
      }
      
      // Project into PersonalityState
      const personalityState = PersonalityProjector.project(
        input.chartId,
        timestamp,
        interpretations
      );
      
      console.log('titanInput_____', personalityState);
      return personalityState;
    }),

  /**
   * Get LLM constraints for a specific TITAN
   * 
   * Defines what the LLM can/cannot say about this planetary state
   */
  getTitanLlmConstraints: protectedProcedure
    .input(GetLlmConstraintsSchema)
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.chartId },
      });

      if (!chart || chart.userId !==  ctx.session.user.id) {
        throw new Error("Chart not found or unauthorized");
      }

      const timestamp = input.timestamp ?? chart.birthDateTime.getTime();
      const titanInput = await buildTitanInput(
        chart,
        input.planet,
        timestamp
      );

      const engine = getTitanEngine(input.planet);
      const interpretation = engine.compute(titanInput);

      const constraints = PersonalityProjector.deriveLlmConstraints(
        interpretation
      );

      return constraints;
    }),
});

// ============================================================================
// HELPER FUNCTIONS (Outside Router)
// ============================================================================

async function buildTitanInput(
  chart: any,
  planet: PlanetName,
  timestamp: number
): Promise<TitanComputeInput> {
  // Get ephemeris instance
  const swe = await getSwissEph();

  // Convert timestamp to date
  const dateTime = new Date(timestamp);
  const year = dateTime.getUTCFullYear();
  const month = dateTime.getUTCMonth() + 1;
  const day = dateTime.getUTCDate();
  const hours =
    dateTime.getUTCHours() +
    dateTime.getUTCMinutes() / 60 +
    dateTime.getUTCSeconds() / 3600;

  // Calculate Julian day
  const jd = swe.julday(year, month, day, hours, 1);

  // Get ephemeris for planet
  const flags =
    chart.coordinateSystem === "SIDEREAL"
      ? swe.SEFLG_SIDEREAL
      : swe.SEFLG_TROPIC;

  const planetId = getPlanetId(planet, swe);
  const planetRes = swe.calc_ut(jd, planetId, flags);

  // Calculate houses - Swiss Ephemeris uses different API
  // Using Placidus system (P='P' is standard, but we'll use available function)
  let ascendant = 0;
  let houseCusp = 1;
  
  try {
    // Try to get houses if available - different binding versions have different names
    const housesFunc = (swe as any).houses || 
                       (swe as any).housesEx || 
                       (swe as any).calc_houses;
    
    if (housesFunc) {
      const houseRes = housesFunc(jd, chart.latitude, chart.longitude, "P");
      ascendant = Array.isArray(houseRes) ? houseRes[0] : houseRes;
      houseCusp = calculateHouse(planetRes[0], ascendant);
    } else {
      // Fallback: estimate house based on longitude and ascendant approximation
      houseCusp = calculateHouse(planetRes[0], 0);
    }
  } catch (err) {
    // If houses calculation fails, use simple calculation
    houseCusp = calculateHouse(planetRes[0], 0);
  }

  // Extract planetary data
  const planetaryProfile = {
    planet,
    longitude: planetRes[0],
    latitude: planetRes[1],
    speed: planetRes[3],
    retrograde: planetRes[4] < 0,
    stationary: Math.abs(planetRes[3]) < 0.005,
    sign: getLongitudeSign(planetRes[0]),
    house: houseCusp,
    declination: 0, // TODO: calculate from ephemeris
  };

  // Get house context
  const houseContext = {
    house: planetaryProfile.house,
    sign: planetaryProfile.sign,
    cusp: getHouseCusp(planetaryProfile.house),
    ruler: getSignRuler(planetaryProfile.sign),
    planets: [], // TODO: calculate planets in this house
  };

  // Build natal baseline from SUN, MOON, ASC
  const sunRes = swe.calc_ut(jd, swe.SE_SUN, flags);
  const moonRes = swe.calc_ut(jd, swe.SE_MOON, flags);

  const natalBiasProfile = {
    sunSignElement: getSignElement(getLongitudeSign(sunRes[0])),
    moonSignElement: getSignElement(getLongitudeSign(moonRes[0])),
    ascendantElement: getSignElement(getLongitudeSign(ascendant)),
    dominantElement: "earth" as const,
    planetaryWeighting: {
      SUN: sunRes[0],
      MOON: moonRes[0],
      MERCURY: 0,
      VENUS: 0,
      MARS: 0,
      JUPITER: 0,
      SATURN: 0,
      URANUS: 0,
      NEPTUNE: 0,
      PLUTO: 0,
      MEAN_NODE: 0,
      TRUE_NODE: 0,
    },
    chartShapeType: "splash",
  };

  // Get active transits (TODO: implement proper transit calculation)
  const activeTransits = calculateActiveTransits({}, planet);

  return {
    planetaryProfile,
    activeTransits,
    houseContext,
    natalBaseline: natalBiasProfile,
    timestamp,
  };
}

function getPlanetId(planet: PlanetName, swe: any): number {
  const idMap: Record<PlanetName, number> = {
    SUN: swe.SE_SUN,
    MOON: swe.SE_MOON,
    MERCURY: swe.SE_MERCURY,
    VENUS: swe.SE_VENUS,
    MARS: swe.SE_MARS,
    JUPITER: swe.SE_JUPITER,
    SATURN: swe.SE_SATURN,
    URANUS: swe.SE_URANUS,
    NEPTUNE: swe.SE_NEPTUNE,
    PLUTO: swe.SE_PLUTO,
    MEAN_NODE: swe.SE_MEAN_NODE,
    TRUE_NODE: swe.SE_TRUE_NODE,
  };
  return idMap[planet] ?? swe.SE_SUN;
}

function getLongitudeSign(
  longitude: number
): string {
    const signs = [
      "ARIES",
      "TAURUS",
      "GEMINI",
      "CANCER",
      "LEO",
      "VIRGO",
      "LIBRA",
      "SCORPIO",
      "SAGITTARIUS",
      "CAPRICORN",
      "AQUARIUS",
      "PISCES",
    ];
    const index = Math.floor((longitude % 360) / 30);
    return signs[index] ?? "ARIES";
}

function calculateHouse(planetLongitude: number, ascendantLongitude: number): number {
  // Whole sign house system
  const normalizedPlanet = ((planetLongitude % 360) + 360) % 360;
  const normalizedAsc = ((ascendantLongitude % 360) + 360) % 360;
  const planetSignIndex = Math.floor(normalizedPlanet / 30);
  const ascSignIndex = Math.floor(normalizedAsc / 30);
  return ((planetSignIndex - ascSignIndex + 12) % 12) + 1;
}

function getHouseCusp(house: number): number {
  return (house - 1) * 30;
}

function getSignRuler(sign: string): PlanetName {
  const rulers: Record<string, PlanetName> = {
    ARIES: "MARS",
    TAURUS: "VENUS",
    GEMINI: "MERCURY",
    CANCER: "MOON",
    LEO: "SUN",
    VIRGO: "MERCURY",
    LIBRA: "VENUS",
    SCORPIO: "MARS",
    SAGITTARIUS: "JUPITER",
    CAPRICORN: "SATURN",
    AQUARIUS: "SATURN",
    PISCES: "JUPITER",
  };
  return rulers[sign] ?? "SUN";
}

function getSignElement(sign: string): "fire" | "earth" | "air" | "water" {
  const elements: Record<string, "fire" | "earth" | "air" | "water"> = {
    ARIES: "fire",
    TAURUS: "earth",
    GEMINI: "air",
    CANCER: "water",
    LEO: "fire",
    VIRGO: "earth",
    LIBRA: "air",
    SCORPIO: "water",
    SAGITTARIUS: "fire",
    CAPRICORN: "earth",
    AQUARIUS: "air",
    PISCES: "water",
  };
  return elements[sign] ?? "earth";
}

function calculatePlanetaryWeighting(
  ephemeris: any
): Record<PlanetName, number> {
  const weighting: Record<PlanetName, number> = {} as any;
  const planets: PlanetName[] = [
    "SUN",
    "MOON",
    "MERCURY",
    "VENUS",
    "MARS",
    "JUPITER",
    "SATURN",
  ];

  for (const planet of planets) {
    const data = ephemeris.bodies[planet];
    weighting[planet] = data?.lng ?? 0;
  }

  return weighting;
}

function calculateActiveTransits(ephemeris: any, planet: PlanetName): any[] {
  // TODO: Implement transit aspect calculation
  return [];
}
