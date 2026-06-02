import React from 'react';
import Link from 'next/link';
import { Terminal, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-primary-dark)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-accent-glow)_0%,_transparent_70%)] opacity-10" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        
        {/* Branding Logo */}
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="AstroLogics Logo" 
            className="w-24 h-24 object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Error State Content */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] mb-2">
            <Terminal size={32} className="text-[var(--color-accent-orange)]" />
          </div>
          
          <h1 className="text-4xl font-black text-white tracking-[0.1em] uppercase">
            Signal Lost
          </h1>
          
          <p className="text-[var(--color-primary-light)]/60 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
            The requested coordinate or sector could not be resolved by the engine.
          </p>
        </div>

        {/* Action Link */}
        <div className="mt-10">
          <Link 
            href="/dashboard"
            className="group flex items-center gap-3 bg-white/[0.05] hover:bg-[var(--color-accent-orange)] border border-white/[0.1] hover:border-[var(--color-accent-orange)] px-8 py-4 rounded-xl transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={16} className="text-[var(--color-accent-orange)] group-hover:text-white transition-colors" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
              Return to Core
            </span>
          </Link>
        </div>

        {/* Footer Integrity Tag */}
        <div className="mt-12 text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-white/20">
          SEC-404 // ENGINE_ERR_NULL
        </div>
      </div>
    </div>
  );
}