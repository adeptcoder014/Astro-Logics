import { promises as fs } from 'fs';
import path from 'path';

const ASTRO_DATA_ROOT = path.join(process.cwd(), 'astro-data');

const dedupe = <T>(items: Array<T | null | undefined>): T[] =>
  Array.from(new Set(items.filter((item): item is T => item !== null && item !== undefined)));

const loadAstroData = async <T = any>(relativePath: string): Promise<T | null> => {
  try {
    const fullPath = path.join(ASTRO_DATA_ROOT, relativePath);
    const file = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(file) as T;
  } catch {
    return null;
  }
};

export const getSignOntology = async (sign: string) => {
  const normalized = sign.trim().toLowerCase();
  return await loadAstroData<Record<string, any>>(`signs/${normalized}.json`);
};

export const getHouseSceneOntology = async (house: number) => {
  if (house < 1 || house > 12) {
    house = 1;
  }
  return (
    await loadAstroData<Record<string, any>>(`scenes/house_${house}.json`) ||
    (await loadAstroData<Record<string, any>>('scenes/house_1.json')) ||
    null
  );
};

export const getPlanetOntology = async (planet: string) => {
  const normalized = planet.trim().toLowerCase();
  return await loadAstroData<Record<string, any>>(`planets/${normalized}.json`);
};

export interface SynthesizedSceneAttributes {
  astroState: Record<string, any>;
  pressureState: Record<string, any>;
  behavioralState: Record<string, any>;
  relationalState: Record<string, any>;
  situationalState: Record<string, any>;
  narrativeState: Record<string, any>;
  metaState: Record<string, any>;
  vectorState: Record<string, number>;
}

export const synthesizeSceneAttributes = async (options: {
  planet: string;
  sign: string;
  house: number;
  natalLongitude: number;
  currentLongitude: number;
  movementDegrees: number;
  intensity: number;
  planetProfile?: Record<string, any> | null;
  activeAspects: Array<{ aspectType: string }>;
}) => {
  const signData = await getSignOntology(options.sign);
  const houseData = await getHouseSceneOntology(options.house);

  const activeAspectTypes = options.activeAspects.map((aspect) => aspect.aspectType || '').filter(Boolean);

  const coreArchetype = dedupe([
    ...(signData?.coreArchetype || []),
    ...(signData?.styleModifiers || []),
  ]).slice(0, 6);

  const behavioralState = dedupe([
    ...(signData?.behavioralMicroPatterns || []),
    ...(houseData?.behavioralDynamics || []),
    ...(signData?.shadowPatterns || []),
  ]).slice(0, 6);

  const stressBehavior = dedupe([
    ...(signData?.stressStyle || []),
    ...(signData?.pressureResponses || []),
    ...(houseData?.pressureSources || []),
    ...(houseData?.conflictDynamics || []),
  ]).slice(0, 6);

  const speechPatterns = dedupe([
    ...(houseData?.speechPatterns || []),
    ...(signData?.speechPatterns || []),
  ]).slice(0, 6);

  const bodyLanguage = dedupe([
    ...(houseData?.bodyLanguagePatterns || []),
    ...(signData?.bodyLanguage || []),
  ]).slice(0, 6);

  const environmentalArena = dedupe([
    ...(houseData?.environment?.specificLocations || []),
    ...(signData?.environmentPreferences || []),
  ]).slice(0, 6);

  const relationshipDynamics = dedupe([
    ...(houseData?.relationshipDynamics || []),
    ...(signData?.relationshipPatterns || []),
  ]).slice(0, 6);

  const decisionDistortions = dedupe([
    ...(signData?.decisionStyle || []),
    ...(houseData?.conflictDynamics || []),
  ]).slice(0, 6);

  const emotionalDrivers = dedupe([
    ...(signData?.emotionalNeeds || []),
    ...(signData?.emotionalTriggers || []),
  ]).slice(0, 6);

  const behavioralMomentum = options.movementDegrees > 15
    ? 'accelerated adaptation'
    : options.movementDegrees < -15
      ? 'slow internal pressure'
      : 'steady emotional flow';

  const pressureManifestation = houseData?.pressureSources?.[0]
    || signData?.pressureResponses?.[0]
    || 'pressure converges through familiar life patterns';

  const adaptationPressure = signData?.growthDirection?.[0]
    || (houseData?.escalationStages?.early || [])[0]
    || 'adapt slowly through grounded awareness';

  const dominantConflictAxis = dedupe([
    ...(houseData?.conflictDynamics || []),
    ...activeAspectTypes,
  ]).slice(0, 6);

  const microBehaviors = dedupe([
    ...(houseData?.microBehaviors || []),
    ...(signData?.behavioralMicroPatterns || []),
  ]).slice(0, 6);

  const sceneHooks = dedupe([
    ...(houseData?.sceneTriggers || []),
    ...activeAspectTypes.map((type) => `${type} tension`),
  ]).slice(0, 6);

  const symbolicObjects = dedupe([
    ...(signData?.element ? [`${signData.element.toLowerCase()} symbol`] : []),
    options.planetProfile?.primaryDomain ? [`${options.planetProfile.primaryDomain.toLowerCase()} motif`] : [],
    ...(houseData?.environment?.specificLocations || []),
  ]).slice(0, 6);

  const cinematicExpressions = dedupe([
    ...(houseData?.cinematicExpressions || []),
    ...(signData?.cinematicExpressions || []),
  ]).slice(0, 6);

  const storyFunction = houseData?.narrativeFunction?.[0]
    || `${options.planet} activates a practical pressure story in ${options.sign}`;

  const resolutionVector = signData?.growthDirection?.[1]
    || (houseData?.escalationStages?.middle || [])[0]
    || 'move toward balanced expression';

  const vectorState = {
    controlNeed: options.intensity > 60 ? 0.8 : options.intensity > 30 ? 0.5 : 0.2,
    emotionalVolatility: Math.min(1, Math.abs(options.movementDegrees) / 180),
    socialPressure: options.house > 6 ? 0.8 : 0.4,
    adaptability: ['GEMINI', 'SAGITTARIUS', 'AQUARIUS'].includes(options.sign) ? 0.9 : 0.5,
    impulsiveness: ['ARIES', 'LEO', 'SAGITTARIUS'].includes(options.sign) ? 0.7 : 0.3,
    caution: ['VIRGO', 'CAPRICORN', 'TAURUS'].includes(options.sign) ? 0.9 : 0.4,
    aggression: options.planet === 'MARS' || ['ARIES', 'SCORPIO'].includes(options.sign) ? 0.8 : 0.2,
    attachmentNeed: ['VENUS', 'MOON'].includes(options.planet) ? 0.8 : 0.4,
  };

  return {
    astroState: {
      planet: options.planet,
      sign: options.sign,
      house: options.house,
      natalLongitude: options.natalLongitude,
      currentLongitude: options.currentLongitude,
      movementDegrees: options.movementDegrees,
      intensity: options.intensity,
      activeAspects: activeAspectTypes,
      coreArchetype,
    },
    pressureState: {
      dominantPressure: signData?.pressureResponses?.[0] || houseData?.pressureSources?.[0] || "performance overload",
      pressureDirection: adaptationPressure,
      collapseRisk: options.intensity > 70 ? 72 : Math.round(options.intensity * 0.8),
      stressAcceleration: options.movementDegrees > 10 ? "increasing" : options.movementDegrees < -10 ? "decreasing" : "stable",
      unresolvedPattern: signData?.shadowPatterns?.[0] || "overcompensating through work",
    },
    behavioralState: {
      behavioralPatterns: behavioralState,
      stressBehavior,
      emotionalDrivers,
      behavioralMomentum,
      bodyLanguage,
      speechPatterns,
      microBehaviors,
    },
    relationalState: {
      relationshipDynamics,
      decisionDistortions,
      dominantConflictAxis,
    },
    situationalState: {
      environmentalArena,
      sceneHooks,
      symbolicObjects,
    },
    narrativeState: {
      cinematicExpressions,
      storyFunction,
      resolutionVector,
    },
    metaState: {
      pressureManifestation,
      adaptationPressure,
    },
    vectorState,
  };
};
