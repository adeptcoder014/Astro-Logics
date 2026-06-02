import React from 'react';

interface PlanetaryScene {
  planet: string;
  intensity: number;
  natalLongitude: number;
  currentLongitude: number;
}

const PlanetSceneButton = ({
  scene,
  selected,
  onSelect,
}: {
  scene: PlanetaryScene;
  selected: boolean;
  onSelect: () => void;
}) => {
  const formatPosition = (longitude: number) => {
    const zodiacSigns = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
    const signIndex = Math.floor((((longitude % 360) + 360) % 360) / 30);
    const degree = Math.floor(longitude % 30);
    return `${zodiacSigns[signIndex]} ${degree}°`;
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-4 px-4 py-2.5 rounded-xl border font-sans text-left transition-all duration-200 shrink-0 select-none ${
        selected
          ? "border-[var(--color-accent-orange)] bg-[var(--color-primary-dark)] text-white shadow-md shadow-[var(--color-primary-dark)]/10"
          : "border-[var(--color-ring-bronze)]/15 bg-neutral-50 text-[var(--color-primary-dark)] hover:bg-neutral-100"
      }`}
    >
      {/* Identity Group: Big and Highly Readable */}
      <div className="min-w-0">
        <p className={`text-base font-black tracking-tight uppercase leading-none ${
          selected ? "text-white" : "text-[var(--color-primary-dark)]"
        }`}>
          {scene.planet}
        </p>
        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono font-bold tracking-tight opacity-70">
          <span>N: {formatPosition(scene.natalLongitude)}</span>
          <span className="opacity-40">|</span>
          <span className={selected ? "text-[var(--color-accent-glow)]" : "text-[var(--color-accent-orange)]"}>
            T: {formatPosition(scene.currentLongitude)}
          </span>
        </div>
      </div>

      {/* Metric Badge: Highly Compressed */}
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tracking-tighter shrink-0 ${
        selected
          ? "bg-[var(--color-accent-orange)] text-white"
          : "bg-[var(--color-primary-dark)]/5 text-[var(--color-primary-dark)]/80"
      }`}>
        {Math.round(scene.intensity)}%
      </span>
    </button>
  );
};

export default PlanetSceneButton;