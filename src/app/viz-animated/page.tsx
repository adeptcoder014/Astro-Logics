"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { PCA } from "ml-pca";
import { UMAP } from "umap-js";
import { api } from "~/trpc/react";

export default function AstroLatentSpaceVisualizer() {
  const PLANETS = [
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
    "RAHU",
    "KETU",
  ];

  const PLANET_COLORS: Record<string, string> = {
    SUN: "#FFD700",
    MOON: "#E0F7FA",
    MERCURY: "#00E676",
    VENUS: "#F48FB1",
    MARS: "#FF1744",
    JUPITER: "#FF9100",
    SATURN: "#78909C",
    URANUS: "#4DD0E1",
    NEPTUNE: "#536DFE",
    PLUTO: "#8E24AA",
    RAHU: "#00E5FF",
    KETU: "#D500F9",
  };

  const SIGNS = ["ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO", "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES"];
  const HOUSES = Array.from({ length: 12 }, (_, i) => i + 1);

  const AXES = [
    "valence", "arousal", "agency", "dominance", "coherence", "stability", "novelty", "volatility",
    "abstraction", "symbolic_density", "pattern_recognition", "analyticity", "intuition", "mental_speed",
    "focus", "diffusion", "past_orientation", "present_orientation", "future_orientation", "cyclicality",
    "urgency", "patience", "desire_intensity", "attachment", "avoidance", "expansion", "contraction",
    "ambition", "survival_drive", "sociality", "individuality", "collectivism", "relational_depth",
    "boundary_strength", "empathy", "dominance_social", "materiality", "spirituality", "sensory_density",
    "idealism", "pragmatism", "integration", "fragmentation", "entropy", "adaptability", "rigidity",
    "expressiveness", "repression", "reactivity", "responsiveness", "meaning_orientation", "identity_coherence",
    "transcendence", "ego_density"
  ];

  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    return date.toISOString().slice(0, 10);
  });
  const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [projectionMethod, setProjectionMethod] = useState<"PCA" | "UMAP">("PCA");
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  // Animation Engine States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(200); // ms per frame
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const chartsQuery = api.nativity.getCharts.useQuery();
  const planetaryProfilesQuery = api.nativity.getPlanetaryProfiles.useQuery(
    { nativityChartId: selectedChart ?? "" },
    { enabled: Boolean(selectedChart) }
  );

  const planetaryStateTimelineQuery = api.nativity.getDailyPlanetaryStates.useQuery(
    {
      nativityChartId: selectedChart ?? "",
      startDate: rangeStart,
      endDate: rangeEnd,
    },
    { enabled: Boolean(selectedChart) && Boolean(rangeStart) && Boolean(rangeEnd) }
  );

  useEffect(() => {
    if (!selectedChart && chartsQuery.data?.length) {
      setSelectedChart(chartsQuery.data[0].id);
    }
  }, [selectedChart, chartsQuery.data]);

  const planetaryProfiles = planetaryProfilesQuery.data?.planetaryProfiles ?? [];

  const axes = useMemo(() => {
    const axisSet = new Set<string>();
    planetaryProfiles.forEach((profile) => {
      if (profile.finalState && typeof profile.finalState === "object" && !Array.isArray(profile.finalState)) {
        Object.keys(profile.finalState).forEach((axis) => axisSet.add(axis));
      } else if (Array.isArray(profile.latentVector)) {
        profile.latentVector.forEach((_, index) => axisSet.add(String(index)));
      }
    });
    return Array.from(axisSet).sort();
  }, [planetaryProfiles]);

  const dataset = useMemo(() => {
    return planetaryProfiles.map((profile) => {
      const vector =
        profile.finalState && typeof profile.finalState === "object" && !Array.isArray(profile.finalState)
          ? profile.finalState
          : Array.isArray(profile.latentVector)
            ? profile.latentVector
            : {};

      const embedding = axes.map((axis) => {
        const value = (vector as any)[axis];
        return typeof value === "number" ? value : 0;
      });

      return {
        id: profile.id,
        planet: profile.planet,
        sign: profile.houseSign ?? "ARIES",
        house: profile.houseCusp ?? 1,
        vector,
        embedding,
      };
    });
  }, [planetaryProfiles, axes]);

  const projectedData = useMemo(() => {
    const matrix = dataset.map(d => d.embedding);
    if (matrix.length === 0) return [];
    if (matrix.length < 2) return dataset.map(item => ({ ...item, x: 0, y: 0 }));

    let projection: number[][] = [];
    if (projectionMethod === "PCA") {
      const pca = new PCA(matrix);
      projection = pca.predict(matrix, { nComponents: 2 }).to2DArray();
    } else {
      const effectiveNeighbors = Math.max(2, Math.min(12, matrix.length - 1));
      const umap = new UMAP({ nNeighbors: effectiveNeighbors, minDist: 0.2, nComponents: 2 });
      projection = umap.fit(matrix);
    }

    return dataset.map((item, idx) => ({
      ...item,
      x: projection[idx]?.[0] ?? 0,
      y: projection[idx]?.[1] ?? 0,
    }));
  }, [dataset, projectionMethod]);

  // Master timeline processing and caching mechanics
  const timelineDataCache = useMemo(() => {
    if (!planetaryStateTimelineQuery.data?.dailyStates) {
      return {
        rawRows: [],
        totalSteps: 0,
        uniqueDates: [],
      };
    }

    const { dailyStates } = planetaryStateTimelineQuery.data;

    if (!dailyStates.length) {
      return {
        rawRows: [],
        totalSteps: 0,
        uniqueDates: [],
      };
    }

    const sortedStates = [...dailyStates].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.planet.localeCompare(b.planet)
    );

    const uniqueDates = Array.from(
      new Set(
        sortedStates.map((d) => d.date.split("T")[0])
      )
    ).sort();

    type SimulationRow = {
      id: string;
      date: string;
      planet: string;
      sign: string;
      house: number;

      movementDegrees: number;
      intensity: number;
      aspectCount: number;
      currentLongitude: number;
      speed: number;

      latentVector: number[];

      deltaVector: number[];
      velocityVector: number[];
      smoothedVector: number[];
      enhancedVector: number[];

      trajectoryIndex: number;

      x?: number;
      y?: number;
    };

    const rows: SimulationRow[] = [];

    const previousVectorByPlanet = new Map<
      string,
      number[]
    >();

    const previousDeltaByPlanet = new Map<
      string,
      number[]
    >();

    for (const row of sortedStates) {
      const current =
        row.latentVector ?? [];

      const previous =
        previousVectorByPlanet.get(
          row.planet
        ) ?? current.map(() => 0);

      // -----------------------------------
      // RAW DELTA
      // -----------------------------------

      const rawDelta = current.map(
        (v, i) => v - (previous[i] ?? 0)
      );

      // -----------------------------------
      // CLAMPED DELTA
      // prevents vector explosions
      // -----------------------------------

      const deltaVector = rawDelta.map(
        (d) => Math.tanh(d * 2)
      );

      // -----------------------------------
      // VELOCITY
      // momentum memory
      // -----------------------------------

      const previousDelta =
        previousDeltaByPlanet.get(
          row.planet
        ) ?? deltaVector.map(() => 0);

      const velocityVector =
        deltaVector.map(
          (d, i) => d - previousDelta[i]
        );

      // -----------------------------------
      // TEMPORAL SMOOTHING
      // creates orbital continuity
      // -----------------------------------

      const smoothedVector =
        current.map(
          (v, i) =>
            v * 0.7 +
            (previous[i] ?? 0) * 0.3
        );

      // -----------------------------------
      // RECENT BIAS
      // recent evolution emphasized
      // -----------------------------------

      const recentWeight =
        0.6 +
        (uniqueDates.indexOf(
          row.date.split("T")[0]
        ) /
          uniqueDates.length) *
        1.2;

      // -----------------------------------
      // FINAL ENHANCED VECTOR
      // -----------------------------------

      const enhancedVector =
        smoothedVector.map((v, i) => {
          const delta =
            deltaVector[i] ?? 0;

          const velocity =
            velocityVector[i] ?? 0;

          return (
            v * 1.0 +
            delta * 2.4 +
            velocity * 1.8 +
            delta * recentWeight
          );
        });

      rows.push({
        ...row,

        deltaVector,
        velocityVector,
        smoothedVector,
        enhancedVector,

        trajectoryIndex:
          uniqueDates.indexOf(
            row.date.split("T")[0]
          ),
      });

      previousVectorByPlanet.set(
        row.planet,
        current
      );

      previousDeltaByPlanet.set(
        row.planet,
        deltaVector
      );
    }

    // -----------------------------------
    // PROJECTION MATRIX
    // -----------------------------------

    const matrix = rows.map(
      (r) => r.enhancedVector
    );

    let projection: number[][] = [];

    if (matrix.length >= 2) {
      // -----------------------------------
      // PCA = stable temporal geometry
      // -----------------------------------

      const pca = new PCA(matrix);

      projection = pca
        .predict(matrix, {
          nComponents: 2,
        })
        .to2DArray();

      // -----------------------------------
      // spread amplification
      // makes divergence readable
      // -----------------------------------

      projection = projection.map(
        ([x, y]) => [
          x * 18,
          y * 18,
        ]
      );
    } else {
      projection = matrix.map(() => [0, 0]);
    }

    // -----------------------------------
    // ORBITAL RADIAL SEPARATION
    // prevents planetary stacking
    // -----------------------------------

    const orbitalOffsets: Record<
      string,
      [number, number]
    > = {
      SUN: [0, 0],
      MOON: [18, 10],
      MERCURY: [-16, 12],
      VENUS: [14, -14],
      MARS: [-18, -12],
      JUPITER: [28, 8],
      SATURN: [-30, 6],
      URANUS: [10, 26],
      NEPTUNE: [-12, 30],
      PLUTO: [34, -18],
      RAHU: [-36, -10],
      KETU: [38, 16],
    };

    const projectedRows = rows.map(
      (row, idx) => {
        const baseX =
          projection[idx]?.[0] ?? 0;

        const baseY =
          projection[idx]?.[1] ?? 0;

        const offset =
          orbitalOffsets[row.planet] ??
          [0, 0];

        // -----------------------------------
        // trajectory drift
        // creates visible directional motion
        // -----------------------------------

        const temporalDrift =
          row.trajectoryIndex * 1.8;

        return {
          ...row,

          x:
            baseX +
            offset[0] +
            temporalDrift,

          y:
            baseY +
            offset[1] +
            Math.sin(
              row.trajectoryIndex * 0.35
            ) *
            8,
        };
      }
    );

    return {
      rawRows: projectedRows,
      totalSteps: uniqueDates.length,
      uniqueDates,
    };
  }, [
    planetaryStateTimelineQuery.data,
  ]);
  // Slice cached dataset matching current time step
  const animatedSimulationDataset = useMemo(() => {
    if (!timelineDataCache.rawRows.length) return [];
    return timelineDataCache.rawRows.filter(row => row.trajectoryIndex <= currentStep);
  }, [timelineDataCache, currentStep]);

  // Extract only current day point positions for the high-contrast lead dots
  const currentFrameDots = useMemo(() => {
    return animatedSimulationDataset.filter(row => row.trajectoryIndex === currentStep);
  }, [animatedSimulationDataset, currentStep]);

  // Animation ticks handled loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= playbackSpeed) {
        setCurrentStep((prev) => {
          if (prev >= timelineDataCache.totalSteps - 1) {
            setIsPlaying(false); // End of track
            return prev;
          }
          return prev + 1;
        });
        lastFrameTimeRef.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, playbackSpeed, timelineDataCache.totalSteps]);

  const filteredBaseData = useMemo(() => {
    if (!selectedPlanet) return projectedData;
    return projectedData.filter(d => d.planet === selectedPlanet);
  }, [projectedData, selectedPlanet]);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
          AstroLogics Latent Space Observatory
        </h1>
        <p className="text-zinc-400 max-w-4xl text-sm">
          High-dimensional symbolic cognition projection system for planetary ontology analysis. Humanity invented thousands of years of astrology only to eventually reinvent geometry wearing cosmic jewelry.
        </p>
      </div>

      {/* Control Triggers */}
      <div className="flex flex-wrap gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm items-center">
        <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${projectionMethod === "PCA" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"}`}
            onClick={() => setProjectionMethod("PCA")}
          >
            PCA
          </button>
          <button
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${projectionMethod === "UMAP" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"}`}
            onClick={() => setProjectionMethod("UMAP")}
          >
            UMAP
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block" />

        {/* Animation Playback Deck */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800/80">
          <button
            disabled={!timelineDataCache.totalSteps}
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isPlaying ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-sky-500 text-black hover:bg-sky-400 disabled:opacity-30"
              }`}
          >
            {isPlaying ? (
              <>
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" /> Pause
              </>
            ) : (
              "Play Simulation"
            )}
          </button>

          <button
            onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
            disabled={currentStep === 0}
            className="px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-800 disabled:opacity-30"
          >
            Reset
          </button>

          <div className="w-px h-4 bg-zinc-800 mx-1" />

          {/* Speed settings */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="bg-transparent text-xs text-zinc-400 outline-none cursor-pointer focus:text-white"
          >
            <option value="400" className="bg-zinc-950">Slow Sync</option>
            <option value="200" className="bg-zinc-950">Normal</option>
            <option value="75" className="bg-zinc-950">Hyperlapse</option>
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-zinc-400 font-medium" htmlFor="chartSelect">Chart</label>
          <select
            id="chartSelect"
            value={selectedChart ?? ""}
            onChange={(event) => { setSelectedChart(event.target.value); setCurrentStep(0); }}
            className="rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 px-3 py-2 outline-none"
          >
            {chartsQuery.data?.map((chart) => (
              <option key={chart.id} value={chart.id}>{chart.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 font-medium" htmlFor="rangeStart">Range</label>
          <input
            id="rangeStart" type="date" value={rangeStart}
            onChange={(e) => { setRangeStart(e.target.value); setCurrentStep(0); }}
            className="rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 px-2 py-1.5 outline-none"
          />
          <span className="text-xs text-zinc-500">to</span>
          <input
            id="rangeEnd" type="date" value={rangeEnd}
            onChange={(e) => { setRangeEnd(e.target.value); setCurrentStep(0); }}
            className="rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 px-2 py-1.5 outline-none"
          />
        </div>
      </div>

      {/* Quick Filter Bar */}
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-zinc-950 border border-zinc-900">
        <button
          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${!selectedPlanet ? "bg-zinc-100 text-black border-zinc-100" : "bg-transparent text-zinc-400 border-transparent hover:text-white"}`}
          onClick={() => setSelectedPlanet(null)}
        >
          All Transits
        </button>
        {PLANETS.map(planet => (
          <button
            key={planet}
            style={{
              borderColor: selectedPlanet === planet ? PLANET_COLORS[planet] : 'transparent',
              boxShadow: selectedPlanet === planet ? `0 0 8px ${PLANET_COLORS[planet]}20` : 'none'
            }}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${selectedPlanet === planet ? "bg-zinc-900 text-white" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
            onClick={() => setSelectedPlanet(planet)}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: PLANET_COLORS[planet] }} />
            {planet}
          </button>
        ))}
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Manifold Visualization Container */}
        <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md shadow-2xl p-6 flex flex-col justify-between">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-200">
                Latent Manifold Projection
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Observe planetary clustering, sign modulation drift, and symbolic topology integrity.
              </p>
            </div>
            {timelineDataCache.uniqueDates.length > 0 && (
              <div className="text-right">
                <span className="text-xs text-zinc-500 block uppercase tracking-widest">Active Frame</span>
                <span className="text-sm font-mono font-bold text-sky-400 bg-sky-500/5 px-2 py-0.5 rounded border border-sky-500/10">
                  {timelineDataCache.uniqueDates[currentStep] || rangeStart}
                </span>
              </div>
            )}
          </div>

          {/* Progress Timeline Scrubber Bar */}
          {timelineDataCache.totalSteps > 0 && (
            <div className="mb-4 flex items-center gap-3 bg-zinc-900/30 p-2 rounded-xl border border-zinc-900">
              <span className="text-[10px] font-mono text-zinc-500">Day 1</span>
              <input
                type="range"
                min={0}
                max={timelineDataCache.totalSteps - 1}
                value={currentStep}
                onChange={(e) => { setIsPlaying(false); setCurrentStep(Number(e.target.value)); }}
                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-[10px] font-mono text-zinc-400">
                {currentStep + 1}/{timelineDataCache.totalSteps}
              </span>
            </div>
          )}

          <div className="h-[580px] w-full bg-zinc-950/60 border border-zinc-900 rounded-2xl p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 25, left: 0 }}>
                <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="Dimension 1" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis type="number" dataKey="y" name="Dimension 2" stroke="#52525b" fontSize={11} tickLine={false} />

                <Tooltip
                  cursor={{ strokeDasharray: "4 4", stroke: "#3f3f46" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    const isSimulation = d?.date !== undefined;
                    const title = isSimulation ? `${d.planet} · ${d.date.split("T")[0]}` : `${d.planet} · ${d.sign} · House ${d.house}`;
                    const entries = isSimulation
                      ? [
                        ["Movement", d.movementDegrees],
                        ["Intensity", d.intensity],
                        ["Aspects", d.aspectCount],
                        ["Speed", d.speed]
                      ]
                      : Object.entries(d.vector || {}).slice(0, 6);

                    return (
                      <div className="bg-zinc-900/95 border border-zinc-800 backdrop-blur-md rounded-xl p-4 text-xs shadow-2xl space-y-2 text-zinc-300 min-w-[220px]">
                        <div className="font-bold text-sm text-white flex items-center gap-2 border-b border-zinc-800 pb-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLANET_COLORS[d.planet] || '#38bdf8' }} />
                          {title}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {entries.map(([key, value]) => (
                            <React.Fragment key={key}>
                              <span className="text-zinc-500">{key}:</span>
                              <span className="text-right font-mono text-white">{typeof value === "number" ? value.toFixed(4) : String(value)}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />

                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} iconType="circle" />

                {/* Static Base Profiles Map */}
                <Scatter name="Radix Profile Nodes" data={filteredBaseData} fill="#27272a" fillOpacity={0.35} shape="circle" />

                {/* Historical Trajectory Line Trails (Drawn using non-shape Scatter nodes linked together) */}
                // REPLACE THIS ENTIRE TRAIL SECTION

                {PLANETS.map((planet) => {
                  if (selectedPlanet && selectedPlanet !== planet) return null;

                  const TRAIL_LENGTH = 18;

                  const lineData = animatedSimulationDataset
                    .filter(d => d.planet === planet)
                    .sort((a, b) => a.trajectoryIndex - b.trajectoryIndex)
                    .slice(-TRAIL_LENGTH);

                  if (!lineData.length) return null;

                  return (
                    <Scatter
                      key={`${planet}-trajectory-trail`}
                      name={`${planet} Trail`}
                      data={lineData}
                      line={{
                        stroke: PLANET_COLORS[planet],
                        strokeWidth: selectedPlanet === planet ? 3 : 2,
                        strokeOpacity: selectedPlanet ? 0.95 : 0.72,
                      }}
                      fill={PLANET_COLORS[planet]}
                      fillOpacity={0}
                      shape={(props: any) => {
                        const { cx, cy, index } = props;

                        const opacity =
                          0.12 + (index / lineData.length) * 0.88;

                        const radius =
                          1.8 + (index / lineData.length) * 2.4;

                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill={PLANET_COLORS[planet]}
                            fillOpacity={opacity}
                          />
                        );
                      }}
                    />
                  );
                })}
// REPLACE CURRENT ACTIVE DOTS SECTION

                {currentFrameDots.length > 0 && (
                  <Scatter
                    name="Active Coordinates"
                    data={currentFrameDots.filter(
                      d => !selectedPlanet || d.planet === selectedPlanet
                    )}
                    fill="#fff"
                    shape={(props: any) => {
                      const { cx, cy, payload } = props;

                      const color =
                        PLANET_COLORS[payload.planet] || "#38bdf8";

                      return (
                        <g>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={11}
                            fill={color}
                            stroke="#fff"
                            strokeWidth={2}
                          />

                          <circle
                            cx={cx}
                            cy={cy}
                            r={22}
                            fill={color}
                            fillOpacity={0.08}
                          />

                          <circle
                            cx={cx}
                            cy={cy}
                            r={34}
                            fill={color}
                            fillOpacity={0.03}
                          />
                        </g>
                      );
                    }}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Intelligence Panel */}
        <div className="space-y-6 flex flex-col justify-between">

          <div className="rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md p-6 space-y-3">
            <h2 className="text-lg font-medium text-zinc-200">Kinematic Engine</h2>
            <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p>
                The execution matrix maps sequential temporal modifications as vector deltas. Cumulative steps form a topological trail through the manifold coordinates.
              </p>
              <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 font-mono text-[11px] space-y-1 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cache Frames:</span>
                  <span className="text-emerald-400 font-bold">Buffered ({timelineDataCache.totalSteps})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Engine State:</span>
                  <span>{isPlaying ? "Streaming" : "Cached / Idle"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md p-6 space-y-3">
            <h2 className="text-lg font-medium text-zinc-200">Simulation Summary</h2>
            <div className="grid grid-cols-1 gap-2 text-xs text-zinc-400">
              <div className="flex justify-between gap-4">
                <span>Time Frame</span>
                <span className="text-right text-zinc-200">{rangeStart} → {rangeEnd}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Computed Units</span>
                <span className="text-right text-zinc-200">{animatedSimulationDataset.length} frames</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Projection Logic</span>
                <span className="text-right text-zinc-200">{projectionMethod}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Status</span>
                <span className="text-right text-zinc-200">{planetaryStateTimelineQuery.isFetching ? 'Syncing Network…' : 'Cached Memory Ready'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md p-6 space-y-3">
            <h2 className="text-lg font-medium text-zinc-200">Geometric Archetypes</h2>
            <div className="grid grid-cols-1 gap-2 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FF1744]" />Mars: Tight action-clusters</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E0F7FA]" />Moon: High-volatility fluid manifolds</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#78909C]" />Saturn: High-rigidity compressed regions</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00E5FF]" />Rahu: Maximized entropy spread</div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md p-6 space-y-3 flex-1 flex flex-col justify-center">
            <h2 className="text-lg font-medium text-zinc-200 mb-1">State Weights Overview</h2>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono border-t border-zinc-900 pt-3">
              <span className="text-zinc-500">Total Datapoints:</span> <span className="text-right text-zinc-200 font-bold">{dataset.length}</span>
              <span className="text-zinc-500">Dimensions/Axes:</span> <span className="text-right text-zinc-200">{AXES.length}</span>
              <span className="text-zinc-500">Planetary Units:</span> <span className="text-right text-zinc-200">{PLANETS.length}</span>
              <span className="text-zinc-500">Zodiac Archetypes:</span> <span className="text-right text-zinc-200">{SIGNS.length}</span>
              <span className="text-zinc-500">Bhavas/Houses:</span> <span className="text-right text-zinc-200">{HOUSES.length}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}