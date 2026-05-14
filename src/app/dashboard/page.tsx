'use client';

import React from 'react';
import ChartEngine from '../components/dashboard/ChartEngine';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { motion } from "framer-motion";
import { Orbit, Activity, Zap } from "lucide-react";

export default function AstroTerminal() {
  return (
    <div className="min-h-screen bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] font-sans flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] scale-150 rotate-45">
          <Orbit size={1000} strokeWidth={0.5} className="text-[var(--color-accent-glow)] opacity-30" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[var(--color-primary-dark)] to-transparent" />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 p-4 md:p-6 gap-6">

        {/* Central Intelligence Engine */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col bg-[var(--color-primary-light)]/5 border border-[var(--color-ring-bronze)]/20 rounded-[40px] overflow-hidden backdrop-blur-xl shadow-2xl"
        >
        

          <div className="flex-1 relative">
            <ChartEngine />
          </div>
        </motion.div>
      </main>

      <Footer />
      
      <style jsx global>{`
        /* Scrollbar customization for the terminal feel */
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--color-ring-bronze);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}