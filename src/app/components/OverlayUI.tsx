'use client'
import { Html } from '@react-three/drei'

const copper = "#c8785c"

export default function OverlayUI({ transit, activeSign }) {
  // Pulling mundane data points from the transit prop
  const house = transit?.ascendant?.house || "1ST"
  const speed = transit?.planets?.mars?.speed?.toFixed(3) || "0.524" // Mars for Aries focus
  const element = "FIRE"
  const modality = "CARDINAL"

  return (
    <Html
      position={[0, 0, 0]}
      // Removed complex flex centering; using standard layout flow
      className="select-none pointer-events-none p-6 md:p-12 w-screen h-screen flex flex-col justify-between"
    >
      {/* HEADER: SYSTEM STATUS */}
      <div className="flex justify-between font-mono text-[10px] tracking-[0.4em] uppercase opacity-50">
        <div className="flex items-center gap-4">
          <span className="text-emerald-400">● LIVE_FEED</span>
          <span>LAT: {transit?.meta?.lat?.toFixed(2)} / LON: {transit?.meta?.lon?.toFixed(2)}</span>
        </div>
        <span>ARIES_SECTOR_V1.0</span>
      </div>

      {/* CENTER: THE TITULAR LANDMARK */}
      <div className="flex flex-col items-center">
        <h1 className="text-[12vw] font-serif leading-none mix-blend-difference uppercase italic">
          {activeSign}<span style={{ color: copper }}>.</span>
        </h1>
        
        {/* TRANSIT DATA STRIP */}
        <div className="flex gap-8 mt-[-1rem] bg-white/5 backdrop-blur-sm px-6 py-2 border-l border-r border-white/10">
          <div className="flex flex-col">
            <span className="text-[8px] text-white/40 uppercase">House</span>
            <span className="text-xs font-bold">{house}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-white/40 uppercase">Modality</span>
            <span className="text-xs font-bold">{modality}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-white/40 uppercase">Element</span>
            <span className="text-xs font-bold text-amber-300">{element}</span>
          </div>
        </div>
      </div>

      {/* FOOTER: MUNDANE TRANSIT TICKER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        {/* ASCENDANT POSITION */}
        <div className="border-l border-white/20 pl-4">
          <p className="text-[9px] font-mono opacity-40 italic uppercase tracking-tighter">Current_Ascendant</p>
          <h2 className="text-4xl font-serif">{transit?.ascendant?.degree?.toFixed(2)}°</h2>
        </div>

        {/* MARS MOMENTUM (Focusing on the Ruler of Aries) */}
        <div className="border-l border-white/20 pl-4 hidden md:block">
          <p className="text-[9px] font-mono opacity-40 italic uppercase tracking-tighter">Mars_Momentum</p>
          <div className="flex items-baseline gap-2">
             <h2 className="text-2xl font-light">{speed}</h2>
             <span className="text-[8px] opacity-30">DEG/DAY</span>
          </div>
        </div>

        {/* EMPTY SPACE FOR VISUAL BALANCE */}
        <div className="flex justify-center hidden md:flex">
             <div className="w-px h-12 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
        </div>

        {/* STATUS READOUT */}
        <div className="text-right flex flex-col items-end">
          <div className="bg-white text-black px-2 py-0.5 text-[10px] font-bold mb-2">PROFIT_MODEL: ACTIVE</div>
          <p className="text-[8px] font-mono opacity-40 uppercase max-w-[150px]">
            Executing Cinematic_Composition.js via Theatre.js Core
          </p>
        </div>

      </div>
    </Html>
  )
}