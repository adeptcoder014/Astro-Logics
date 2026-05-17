import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { getSwissEph } from "~/server/astro/swissEph";
// import { createProvider } from 'llm/providers/provider';
import { StoryGenerator, type NativityContext } from "~/server/services/storyGenerator";
import { PlanetaryPersonalityService } from "~/server/services/planetaryPersonality";
import { TransitCalculator } from "~/server/services/transitCalculator";
import { synthesizeSceneAttributes } from "~/server/services/astroOntology";
import { buildComicPrompt, type PromptInput } from "~/lib/promptCompiler";
import {
  calculatePlanetaryDignity,
  detectAspects,
  calculateWholeSignHouse,
  getDignityDescription,
  generateScenarioOutline,
  generateSceneScriptFromScenarios,
  extractThemes,
  getMoodFromEnergy,
  type DignityResult,
  type PlanetDataType,
} from "./helpers";
import chalk from "chalk";
import { createProvider } from "../../../../llm/providers/provider";

const safeJSONParse = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const buildStoryStateSummary = async (scenes: Array<{
  behavioralPattern?: string | null;
  externalConflict?: string | null;
  likelyMistake?: string | null;
  relationshipEffect?: string | null;
  pressureDirection?: string | null;
  intensity: number;
}>): Promise<Record<string, any>> => {
  if (!scenes || scenes.length === 0) {
    return {
      dominantPressure: "No scene data available",
      emotionalClimate: "Neutral",
      pressureClusters: [],
      contradictionPatterns: [],
      relationshipTemperature: "Stable",
      collapseRisk: 0,
      adaptationRequirement: "None",
      activeLifeArena: "Unknown",
      momentumDirection: "Stable",
      dominantPlanets: [],
      supportingThemes: [],
      unresolvedPatterns: [],
      behavioralMomentum: "Neutral",
      internalConflictAxis: [],
      externalConflictAxis: [],
      decisionFriction: 0,
      energyDistribution: {},
      temporalPressure: "Low",
      avoidancePatterns: [],
      compensatoryBehaviors: [],
      narrativePhase: "Stable",
      stabilityIndex: 50,
      emotionalTriggers: [],
      repeatingLifePattern: "None identified",
      escalationVector: "None",
      regulationNeeds: [],
      environmentalPressureSources: [],
      identityThreats: [],
      hiddenNeeds: [],
      dominantDefenseMechanisms: [],
      likelyFailurePoint: "None",
      breakthroughPotential: "Low",
      socialAtmosphere: "Neutral",
      narrativeTensionCurve: "Flat",
      activePolarities: []
    };
  }

  const prompt = `
You are an expert behavioral analyst synthesizing planetary transit data into a comprehensive psychological profile.

ANALYZE THESE PLANETARY SCENES:
${scenes.map((scene, idx) => `
SCENE ${idx + 1}:
- Behavioral Pattern: ${scene.behavioralPattern || 'Not specified'}
- External Conflict: ${scene.externalConflict || 'Not specified'}
- Likely Mistake: ${scene.likelyMistake || 'Not specified'}
- Relationship Effect: ${scene.relationshipEffect || 'Not specified'}
- Pressure Direction: ${scene.pressureDirection || 'Not specified'}
- Intensity: ${scene.intensity}/100
`).join('\n')}

GENERATE a detailed JSON object representing the collective current story state. Each field must be derived from the aggregated planetary influences.

REQUIRED FIELDS (all must be present):
{
  "dominantPressure": "string describing the primary psychological pressure",
  "emotionalClimate": "string describing the overall emotional atmosphere",
  "pressureClusters": ["array of pressure themes"],
  "contradictionPatterns": ["array of conflicting forces"],
  "relationshipTemperature": "string: Hot/Cold/Warm/Volatile/etc",
  "collapseRisk": number 0-100,
  "adaptationRequirement": "string describing what needs to change",
  "activeLifeArena": "string: career/relationships/health/family/etc",
  "momentumDirection": "string: accelerating/decelerating/stable",
  "dominantPlanets": ["array of planet names most influential"],
  "supportingThemes": ["array of supporting narrative themes"],
  "unresolvedPatterns": ["array of repeating unresolved issues"],
  "behavioralMomentum": "string describing current behavioral flow",
  "internalConflictAxis": ["array of internal conflicts"],
  "externalConflictAxis": ["array of external conflicts"],
  "decisionFriction": number 0-100,
  "energyDistribution": {"object mapping energy allocation"},
  "temporalPressure": "string: urgent/immediate/gradual/none",
  "avoidancePatterns": ["array of avoidance behaviors"],
  "compensatoryBehaviors": ["array of compensatory actions"],
  "narrativePhase": "string: crisis/building/climax/denouement",
  "stabilityIndex": number 0-100,
  "emotionalTriggers": ["array of emotional triggers"],
  "repeatingLifePattern": "string describing core repeating pattern",
  "escalationVector": "string describing how things might escalate",
  "regulationNeeds": ["array of regulatory needs"],
  "environmentalPressureSources": ["array of external pressure sources"],
  "identityThreats": ["array of identity threats"],
  "hiddenNeeds": ["array of unmet needs"],
  "dominantDefenseMechanisms": ["array of defense mechanisms"],
  "likelyFailurePoint": "string describing potential failure point",
  "breakthroughPotential": "string describing breakthrough opportunities",
  "socialAtmosphere": "string describing social environment",
  "narrativeTensionCurve": "string: rising/falling/peak/valley",
  "activePolarities": ["array of active polarities"]
}

Return ONLY valid JSON with all fields populated based on the planetary data analysis.
`;

  // Try providers in order: local → groq → openai
  const providerChain: Array<'groq' | 'local' | 'openai'> = ['groq', 'local', 'openai'];

  for (const providerName of providerChain) {
    try {
      console.log(`Attempting story state generation with ${providerName} provider...`);
      const llm = createProvider({ provider: providerName });
      const response = await llm.generate({
        system: 'You are an expert behavioral analyst. Output ONLY valid JSON with all the specified fields for the current story state. No markdown, no comments.',
        user: prompt,
      });
      // console.log('========================= response ----------------',response)

      const text = response.text.trim();
      const cleanedText = text.replace(/^```json?\s*\n?/, '').replace(/\n?\s*```$/, '');

      const parsed = JSON.parse(cleanedText);
      console.log(`Story state generated successfully with ${providerName} provider`);
      return parsed as Record<string, any>;
    } catch (error) {
      console.warn(`Story state generation failed with ${providerName} provider:`, error);
      // Continue to next provider in chain
      continue;
    }
  }

  // All providers failed
  console.error('Story state LLM generation failed with all providers, using defaults');
  return {
    dominantPressure: "Analysis unavailable",
    emotionalClimate: "Unknown",
    pressureClusters: [],
    contradictionPatterns: [],
    relationshipTemperature: "Unknown",
    collapseRisk: 50,
    adaptationRequirement: "Further analysis needed",
    activeLifeArena: "Unknown",
    momentumDirection: "Unknown",
    dominantPlanets: [],
    supportingThemes: [],
    unresolvedPatterns: [],
    behavioralMomentum: "Unknown",
    internalConflictAxis: [],
    externalConflictAxis: [],
    decisionFriction: 50,
    energyDistribution: {},
    temporalPressure: "Unknown",
    avoidancePatterns: [],
    compensatoryBehaviors: [],
    narrativePhase: "Unknown",
    stabilityIndex: 50,
    emotionalTriggers: [],
    repeatingLifePattern: "Unknown",
    escalationVector: "Unknown",
    regulationNeeds: [],
    environmentalPressureSources: [],
    identityThreats: [],
    hiddenNeeds: [],
    dominantDefenseMechanisms: [],
    likelyFailurePoint: "Unknown",
    breakthroughPotential: "Unknown",
    socialAtmosphere: "Unknown",
    narrativeTensionCurve: "Unknown",
    activePolarities: []
  };
}

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

const CreateNativityChartSchema = z.object({
  name: z.string().min(1, "Chart name required"),
  description: z.string().optional(),
  birthDateTime: z.date(),
  timezone: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationName: z.string().optional(),
  coordinateSystem: z.enum(["SIDEREAL", "TROPICAL"]).default("SIDEREAL"),
  timeResolution: z.enum(["MINUTE", "SECOND", "EVENT_BASED"]).default("MINUTE"),
});

type CreateNativityChartInput = z.infer<typeof CreateNativityChartSchema>;

// ============================================================================
// TRPC ROUTER
// ============================================================================

export const nativityRouter = createTRPCRouter({
  /**
   * Get all nativity charts for current user
   */
  getCharts: protectedProcedure.query(async ({ ctx }) => {
    return db.nativityChart.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        birthDateTime: true,
        birthTimestamp: true,
        latitude: true,
        longitude: true,
        locationName: true,
        coordinateSystem: true,
        createdAt: true,
      },
      orderBy: { birthTimestamp: "desc" },
    });
  }),

  /**
   * Get single chart by ID with full state
   */
  getChartById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.id },
        include: {
          ephemerisData: {
            include: { planets: true },
          },
          geometryIndex: {
            include: { angularDistances: true },
          },
          planetaryProfiles: {
            include: {
              aspectsAsP1: true,
              aspectsAsP2: true,
            },
          },
          aspects: true,
          stateVectors: {
            orderBy: { timestamp: "desc" },
            take: 10,
          },
        },
      });

      if (!chart || chart.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return chart;
    }),

  createChart: protectedProcedure
    .input(CreateNativityChartSchema)
    .mutation(async ({ ctx, input }) => {
      const swe = await getSwissEph();

      try {
        const birthTimestamp = input.birthDateTime.getTime();
        const dateTime = new Date(input.birthDateTime);
        const year = dateTime.getUTCFullYear();
        const month = dateTime.getUTCMonth() + 1;
        const day = dateTime.getUTCDate();
        const hours =
          dateTime.getUTCHours() +
          dateTime.getUTCMinutes() / 60 +
          dateTime.getUTCSeconds() / 3600;

        const jd = swe.julday(year, month, day, hours, 1);
        const flags =
          input.coordinateSystem === "SIDEREAL"
            ? swe.SEFLG_SIDEREAL
            : swe.SEFLG_TROPIC;

        const planetsToCalc = [
          swe.SE_SUN,
          swe.SE_MOON,
          swe.SE_MERCURY,
          swe.SE_VENUS,
          swe.SE_MARS,
          swe.SE_JUPITER,
          swe.SE_SATURN,
          swe.SE_URANUS,
          swe.SE_NEPTUNE,
          swe.SE_PLUTO,
          swe.SE_MEAN_NODE,
        ];

        const planetNames = [
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
        ];

        const housesResult = swe.houses_ex(
          jd,
          flags,
          input.latitude,
          input.longitude,
          "P"
        );

        // Extract cusps and angles
        const cusps = housesResult.cusps || [];
        const ascmc = housesResult.ascmc || [];
        const ascendantLongitude = ascmc[0] || 0; // Ascendant (1st house cusp)

        // Create ephemeris snapshot with planets
        const planetDataForCreate = planetsToCalc.map((planetId, idx) => {
          const res = swe.calc_ut(jd, planetId, flags);
          const planetName = planetNames[idx]!;

          let direction = "DIRECT";
          if (res[3] < 0) direction = "RETROGRADE";

          // Calculate house using Whole Sign system (Vedic/Sidereal)
          const houseInfo = calculateWholeSignHouse(res[0], ascendantLongitude);
          const houseCusp = houseInfo.house;
          const houseDegree = houseInfo.degree;
          const houseSign = houseInfo.sign;

          return {
            planet: planetName,
            longitude: res[0],
            latitude: res[1],
            speed: res[3],
            acceleration: res[5],
            direction: res[3] > 0 ? "DIRECT" : "RETROGRADE",
            houseCusp,
            houseDegree,
            houseSign,
          };
        });

        // Create the main nativity chart first (without relations)
        const chartData: any = {
          userId: ctx.session.user.id!,
          name: input.name,
          description: input.description || "",
          birthDateTime: input.birthDateTime,
          birthTimestamp: BigInt(birthTimestamp),
          timeResolution: input.timeResolution,
          coordinateSystem: input.coordinateSystem,
          latitude: input.latitude,
          longitude: input.longitude,
          timezone: input.timezone,
          locationName: input.locationName || "",
        };

        const nativityChart = await db.nativityChart.create({
          data: chartData,
        });

        // Now create ephemeris data with the actual chart ID
        const ephemerisData = await db.ephemerisSnapshot.create({
          data: {
            nativityChartId: nativityChart.id,
            absoluteTimeIndex: BigInt(birthTimestamp),
            planets: {
              create: planetDataForCreate.map(p => ({
                ...p,
                direction: p.direction as any,
              })),
            },
          },
          include: { planets: true },
        });

        // Create geometry index with the actual chart ID
        const angularDistances = ephemerisData.planets
          .slice(0, -1)
          .flatMap((p1, i) =>
            ephemerisData.planets.slice(i + 1).map((p2) => {
              let distance = Math.abs(p1.longitude - p2.longitude);
              if (distance > 180) distance = 360 - distance;

              return {
                planet1: p1.planet,
                planet2: p2.planet,
                distance,
                speedWeighting: Math.abs(p1.speed - p2.speed),
              };
            })
          );

        const geometryIndex = await db.geometryIndex.create({
          data: {
            nativityChartId: nativityChart.id,
            angularDistances: {
              create: angularDistances.map(d => ({
                planet1: d.planet1,
                planet2: d.planet2,
                distance: d.distance,
                speedWeighting: d.speedWeighting || 0,
              })),
            },
          },
          include: { angularDistances: true },
        });

        // Detect aspects
        const detectedAspects = detectAspects(
          ephemerisData.planets as PlanetDataType[],
          input.birthDateTime
        );

        // Calculate planetary profiles
        const planetaryProfilesData = ephemerisData.planets.map((planetData) => {
          const dignity = calculatePlanetaryDignity(
            planetData.planet,
            planetData.houseSign || "ARIES",
            planetData.houseCusp || 1
          );

          // Map planet to domain
          const domainMap: Record<string, { primary: string; secondary?: string }> = {
            SUN: { primary: "Life Force" },
            MOON: { primary: "Emotion" },
            MERCURY: { primary: "Communication" },
            VENUS: { primary: "Relationships" },
            MARS: { primary: "Action" },
            JUPITER: { primary: "Expansion" },
            SATURN: { primary: "Limitation" },
            URANUS: { primary: "Innovation" },
            NEPTUNE: { primary: "Transcendence" },
            PLUTO: { primary: "Transformation" },
            MEAN_NODE: { primary: "Destiny" },
          };

          const domain = domainMap[planetData.planet] || { primary: "Unknown" };

          return {
            nativityChartId: nativityChart.id,
            planet: planetData.planet,
            dignity: dignity.dignityType,
            strength: dignity.strength,
            speed: planetData.speed,
            visibility:
              planetData.planet === "SUN" || planetData.planet === "MOON"
                ? 1.0
                : 0.7,
            housePosition: planetData.houseCusp,
            signPosition: planetData.houseSign,
            expressionBandwidth: 1.0,
            saturationLevel: 0,
            distortionFactor: 0,
            primaryDomain: domain.primary,
            secondaryDomain: domain.secondary,
          };
        });

        const planetaryProfiles = await Promise.all(
          planetaryProfilesData.map((data) =>
            db.planetaryProfile.create({ data })
          )
        );

        // Create profile ID map for aspects
        const ptProfileMap = new Map<string, { id: string }>();
        for (const profile of planetaryProfiles) {
          ptProfileMap.set(profile.planet, { id: profile.id });
        }

        // Create aspects
        await db.nativityAspect.createMany({
          data: detectedAspects.map((asp) => {
            const p1ProfileId = ptProfileMap.get(asp.planet1)?.id;
            const p2ProfileId = ptProfileMap.get(asp.planet2)?.id;
            return {
              nativityChartId: nativityChart.id,
              geometryIndexId: geometryIndex.id,
              planet1: asp.planet1,
              planet2: asp.planet2,
              aspectType: asp.aspectType,
              orbDistance: asp.orbDistance,
              isApplying: asp.isApplying,
              exactnessScore: asp.exactnessScore,
              orbStrength: asp.orbStrength,
              speedWeighting: asp.speedWeighting,
              planet1ProfileId: p1ProfileId || null,
              planet2ProfileId: p2ProfileId || null,
            };
          }),
        });

        // Update nativity chart with relations
        const finalChart = await db.nativityChart.update({
          where: { id: nativityChart.id },
          data: {
            ephemerisData: {
              connect: { id: ephemerisData.id },
            },
            geometryIndex: {
              connect: { id: geometryIndex.id },
            },
            planetaryProfiles: {
              connect: planetaryProfiles.map((p) => ({ id: p.id })),
            },
          },
          include: {
            ephemerisData: { include: { planets: true } },
            geometryIndex: { include: { angularDistances: true } },
            planetaryProfiles: true,
            aspects: true,
          },
        });

        return finalChart;
      } catch (error) {
        console.error("Nativity chart creation error:", error);
        throw new Error(
          `Failed to create nativity chart: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  /**
   * Update chart metadata
   */
  updateChart: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.id },
      });

      if (!chart || chart.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return db.nativityChart.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),

  /**
   * Delete chart
   */
  deleteChart: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.id },
      });

      if (!chart || chart.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return db.nativityChart.delete({
        where: { id: input.id },
      });
    }),

  /**
   * Generate astrological story with AI
   */
  generateStory: protectedProcedure
    .input(
      z.object({
        nativityChartId: z.string(),
        prompt: z.string().optional(),
        useTransits: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.nativityChartId },
        include: {
          ephemerisData: {
            include: { planets: true },
          },
          planetaryProfiles: true,
          aspects: true,
          geometryIndex: {
            include: { angularDistances: true },
          },
        },
      });

      if (!chart) {
        throw new Error("Chart not found");
      }

      if (chart.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Format data for story generator
      const planets = chart.ephemerisData?.planets.map((p) => ({
        planet: p.planet,
        longitude: p.longitude,
        latitude: p.latitude,
        speed: p.speed,
        direction: p.direction,
        houseCusp: 1, // Extract from data if available
        houseSign: "ARIES", // Extract from data if available
      })) ?? [];

      const aspects = chart.aspects.map((a) => ({
        planet1: a.planet1,
        planet2: a.planet2,
        aspectType: a.aspectType,
        orbDistance: a.orbDistance,
        isApplying: a.isApplying,
        exactnessScore: a.exactnessScore,
      }));

      const planetaryProfiles = chart.planetaryProfiles.map((p) => ({
        planet: p.planet,
        primaryDomain: p.primaryDomain || "",
        secondaryDomain: p.secondaryDomain,
        strength: p.strength,
        dignity: p.dignity || "Neutral",
      }));

      const storyContext: NativityContext = {
        planets,
        aspects,
        planetaryProfiles,
      };

      const generator = new StoryGenerator({
        useLocal: process.env.USE_LOCAL_LLM === 'true',
        baseUrl: process.env.LLAMA_CPP_URL || "http://localhost:8000",
        model: process.env.LLAMA_CPP_MODEL || "local-gguf-model",
        timeoutMs: process.env.LLM_TIMEOUT_MS ? parseInt(process.env.LLM_TIMEOUT_MS) : undefined,
        maxContextTokens: process.env.LLM_MAX_CONTEXT ? parseInt(process.env.LLM_MAX_CONTEXT) : 1_000_000,
      });

      const story = await generator.generateStory(
        storyContext,
        input.prompt
      );

      return { story };
    }),

  /**
   * Get chart story
   */
  getChartStory: protectedProcedure
    .input(z.object({ nativityChartId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.nativityChartId },
        select: {
          id: true,
          userId: true,
          name: true,
        },
      });

      if (!chart) {
        throw new Error("Chart not found");
      }

      if (chart.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return chart;
    }),

  /**
   * Get planets with personality and relationships
   */
  getNativityPlanets: protectedProcedure
    .input(z.object({ nativityChartId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.nativityChartId },
        include: {
          planetaryProfiles: true,
          aspects: true,
          ephemerisData: {
            include: { planets: true },
          },
        },
      });

      if (!chart) {
        throw new Error("Chart not found");
      }

      if (chart.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const personalityService = new PlanetaryPersonalityService();

      const planetPersonalities = chart.planetaryProfiles.map((profile) => {
        // Find ephemeris data for house/sign info
        const ephemerisData = chart.ephemerisData?.planets.find(
          (p) => p.planet === profile.planet,
        );

        return personalityService.buildPlanetPersonality(
          profile,
          chart.aspects,
          ephemerisData?.houseCusp || 1,
          ephemerisData?.houseSign || "ARIES",
          ephemerisData?.direction === "RETROGRADE",
          ephemerisData?.speed || 0,
        );
      });

      return {
        chartId: chart.id,
        chartName: chart.name,
        planets: planetPersonalities,
      };
    }),

  /**
   * Generate a planet avatar/summary for a single planet using the LLM
   */
  generatePlanetAvatar: protectedProcedure
    .input(z.object({ nativityChartId: z.string(), planet: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.nativityChartId },
        include: {
          planetaryProfiles: true,
          ephemerisData: { include: { planets: true } },
          aspects: true,
        },
      });

      if (!chart) throw new Error('Chart not found');
      if (chart.userId !== ctx.session.user.id) throw new Error('Unauthorized');

      const profile = chart.planetaryProfiles.find((p) => p.planet === input.planet);
      const ephemeris = chart.ephemerisData?.planets.find((p) => p.planet === input.planet);

      if (!profile) throw new Error('Planet profile not found');

      const context: NativityContext = {
        planets: chart.ephemerisData?.planets.map((p) => ({
          planet: p.planet,
          longitude: p.longitude,
          latitude: p.latitude,
          speed: p.speed,
          direction: p.direction,
          houseCusp: p.houseCusp || 1,
          houseSign: p.houseSign || 'ARIES',
        })) || [],
        aspects: chart.aspects.map((a) => ({
          planet1: a.planet1,
          planet2: a.planet2,
          aspectType: a.aspectType,
          orbDistance: a.orbDistance,
          isApplying: a.isApplying,
          exactnessScore: a.exactnessScore,
        })),
        planetaryProfiles: chart.planetaryProfiles.map((p) => ({
          planet: p.planet,
          primaryDomain: p.primaryDomain || '',
          secondaryDomain: p.secondaryDomain || undefined,
          strength: p.strength,
          dignity: p.dignity || 'Neutral',
        })),
      };

      const generator = new StoryGenerator({
        useLocal: process.env.USE_LOCAL_LLM === 'true',
        baseUrl: process.env.OLLAMA_URL || process.env.LLAMA_CPP_URL || 'http://localhost:8000',
        model: process.env.OLLAMA_MODEL || 'qwen3-coder-next:cloud',
        timeoutMs: process.env.LLM_TIMEOUT_MS ? parseInt(process.env.LLM_TIMEOUT_MS) : undefined,
        maxContextTokens: process.env.LLM_MAX_CONTEXT ? parseInt(process.env.LLM_MAX_CONTEXT) : 1_000_000,
      });

      const prompt = `Create a concise JSON avatar for the planet ${input.planet} in this chart. Return only valid JSON with keys: name, archetype, shortBio, visualDescription, colorPalette (array), suggestedGreeting, keywords (array). Use the planetary profile and aspects to craft the content.`;

      const avatarText = await generator.generateStory(context, prompt);

      // We return the raw text so frontend can parse; often the LLM will return JSON
      return { planet: input.planet, avatar: avatarText };
    }),

  /**
   * Generate current story with transits and theatrical narration
   */
  generateCurrentStory: protectedProcedure
    .input(
      z.object({
        nativityChartId: z.string(),
        userLatitude: z.number(),
        userLongitude: z.number(),
        userTimeZone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.nativityChartId },
        include: {
          planetaryProfiles: true,
          aspects: true,
          ephemerisData: {
            include: { planets: true },
          },
        },
      });

      if (!chart) throw new Error('Chart not found');
      if (chart.userId !== ctx.session.user.id) throw new Error('Unauthorized');

      const now = new Date();

      // Delete any existing current story for today
      await db.currentStory.deleteMany({
        where: {
          nativityChartId: input.nativityChartId,
          expiresAt: { gt: now },
        },
      });
      // Calculate transits
      const transitCalc = new TransitCalculator();

      console.log(chalk.bgBlueBright('\n...................  INITIALISING Planetary_Tithis ...................'))
      const natalPlanets = chart.ephemerisData?.planets.map((p) => ({
        planet: p.planet,
        longitude: p.longitude,
      })) ?? [];
      console.log(chalk.bgGreen('  Calculated Natal Data ✓ '))
      const transitSnapshot = await transitCalc.getTransitSnapshot(
        now,
        input.userLatitude,
        input.userLongitude,
      );
      console.log(chalk.bgGreen(' Calculated Transit Data ✓ ', transitSnapshot[0]))

      // console.log(chalk.bgRed(' Failed To calcaute Planetary_Tithis '))


      const currentScenes = await transitCalc.calculatePlanetaryTithis(
        natalPlanets,
        transitSnapshot.planets,
      );
      console.log(chalk.bgGreen('\n  Calculated Planetary_Tithis ✓ '))

      // Generate collective story state
      const storyState = await transitCalc.generateCollectiveStoryState(currentScenes);
      console.log(chalk.bgGreen('  Generated Collective Story State ✓ '))

      // Generate main narrative with LLM
      console.log(chalk.yellow('\n[NATIVITY_STORY] Generating scenario outline for chart:', chart.name))

      console.log('\n[NATIVITY_STORY] Generating scenario outline for chart:', chart.name);
      // console.log('[NATIVITY_STORY] Current scenes count:', currentScenes[0]);
      // console.log('[NATIVITY_STORY] Theatre scenes count:', theatreScenes[0]);

      let scenarioOutline = '';
      try {
        scenarioOutline = await generateScenarioOutline(currentScenes, chart);

        console.log(chalk.green('[NATIVITY_STORY] ✓ Scenario outline generated successfully'));
      } catch (llmError) {
        console.error(chalk.red('[NATIVITY_STORY] ✗ LLM generation failed - NO FALLBACK USED'));
        console.error(chalk.red('[NATIVITY_STORY] Error details:'), llmError);
        throw llmError;
      }

      // Calculate overall intensity
      const overallIntensity =
        currentScenes.reduce((sum, s) => sum + s.intensity, 0) / (currentScenes.length || 1);

      // Save to database
      const currentStory = await db.currentStory.create({
        data: {
          nativityChartId: input.nativityChartId,
          transitDate: now,
          userLatitude: input.userLatitude,
          userLongitude: input.userLongitude,
          userTimeZone: input.userTimeZone,
          mainNarrative: '',
          overallIntensity,
          themes: [scenarioOutline],
          storyState: JSON.stringify(storyState),
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          scenes: {
            create: currentScenes.map((scene) => {
              const natalPlanet = chart.ephemerisData?.planets.find((p) => p.planet === scene.planet);
              const sign = natalPlanet?.houseSign || [
                'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO',
                'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES',
              ][Math.floor(((natalPlanet?.longitude || 0) % 360 + 360) % 360 / 30)];
              const house = natalPlanet?.houseCusp || 1;
              return {
                planet: scene.planet,
                sign,
                house,
                natalLongitude: scene.natalPosition,
                currentLongitude: scene.currentPosition,
                movementDegrees: scene.movementDegrees,
                intensity: scene.intensity,
                dominantPressure: scene.externalConflict || 'initial pressure',
                behavioralPattern: scene.behavioralPattern,
                externalConflict: scene.externalConflict,
                relationshipEffect: scene.relationshipEffect,
                pressureDirection: scene.pressureDirection,
                collapseRisk: scene.intensity > 70 ? 72 : 50,
                momentumDirection: 'stable',
                storyFunction: scene.theme,
                activeAspects: scene.aspectsActive.map((a) => JSON.stringify(a)),
                sceneAttributes: null,
              };
            }),
          },
        },
        include: {
          scenes: true,
        },
      });

      return {
        storyId: currentStory.id,
        story: currentStory,
        scenarioOutline,
        message: 'Current story generated successfully',
        isNew: true,
      };
    }),

  /**
   * Generate main narrative for an existing current story
   */
  generateMainNarrative: protectedProcedure
    .input(z.object({ currentStoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentStory = await db.currentStory.findUnique({
        where: { id: input.currentStoryId },
        include: {
          nativityChart: {
            include: {
              planetaryProfiles: true,
              aspects: true,
              ephemerisData: { include: { planets: true } }
            }
          },
          scenes: true,
        }
      });

      if (!currentStory || currentStory.nativityChart.userId !== ctx.session.user.id) throw new Error('Unauthorized');

      const chart = currentStory.nativityChart;

      const scenes = currentStory.scenes.map(s => ({
        planet: s.planet,
        currentPosition: s.currentLongitude,
        intensity: s.intensity,
        theme: s.theme,
        aspectsActive: s.activeAspects.map((a) => safeJSONParse(a, a)),
      }));

      const scenarioOutline = currentStory.themes[0] || '';

      const mainNarrative = await generateSceneScriptFromScenarios(scenarioOutline, scenes, chart);

      await db.currentStory.update({
        where: { id: input.currentStoryId },
        data: { mainNarrative }
      });

      return { mainNarrative };
    }),

  /**
   * Get current story by ID
   */
  getCurrentStory: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const story = await db.currentStory.findUnique({
        where: { id: input.storyId },
        include: {
          nativityChart: {
            select: { id: true, name: true, userId: true },
          },
          scenes: true,
        },
      });

      if (!story) throw new Error('Story not found');
      if (story.nativityChart.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      return story;
    }),

  /**
   * Compile deterministic visual prompts for a saved story
   */
  getCurrentStoryPrompts: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const story = await db.currentStory.findUnique({
        where: { id: input.storyId },
        include: {
          nativityChart: { select: { userId: true } },
          scenes: true,
        },
      });

      if (!story) throw new Error('Story not found');
      if (story.nativityChart.userId !== ctx.session.user.id) throw new Error('Unauthorized');

      const prompts = story.scenes.map((scene) => {
        const aspectText = scene.activeAspects
          .map((value) => {
            try {
              return JSON.parse(value)?.aspectType ?? value;
            } catch {
              return value;
            }
          })
          .filter(Boolean)
          .join(', ');

        const promptInput: PromptInput = {
          planet: scene.planet.toUpperCase() as PromptInput['planet'],
          phase: scene.theme || 'transitional moment',
          aspect: aspectText || 'dynamic alignment',
          colorPalette: ['muted amber', 'charcoal', 'soft gold'],
          dominantMood: scene.theme || 'charged atmosphere',
          plotTwist: scene.plotTwist || 'an unexpected turn shifts the scene',
          setting: 'an atmospheric cosmic stage',
        };

        return {
          sceneId: scene.id,
          planet: scene.planet,
          prompt: buildComicPrompt(promptInput),
        };
      });

      return {
        storyId: story.id,
        prompts,
      };
    }),

  /**
   * Get all current stories for a chart
   */
  getCurrentStories: protectedProcedure
    .input(z.object({ nativityChartId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.nativityChartId },
        select: { userId: true },
      });

      if (!chart) throw new Error('Chart not found');
      if (chart.userId !== ctx.session.user.id) throw new Error('Unauthorized');

      return await db.currentStory.findMany({
        where: { nativityChartId: input.nativityChartId },
        include: {
          scenes: true,
        },
        orderBy: { transitDate: 'desc' },
        take: 7,
      });
    }),

  /**
   * Recalculate planetary scenes using vedic astrology from astro-data
   */
  recalculatePlanetaryScenes: protectedProcedure
    .input(z.object({ currentStoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentStory = await db.currentStory.findUnique({
        where: { id: input.currentStoryId },
        include: {
          nativityChart: {
            include: {
              planetaryProfiles: true,
              ephemerisData: { include: { planets: true } },
              aspects: true,
            },
          },
          scenes: true,
        },
      });

      if (!currentStory) throw new Error('Story not found');
      if (currentStory.nativityChart.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      console.log(chalk.bgMagentaBright('\n═══════════════════════════════════════════════════════════'));
      console.log(chalk.bgMagentaBright('  RECALCULATING PLANETARY SCENES FROM VEDIC ASTROLOGY DATA  '));
      console.log(chalk.bgMagentaBright('═══════════════════════════════════════════════════════════\n'));

      const chart = currentStory.nativityChart;
      const transitCalc = new TransitCalculator();

      // Step 1: Load natal data
      console.log(chalk.cyan('\n[STEP 1] Loading Natal Planetary Data...'));
      const natalPlanets = chart.ephemerisData?.planets.map((p) => ({
        planet: p.planet,
        longitude: p.longitude,
      })) ?? [];
      console.log(chalk.green(`  ✓ Loaded ${natalPlanets.length} natal planets`));
      natalPlanets.forEach((p) => {
        console.log(chalk.gray(`    • ${p.planet}: ${p.longitude.toFixed(2)}°`));
      });

      // Step 2: Get transit snapshot
      console.log(chalk.cyan('\n[STEP 2] Calculating Current Transit Data...'));
      const now = new Date();
      const transitSnapshot = await transitCalc.getTransitSnapshot(
        now,
        currentStory.userLatitude,
        currentStory.userLongitude,
      );
      console.log(chalk.green(`  ✓ Transit snapshot calculated for ${now.toLocaleString()}`));
      console.log(chalk.gray(`    Location: ${currentStory.userLatitude.toFixed(2)}°N, ${currentStory.userLongitude.toFixed(2)}°E`));

      // Step 3: Calculate planetary positions and Tithis
      console.log(chalk.cyan('\n[STEP 3] Building Personality from Vedic Astrology Basics...'));
      const newScenes = await transitCalc.calculatePlanetaryTithis(
        natalPlanets,
        transitSnapshot.planets,
      );
      console.log(chalk.green(`  ✓ Calculated ${newScenes.length} planetary scenes`));
      newScenes.forEach((scene) => {
        console.log(chalk.gray(`    • ${scene.planet}`));
        console.log(chalk.gray(`      Theme: ${scene.theme}`));
        console.log(chalk.gray(`      Intensity: ${scene.intensity}% | Movement: ${scene.movementDegrees.toFixed(2)}°`));
        console.log(chalk.gray(`      Behavioral Pattern: ${scene.behavioralPattern}`));
      });

      // Step 4: Generate meaningful story state
      console.log(chalk.cyan('\n[STEP 4] Generating Meaningful Story State...'));
      const updatedStoryState = await transitCalc.generateCollectiveStoryState(newScenes);
      console.log(chalk.green('  ✓ Story state generated with rich behavioral analysis'));
      console.log(chalk.gray(`    Dominant Pressure: ${updatedStoryState.dominantPressure}`));
      console.log(chalk.gray(`    Emotional Climate: ${updatedStoryState.emotionalClimate}`));
      console.log(chalk.gray(`    Stability Index: ${updatedStoryState.stabilityIndex}/100`));

      // Step 5: Synthesize scene attributes for each planet
      console.log(chalk.cyan('\n[STEP 5] Synthesizing Scene Attributes from Astro-Data...'));
      const scenesWithAttributes = await Promise.all(
        newScenes.map(async (scene) => {
          const natalPlanet = chart.ephemerisData?.planets.find((p) => p.planet === scene.planet);
          if (!natalPlanet) return { ...scene, sceneAttributes: null };

          const planetProfile = chart.planetaryProfiles.find((p) => p.planet === scene.planet);
          const activeAspects = Array.isArray(scene.aspectsActive) ? scene.aspectsActive : [];

          const sign = natalPlanet.houseSign || [
            'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO',
            'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES',
          ][Math.floor(((natalPlanet.longitude % 360) + 360) % 360 / 30)];
          const house = natalPlanet.houseCusp || 1;

          const attributes = await synthesizeSceneAttributes({
            planet: scene.planet,
            sign,
            house,
            natalLongitude: natalPlanet.longitude,
            currentLongitude: scene.currentPosition,
            movementDegrees: scene.movementDegrees,
            intensity: Math.round(scene.intensity),
            planetProfile,
            activeAspects: activeAspects.map((aspect) => ({ aspectType: aspect.aspectType })),
          });
          console.log(chalk.bgRed(`    • ${scene.planet}: Synthesized attributes - Pressure: ${attributes.pressureState?.dominantPressure}, Behavioral Pattern: ${attributes.behavioralState?.behavioralPatterns?.[0] || attributes.behavioralState?.primaryBehavior}, External Conflict: ${attributes.situationalState?.sceneHooks?.[0]}, Relationship Effect: ${attributes.relationalState?.relationshipDynamics?.[0]}`));
          return { ...scene, sceneAttributes: attributes, sign, house };
        })
      );
      console.log(chalk.green('  ✓ Scene attributes synthesized for all planets'));

      // Step 6: Recalculate overall intensity
      console.log(chalk.cyan('\n[STEP 6] Recalculating Overall Intensity...'));
      const newOverallIntensity =
        newScenes.reduce((sum, s) => sum + s.intensity, 0) / (newScenes.length || 1);
      console.log(chalk.green(`  ✓ Overall intensity recalculated: ${newOverallIntensity.toFixed(1)}%`));

      // Step 7: Update database with new scenes
      console.log(chalk.cyan('\n[STEP 7] Updating Database...'));

      // Delete old scenes
      await db.planetaryScene.deleteMany({
        where: { currentStoryId: input.currentStoryId },
      });
      console.log(chalk.yellow(`  ⊘ Deleted ${currentStory.scenes.length} old scenes`));

      // Create new scenes
      const createdScenes = await db.planetaryScene.createMany({
        data: scenesWithAttributes.map((scene) => {
          const attrs = scene.sceneAttributes;
          return {
            currentStoryId: input.currentStoryId,
            planet: scene.planet,
            sign: scene.sign,
            house: scene.house,
            natalLongitude: scene.natalPosition,
            currentLongitude: scene.currentPosition,
            movementDegrees: scene.movementDegrees,
            intensity: scene.intensity,
            dominantPressure: attrs.pressureState?.dominantPressure,
            behavioralPattern: attrs.behavioralState?.behavioralPatterns?.[0] || attrs.behavioralState?.primaryBehavior,
            externalConflict: attrs.situationalState?.sceneHooks?.[0],
            relationshipEffect: attrs.relationalState?.relationshipDynamics?.[0],
            pressureDirection: attrs.pressureState?.pressureDirection,
            collapseRisk: attrs.pressureState?.collapseRisk,
            momentumDirection: attrs.behavioralState?.behavioralMomentum || attrs.metaState?.adaptationPressure,
            storyFunction: attrs.narrativeState?.storyFunction,
            activeAspects: scene.aspectsActive.map((a) => JSON.stringify(a)),
            sceneAttributes: scene.sceneAttributes,
          };
        }),
      });
      console.log(chalk.green(`  ✓ Created ${newScenes.length} new scenes`));

      // Update story with new data
      const updatedStory = await db.currentStory.update({
        where: { id: input.currentStoryId },
        data: {
          overallIntensity: newOverallIntensity,
          storyState: JSON.stringify(updatedStoryState),
        },
        include: { scenes: true },
      });
      console.log(chalk.green('  ✓ Story updated in database'));

      console.log(chalk.bgGreen('\n═══════════════════════════════════════════════════════════'));
      console.log(chalk.bgGreen('  PLANETARY SCENES RECALCULATION COMPLETE ✓               '));
      console.log(chalk.bgGreen('═══════════════════════════════════════════════════════════\n'));

      return {
        message: 'Planetary scenes recalculated successfully',
        updatedSceneCount: newScenes.length,
        newOverallIntensity,
      };
    }),

  /** 
   * Recalculate a single planetary scene per planet
   */
  recalculateSingleScene: protectedProcedure
    .input(z.object({ currentStoryId: z.string(), sceneId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ===============================fetching current story =================================================================
      const currentStory = await db.currentStory.findUnique({
        where: { id: input.currentStoryId },
        include: {
          nativityChart: {
            include: {
              planetaryProfiles: true,
              ephemerisData: { include: { planets: true } },
              aspects: true,
            },
          },
          scenes: true,
        },
      });
      console.log(chalk.bgCyan(`  currentStory  `));
      console.log(currentStory?.planetaryProfiles)

      // =============================== Error Handling  =================================================================
      if (!currentStory) throw new Error('Story not found');
      if (currentStory.nativityChart.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }
      // =============================== extracting scenes  =================================================================

      const sceneToUpdate = currentStory.scenes.find((s) => s.id === input.sceneId);
      if (!sceneToUpdate) throw new Error('Scene not found');

      console.log(chalk.bgCyan('\n═══════════════════════════════════════════════════════════'));
      console.log(chalk.bgCyan(`  RECALCULATING SINGLE PLANET: ${sceneToUpdate.planet.toUpperCase()}  `));
      console.log(chalk.bgCyan('═══════════════════════════════════════════════════════════\n'));

      const chart = currentStory.nativityChart;
      const transitCalc = new TransitCalculator();

      // Step 1: Get natal position for this planet
      console.log(chalk.cyan('\n[STEP 1] Loading Natal Data for ' + sceneToUpdate.planet));
      const natalPlanet = chart.ephemerisData?.planets.find((p) => p.planet === sceneToUpdate.planet);
      if (!natalPlanet) throw new Error(`Natal data not found for ${sceneToUpdate.planet}`);
      console.log(chalk.green(`  ✓ Natal position: ${natalPlanet.longitude.toFixed(2)}°`));

      // Step 2: Get current transit position
      console.log(chalk.cyan('\n[STEP 2] Calculating Current Transit Position'));
      const now = new Date();
      const transitSnapshot = await transitCalc.getTransitSnapshot(
        now,
        currentStory.userLatitude,
        currentStory.userLongitude,
      );
      console.log(chalk.green(`  ✓ Transit snapshot calculated`));

      const transitPlanet = transitSnapshot.planets.find((p) => p.planet === sceneToUpdate.planet);
      if (!transitPlanet) throw new Error(`Transit data not found for ${sceneToUpdate.planet}`);
      console.log(chalk.gray(`    Transit position: ${transitPlanet.longitude.toFixed(2)}°`));

      // Step 3: Calculate aspects and behavioral scene for this planet
      console.log(chalk.cyan('\n[STEP 3] Analyzing Vedic Personality for ' + sceneToUpdate.planet));
      const planetScenes = await transitCalc.calculatePlanetaryTithis(
        [{ planet: sceneToUpdate.planet, longitude: natalPlanet.longitude }],
        [transitPlanet],
      );

      if (planetScenes.length === 0) throw new Error('Failed to calculate planet scene');
      const updatedScene = planetScenes[0];

      console.log(chalk.green('  ✓ Scene recalculated with updated personality'));
      console.log(chalk.gray(`    Theme: ${updatedScene.theme}`));
      console.log(chalk.gray(`    Intensity: ${updatedScene.intensity}%`));
      console.log(chalk.gray(`    Behavioral Pattern: ${updatedScene.behavioralPattern}`));
      console.log(chalk.gray(`    External Conflict: ${updatedScene.externalConflict}`));
      console.log(chalk.gray(`    Likely Mistake: ${updatedScene.likelyMistake}`));

      const planetProfile = chart.planetaryProfiles.find((p) => p.planet === sceneToUpdate.planet);
      const planetAspects = chart.aspects.filter(
        (a) => a.planet1 === sceneToUpdate.planet || a.planet2 === sceneToUpdate.planet,
      );
      const activeAspects = Array.isArray(updatedScene.aspectsActive) ? updatedScene.aspectsActive : [];
      const movementDegrees = typeof updatedScene.movementDegrees === 'number' ? updatedScene.movementDegrees : 0;

      const sign = natalPlanet.houseSign || [
        'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO',
        'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES',
      ][Math.floor(((natalPlanet.longitude % 360) + 360) % 360 / 30)];
      const house = natalPlanet.houseCusp || 1;

      console.log(chalk.cyan('\n[STEP 4] Synthesizing planet scene attributes from astro-data'));
      const sceneAttributes = await synthesizeSceneAttributes({
        planet: sceneToUpdate.planet,
        sign,
        house,
        natalLongitude: natalPlanet.longitude,
        currentLongitude: transitPlanet.longitude,
        movementDegrees,
        intensity: Math.round(updatedScene.intensity),
        planetProfile,
        activeAspects: activeAspects.map((aspect) => ({ aspectType: aspect.aspectType })),
      });
      // Step 5: Update database
      console.log(chalk.cyan('\n[STEP 5] Updating Database'));
      const updatedPlanetaryScene = await db.planetaryScene.update({
        where: { id: input.sceneId },
        data: {
          planet: sceneToUpdate.planet,
          sign,
          house,
          natalLongitude: natalPlanet.longitude,
          currentLongitude: transitPlanet.longitude,
          movementDegrees,
          intensity: updatedScene.intensity,
          dominantPressure: sceneAttributes.pressureState?.dominantPressure,
          behavioralPattern: sceneAttributes.behavioralState?.behavioralPatterns?.[0] || sceneAttributes.behavioralState?.primaryBehavior,
          externalConflict: sceneAttributes.situationalState?.sceneHooks?.[0],
          relationshipEffect: sceneAttributes.relationalState?.relationshipDynamics?.[0],
          pressureDirection: sceneAttributes.pressureState?.pressureDirection,
          collapseRisk: sceneAttributes.pressureState?.collapseRisk,
          momentumDirection: sceneAttributes.behavioralState?.behavioralMomentum || sceneAttributes.metaState?.adaptationPressure,
          storyFunction: sceneAttributes.narrativeState?.storyFunction,
          activeAspects: updatedScene.aspectsActive.map((a) => JSON.stringify(a)),
          sceneAttributes: sceneAttributes,
        },
      });
      console.log(chalk.green('  ✓ Scene updated in database'));

      // Step 5: Recalculate overall story intensity
      console.log(chalk.cyan('\n[STEP 5] Updating Overall Story Intensity'));
      const updatedScenes = await db.planetaryScene.findMany({
        where: { currentStoryId: input.currentStoryId },
      });
      const newOverallIntensity =
        updatedScenes.reduce((sum, s) => sum + s.intensity, 0) / (updatedScenes.length || 1);

      await db.currentStory.update({
        where: { id: input.currentStoryId },
        data: { overallIntensity: newOverallIntensity },
      });
      console.log(chalk.green(`  ✓ Overall intensity updated: ${newOverallIntensity.toFixed(1)}%`));

      console.log(chalk.bgGreen('\n═══════════════════════════════════════════════════════════'));
      console.log(chalk.bgGreen(`  ${sceneToUpdate.planet.toUpperCase()} RECALCULATION COMPLETE ✓                   `));
      console.log(chalk.bgGreen('═══════════════════════════════════════════════════════════\n'));

      return {
        message: `${sceneToUpdate.planet} scene recalculated successfully`,
        updatedScene: updatedPlanetaryScene,
        sceneAttributes,
        newOverallIntensity,
      };
    }),

  /**
   * Refresh only the current story's storyState from existing planetary scenes
   */
  refreshCurrentStoryState: protectedProcedure
    .input(z.object({ currentStoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentStory = await db.currentStory.findUnique({
        where: { id: input.currentStoryId },
        include: {
          nativityChart: { select: { userId: true } },
          scenes: true,
        },
      });

      if (!currentStory) throw new Error('Story not found');
      if (currentStory.nativityChart.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      const trimmedScenes = currentStory.scenes.map((scene) => ({
        behavioralPattern: scene.behavioralPattern,
        externalConflict: scene.externalConflict,
        likelyMistake: scene.likelyMistake,
        relationshipEffect: scene.relationshipEffect,
        pressureDirection: scene.pressureDirection,
        intensity: scene.intensity,
      }));
      console.log(chalk.bgBlueBright('\n...................  REFRESHING Story State ...................'))
      const storyState = await buildStoryStateSummary(trimmedScenes);

      await db.currentStory.update({
        where: { id: input.currentStoryId },
        data: { storyState: JSON.stringify(storyState) },
      });

      return { storyState: JSON.stringify(storyState) };
    }),

  /**
   * Get planetary POV for Rashoff Theatre
   */
  getPlanetaryPOV: protectedProcedure
    .input(
      z.object({
        storyId: z.string(),
        planet: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const story = await db.currentStory.findUnique({
        where: { id: input.storyId },
        include: {
          nativityChart: { select: { userId: true } },
          scenes: { where: { planet: input.planet } },
        },
      });

      if (!story) throw new Error('Story not found');
      if (story.nativityChart.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      return {
        scene: story.scenes[0],
      };
    }),

  /**
   * Interact with a planet entity in the Game of Life
   */
  interactWithPlanetEntity: protectedProcedure
    .input(
      z.object({
        nativityChartId: z.string(),
        planet: z.string(),
        userMessage: z.string(),
        currentEnergy: z.number(),
        actionType: z.enum(['message', 'boost', 'heal', 'challenge']).default('message'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.nativityChartId },
        include: {
          planetaryProfiles: true,
          aspects: true,
        },
      });

      if (!chart) throw new Error('Chart not found');
      if (chart.userId !== ctx.session.user.id) throw new Error('Unauthorized');

      const profile = chart.planetaryProfiles.find((p) => p.planet === input.planet);
      if (!profile) throw new Error('Planet not found');

      // Build context-aware prompt based on action type
      const actionContext: Record<string, string> = {
        message: `The user is having a friendly conversation with ${input.planet}.Respond as this planetary archetype.`,
        boost: `The user is sending positive energy to ${input.planet}.React with joy and renewed vigor.`,
        heal: `The user is initiating healing with ${input.planet}. Acknowledge past wounds and show transformation.`,
        challenge: `The user is challenging ${input.planet} to grow.Respond with determination and revelation of deeper potential.`,
      };

      const prompt = `
You are ${input.planet}, the ${profile.primaryDomain} archetype in this person's natal chart.
Current Energy Level: ${input.currentEnergy}%
  User Action: ${input.actionType}

${actionContext[input.actionType]}

Respond in character as ${input.planet}. Keep response short(2 - 3 sentences max).
Be authentic, emotional, and reveal something about your nature or your relationship with the user.

User said: "${input.userMessage}"
`;

      const generator = new StoryGenerator({
        useLocal: process.env.USE_LOCAL_LLM === 'true',
        baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
        model: process.env.OLLAMA_MODEL || 'qwen3-coder-next:cloud',
        timeoutMs: process.env.LLM_TIMEOUT_MS ? parseInt(process.env.LLM_TIMEOUT_MS) : undefined,
        maxContextTokens: process.env.LLM_MAX_CONTEXT ? parseInt(process.env.LLM_MAX_CONTEXT) : 1_000_000,
      });

      const response = await generator.generateStory(
        { planets: [], aspects: [], planetaryProfiles: [] },
        prompt
      );

      // Calculate energy shift based on action
      const energyShifts: Record<string, number> = {
        message: Math.random() * 5,
        boost: 15 + Math.random() * 10,
        heal: 20 + Math.random() * 10,
        challenge: -10 + Math.random() * 15,
      };

      const energyShift = energyShifts[input.actionType] || 0;

      // Determine mood based on action and energy
      const newEnergy = Math.min(100, Math.max(0, input.currentEnergy + energyShift));
      const mood = getMoodFromEnergy(newEnergy, input.actionType);

      return {
        response: response.trim(),
        energyShift,
        newEnergy,
        mood,
        actionType: input.actionType,
      };
    }),

  /**
   * Get full natal chart data including planets and aspects
   * Used for personality-based conversations
   * House data is included in PlanetData (houseCusp, houseSign, houseDegree)
   */
  getNativityChart: protectedProcedure
    .input(z.object({ nativityChartId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.nativityChartId },
        include: {
          planetaryProfiles: true,
          aspects: true,
          ephemerisData: {
            include: {
              planets: true,
            },
          },
        },
      });

      if (!chart) throw new Error('Chart not found');
      if (chart.userId !== ctx.session.user.id) throw new Error('Unauthorized');

      return {
        chartId: chart.id,
        chartName: chart.name,
        planets: chart.ephemerisData?.planets || [],
        aspects: chart.aspects,
        planetaryProfiles: chart.planetaryProfiles,
      };
    }),

  /**
   * Chat with a planet using its natal chart context
   * LLM generates responses in the planet's voice based on chart data
   */
  chatWithPlanet: protectedProcedure
    .input(
      z.object({
        chartContext: z.string(), // JSON stringified PlanetContext
        userMessage: z.string(),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(['user', 'planet']),
              content: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const context = safeJSONParse(input.chartContext, null as any);
        if (!context) {
          throw new Error('Invalid chart context');
        }

        // Build system prompt from chart context
        const systemPrompt = `You are the archetypal essence of ${context.planet}, positioned in ${context.zodiacSign} within the ${context.houseCusp}th House(${context.houseSign})${context.isRetrograde ? ' (currently retrograde)' : ''}.

YOUR NATURE:
• Planetary Archetype: ${context.planet}
• Zodiac Expression: ${context.zodiacSign}
• House Placement: ${context.houseCusp}th House
• Dignity: ${getDignityDescription(context)}
• Motion: ${Math.abs(context.speed).toFixed(2)}°/day ${context.isRetrograde ? '(retrograde)' : '(direct)'}

YOUR RELATIONSHIPS:
${context.aspectsWithOthers.map((a: any) => `• ${a.aspectType} with ${a.planet} (strength: ${Math.round(a.strength * 100)}%)`).join('\n')}

INTERACTION GUIDELINES:
• Speak from this planet's archetypal perspective in this native's birth chart
• Use poetic and astrological language
• Reference your specific placement and aspects when discussing themes
• Be wise, introspective, and authentic
• Maintain character as this planetary principle
• Respond conversationally as if this is genuine dialog with a principle within their psyche`;

        // Build a compact nativity context suitable for the story generator / LLM
        const nativityContext: NativityContext = {
          planets: [
            {
              planet: context.planet,
              longitude: context.longitude ?? 0,
              latitude: context.latitude ?? null,
              speed: context.speed ?? 0,
              direction: context.isRetrograde ? 'Retrograde' : 'Direct',
              houseCusp: context.houseCusp ?? 1,
              houseSign: context.houseSign || context.zodiacSign || '',
            },
          ],
          aspects: (context.aspectsWithOthers || []).map((a: any) => ({
            planet1: context.planet,
            planet2: a.planet,
            aspectType: a.aspectType,
            orbDistance: a.orb ?? 0,
            isApplying: a.isApplying ?? false,
            exactnessScore: a.strength ?? 0,
          })),
          planetaryProfiles: [],
        };

        // Include conversation history in the prompt to provide continuity
        const historyText = (input.conversationHistory || [])
          .map((h) => `${h.role === 'user' ? 'User' : context.planet}: ${h.content} `)
          .join('\n');

        const userPrompt = input.userMessage === 'greet'
          ? `Greet the user as ${context.planet} in ${context.zodiacSign} (house ${context.houseCusp}). Keep it short and in -character.`
          : `${input.userMessage} \n\nConversation history: \n${historyText} `;

        const generator = new StoryGenerator({
          useLocal: process.env.USE_LOCAL_LLM === 'true',
          baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
          model: process.env.OLLAMA_MODEL || 'qwen3-coder-next:cloud',
          timeoutMs: process.env.LLM_TIMEOUT_MS ? parseInt(process.env.LLM_TIMEOUT_MS) : undefined,
          maxContextTokens: process.env.LLM_MAX_CONTEXT ? parseInt(process.env.LLM_MAX_CONTEXT) : 1_000_000,
        });

        // Generate a single-turn response using the configured LLM
        const reply = await generator.generateStory(nativityContext, userPrompt);

        return {
          message: reply,
          planet: context.planet,
        };
      } catch (error) {
        console.error('Error chatting with planet:', error);
        throw new Error('Failed to connect with planetary energy');
      }
    }),

  /**
   * Recalculate current story themes by synthesizing vector states from all planet scenes
   */
  recalculateCurrentStoryThemes: protectedProcedure
    .input(z.object({ currentStoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentStory = await db.currentStory.findUnique({
        where: { id: input.currentStoryId },
        include: {
          nativityChart: { select: { userId: true } },
          scenes: true,
        },
      });

      if (!currentStory) throw new Error('Story not found');
      if (currentStory.nativityChart.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      console.log(chalk.bgMagenta('\n═══════════════════════════════════════════════════════════'));
      console.log(chalk.bgMagenta('  RECALCULATING CURRENT STORY THEMES FROM VECTOR SYNTHESIS  '));
      console.log(chalk.bgMagenta('═══════════════════════════════════════════════════════════\n'));

      // Extract vector states from all scenes
      const vectorStates = currentStory.scenes
        .map(scene => scene.sceneAttributes?.vectorState)
        .filter(Boolean) as Array<Record<string, number>>;

      if (vectorStates.length === 0) {
        throw new Error('No vector data available in scenes');
      }

      console.log(chalk.cyan(`\n[STEP 1] Extracted ${vectorStates.length} vector states from planet scenes`));

      // Aggregate vectors (average across planets)
      const aggregatedVectors: Record<string, number> = {};
      const vectorKeys = Object.keys(vectorStates[0]);

      for (const key of vectorKeys) {
        const values = vectorStates.map(v => v[key]).filter(v => typeof v === 'number');
        aggregatedVectors[key] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      }

      console.log(chalk.green('  ✓ Aggregated psychological vectors:'));
      Object.entries(aggregatedVectors).forEach(([key, value]) => {
        console.log(chalk.gray(`    ${key}: ${value.toFixed(2)}`));
      });

      // Generate theme interpretation using LLM
      console.log(chalk.cyan('\n[STEP 2] Generating theme interpretation from vectors'));

      const vectorSummary = Object.entries(aggregatedVectors)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value.toFixed(2)}`)
        .join(', ');

      const prompt = `
You are an expert astrological psychologist. Based on the following aggregated psychological vectors from a person's current planetary transits, generate a concise, meaningful theme interpretation for their life story right now.

Vectors: ${vectorSummary}

Provide a single, coherent theme statement (2-3 sentences) that captures the essence of their current psychological state and life direction. Make it poetic yet practical, focusing on growth opportunities and challenges.

Theme:`;

      const provider = createProvider({
        provider: process.env.USE_LOCAL_LLM === 'true' ? 'local' : 'groq',
        baseUrl: process.env.USE_LOCAL_LLM === 'true'
          ? process.env.LLAMA_CPP_URL || 'http://localhost:8000'
          : undefined,
        model: process.env.USE_LOCAL_LLM === 'true'
          ? process.env.LLAMA_CPP_MODEL || 'local-gguf-model'
          : process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
      });

      const response = await provider.generate({
        system: 'You are an expert astrological psychologist. Output a concise theme statement only, without extra formatting.',
        user: prompt,
      });

      const themeInterpretation = response.text.trim();

      console.log(chalk.green('  ✓ Generated theme interpretation'));
      console.log(chalk.gray(`    ${themeInterpretation}`));

      // Update the story with new themes
      console.log(chalk.cyan('\n[STEP 3] Updating database'));
      const updatedStory = await db.currentStory.update({
        where: { id: input.currentStoryId },
        data: { themes: [themeInterpretation.trim()] },
      });

      console.log(chalk.bgGreen('\n═══════════════════════════════════════════════════════════'));
      console.log(chalk.bgGreen('  THEME RECALCULATION COMPLETE ✓                          '));
      console.log(chalk.bgGreen('═══════════════════════════════════════════════════════════\n'));

      return {
        message: 'Current story themes recalculated successfully',
        newTheme: themeInterpretation.trim(),
      };
    }),

  /**
   * Compute a lightweight timeline of vedha intensity, retro volatility, and aspect triggers
   */
  getTimeline: protectedProcedure
    .input(
      z.object({
        nativityChartId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const chart = await db.nativityChart.findUnique({
        where: { id: input.nativityChartId },
        include: { ephemerisData: { include: { planets: true } } },
      });

      if (!chart) throw new Error('Chart not found');
      if (chart.userId !== ctx.session.user.id) throw new Error('Unauthorized');

      const natalPlanets = (chart.ephemerisData?.planets || []).map((p) => ({ planet: p.planet, longitude: p.longitude }));

      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error('Invalid dates');

      const maxDays = 366;
      const days: Date[] = [];
      for (let dt = new Date(start); dt <= end && days.length < maxDays; dt.setDate(dt.getDate() + 1)) {
        days.push(new Date(dt));
      }

      const transitCalc = new TransitCalculator();

      const timeline: string[] = [];
      const vedhaScores: number[] = [];
      const retroVolatility: number[] = [];
      const aspectTriggers: string[][] = [];

      let prevRetroMap: Record<string, boolean> = {};

      for (const d of days) {
        const snapshot = await transitCalc.getTransitSnapshot(d, chart.latitude || 0, chart.longitude || 0);
        const scenes = await transitCalc.calculateTransitAspects(natalPlanets, snapshot.planets);

        const avgIntensity = scenes.length ? Math.round(scenes.reduce((s, sc) => s + sc.intensity, 0) / scenes.length) : 0;

        const retroCount = snapshot.planets.filter((p) => p.isRetrograde).length;

        // detect aspect triggers as short strings like 'SUN:conjunction'
        const triggers = scenes
          .flatMap((s) => s.aspectsActive.map((a) => `${s.planet}:${a.aspectType} `))
          .slice(0, 8);

        // retro volatility = count of planets that changed retro status since previous day
        const retroChanges = snapshot.planets.reduce((count, p) => {
          const prev = prevRetroMap[p.planet] || false;
          if (prev !== p.isRetrograde) return count + 1;
          return count;
        }, 0);

        prevRetroMap = snapshot.planets.reduce((m, p) => ((m[p.planet] = p.isRetrograde), m), {} as Record<string, boolean>);

        timeline.push(d.toISOString());
        vedhaScores.push(avgIntensity);
        retroVolatility.push(retroChanges || retroCount);
        aspectTriggers.push(triggers);
      }

      return { timeline, vedhaScores, retroVolatility, aspectTriggers };
    }),
});
