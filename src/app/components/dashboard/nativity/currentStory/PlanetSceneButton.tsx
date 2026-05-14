import React from 'react';

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
    const zodiacSigns = [
      "♈",
      "♉",
      "♊",
      "♋",
      "♌",
      "♍",
      "♎",
      "♏",
      "♐",
      "♑",
      "♒",
      "♓",
    ];
    const signIndex = Math.floor((((longitude % 360) + 360) % 360) / 30);
    const degree = Math.floor(longitude % 30);
    return `${zodiacSigns[signIndex]} ${degree}°`;
  };
  return (





    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[2rem] border-2 p-5 text-left transition-all duration-500 group relative overflow-hidden ${selected
        ? "border-[var(--color-accent-orange)] bg-[var(--color-primary-dark)] shadow-xl scale-[1.02] z-10"
        : "border-[var(--color-ring-bronze)]/20 bg-[var(--color-primary-light)]/40 hover:bg-[var(--color-primary-light)]/80"
        }`}
    >
      {/* Selected State Decoration: Subtle atmospheric aura */}
      {selected && (
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--color-accent-glow)] opacity-20 blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <p className={`text-[9px] uppercase tracking-[0.4em] font-black transition-colors ${selected ? "text-[var(--color-accent-glow)]" : "text-[var(--text-muted)]"
            }`}>
            Sphere
          </p>
          <p className={`text-xl font-black uppercase tracking-tighter transition-colors ${selected ? "text-[var(--color-primary-light)]" : "text-[var(--color-primary-dark)]"
            }`}>
            {scene.planet}
          </p>
        </div>
        <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${selected
          ? "bg-[var(--color-accent-orange)] border-white/20 text-white shadow-lg"
          : "bg-[var(--color-primary-dark)]/5 border-[var(--color-ring-bronze)]/20 text-[var(--color-primary-dark)]"
          }`}>
          {Math.round(scene.intensity)}%
        </span>
      </div>

      <div className={`mt-4 space-y-2 text-[10px] font-mono font-bold transition-colors ${selected ? "text-[var(--color-primary-light)]/70" : "text-[var(--text-muted)]"
        }`}>
        <div className="flex justify-between items-center border-b border-current opacity-20 pb-1 italic">
          <span className="uppercase tracking-widest">Natal</span>
          <span>{formatPosition(scene.natalLongitude)}</span>
        </div>
        <div className="flex justify-between items-center italic">
          <span className="uppercase tracking-widest">Transit</span>
          <span className={selected ? "text-[var(--color-accent-glow)]" : "text-[var(--color-primary-dark)]"}>
            {formatPosition(scene.currentLongitude)}
          </span>
        </div>
      </div>

      {/* Interaction Indicator */}
      {!selected && (
        <div className="absolute bottom-0 left-0 w-0 h-1 bg-[var(--color-accent-orange)] transition-all duration-500 group-hover:w-full opacity-50" />
      )}
    </button>
  )
}

export default PlanetSceneButton;