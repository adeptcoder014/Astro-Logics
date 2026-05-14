'use client'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

export default function HorizontalOrchestrator() {
  const [isMounted, setIsMounted] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // If not mounted, render the spacer to maintain layout height
  // Once mounted, render the child that contains the useScroll hook
  return (
    <section ref={targetRef} className="relative h-[400vh] bg-transparent">
      {isMounted && <HorizontalContent targetRef={targetRef} />}
    </section>
  )
}

function HorizontalContent({ targetRef }: { targetRef: React.RefObject<HTMLDivElement> }) {
  // Now useScroll initializes only when targetRef.current is guaranteed to exist
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  })

  // Add a spring for that "Oryzo" luxury feel (stiff but smooth)
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const x = useTransform(smoothProgress, [0, 1], ["0%", "-66%"])

  return (
    <div className="sticky top-0 flex h-screen items-center overflow-hidden">
      <motion.div 
        style={{ x }} 
        className="flex gap-[10vw] px-[10vw] will-change-transform"
      >
        {/* SEGMENT 01: THE STACK */}
        <div className="min-w-[70vw] h-[60vh] border border-rose-200 bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-3xl rounded-[40px] p-16 flex flex-col justify-between shadow-lg">
          <span className="text-[10px] font-mono tracking-[0.5em] text-amber-600 uppercase font-bold">Architecture.01</span>
          <div className="max-w-xl">
            <h3 className="text-6xl font-serif text-gray-700 mb-6 tracking-tighter">tRPC Orchestration<span className="text-amber-600">.</span></h3>
            <p className="text-sm text-gray-600 leading-relaxed tracking-wide">
              Direct type-safe synchronization between our celestial ephemeris engine and the Three.js render loop. Total coherence, zero boilerplate.
            </p>
          </div>
        </div>

        {/* SEGMENT 02: THE VISION */}
        <div className="min-w-[70vw] h-[60vh] border border-rose-200 bg-gradient-to-br from-rose-50 to-purple-50 backdrop-blur-3xl rounded-[40px] p-16 flex flex-col justify-between shadow-lg">
          <span className="text-[10px] font-mono tracking-[0.5em] text-amber-600 uppercase font-bold">Composition.02</span>
          <div className="max-w-xl">
            <h3 className="text-6xl font-serif text-gray-700 mb-6 tracking-tighter">Theatre.js Control<span className="text-amber-600">.</span></h3>
            <p className="text-sm text-gray-600 leading-relaxed tracking-wide">
              Granular keyframe manipulation of 3D assets mapped directly to the user's scroll velocity. Moving past static layouts into spatial narratives.
            </p>
          </div>
        </div>

        {/* SEGMENT 03: THE PROFIT */}
        <div className="min-w-[70vw] h-[60vh] border border-rose-200 bg-gradient-to-br from-blue-50 to-rose-50 backdrop-blur-3xl rounded-[40px] p-16 flex flex-col justify-between shadow-lg">
          <span className="text-[10px] font-mono tracking-[0.5em] text-amber-600 uppercase font-bold">Marketplace.03</span>
          <div className="max-w-xl">
            <h3 className="text-6xl font-serif text-gray-700 mb-6 tracking-tighter">Scalable Commerce<span className="text-amber-600">.</span></h3>
            <p className="text-sm text-gray-600 leading-relaxed tracking-wide">
              Integrating high-speed logistics (Blinkit) and marketplace modules into creative 3D experiences. Design that drives real-world conversion.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 