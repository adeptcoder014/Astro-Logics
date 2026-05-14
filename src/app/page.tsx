'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './components/Navbar';
import { Sparkles, BarChart3, Users, Zap, ArrowRight, Moon, Orbit } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <BarChart3 className="w-10 h-10" />,
      title: "Lunar Analytics",
      description: "Clear, bright insights that illuminate your sales patterns like a full moon.",
      theme: "moon"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Saturnine Structure",
      description: "Deep, disciplined customer management to build rings of long-term loyalty.",
      theme: "saturn"
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Cosmic Velocity",
      description: "Fast-acting tools that bridge the gap between intuition and execution.",
      theme: "moon"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] selection:bg-[var(--color-primary-dark)] selection:text-[var(--color-primary-light)]">
      <Navbar />

      {/* Hero Section: The Moon (Light) */}
      <section className="relative overflow-hidden pt-20 pb-32 bg-[var(--color-primary-light)]">
        <div className="absolute top-20 right-[10%] opacity-10 pointer-events-none">
          <Moon size={400} strokeWidth={1} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="relative mx-auto mb-10 w-fit">
            <Image
              src="/astrologics_logo.png"
              alt="Astrologics logo"
              width={200}
              height={200}
              className="relative drop-shadow-2xl animate-float"
              priority
            />
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-[var(--color-primary-dark)]">
            Illuminating <br />
            <span className="italic font-serif">Your Commerce</span>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--color-primary-dark)]/80 max-w-2xl mx-auto mb-12 font-medium">
            The intelligent vendor platform where ancient cosmic wisdom meets modern digital scale.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/register" 
              className="bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] font-bold px-12 py-5 rounded-full transition-all hover:scale-105 shadow-xl flex items-center gap-3"
            >
              Start Your Journey <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section: The Saturn (Dark) */}
      <section className="py-32 bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-5%] opacity-5 pointer-events-none rotate-12">
          <Orbit size={600} strokeWidth={1} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black uppercase tracking-[0.5em] text-[var(--color-accent-glow)] mb-4">Celestial Infrastructure</h2>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-primary-light)]">Built for Stability</h3>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`p-10 rounded-[40px] border transition-all duration-500 hover:-translate-y-2 ${
                  feature.theme === 'moon' 
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border-transparent shadow-2xl' 
                  : 'bg-transparent border-[var(--color-primary-light)]/20 text-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]/5'
                }`}
              >
                <div className={`mb-8 w-16 h-16 rounded-2xl flex items-center justify-center ${
                  feature.theme === 'moon' ? 'bg-[var(--color-primary-dark)] text-[var(--color-primary-light)]' : 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'
                }`}>
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">{feature.title}</h4>
                <p className="leading-relaxed font-medium opacity-90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section: Balanced Contrast */}
      <section className="py-32 bg-[var(--color-primary-light)]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="border-[6px] border-[var(--color-primary-dark)] p-12 md:p-24 rounded-[60px] inline-block w-full">
            <h3 className="text-5xl md:text-7xl font-black mb-8 text-[var(--color-primary-dark)] tracking-tighter">
              Ready to <span className="text-[var(--color-accent-orange)]">Ascend?</span>
            </h3>
            <p className="text-[var(--color-primary-dark)]/70 text-xl mb-12 max-w-md mx-auto font-bold uppercase tracking-widest">
              Establish your domain today.
            </p>
            <Link 
              href="/register" 
              className="bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] font-black px-16 py-7 rounded-full text-xl hover:bg-[var(--color-accent-orange)] hover:text-white transition-all shadow-2xl block sm:inline-block"
            >
              Join the Constellation
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(2deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        h1, h2, h3, h4 {
          text-wrap: balance;
        }
      `}</style>
    </div>
  );
}