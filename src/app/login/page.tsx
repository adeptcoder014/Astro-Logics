'use client';

import React, { useState } from 'react';
import { Mail, Lock, Sparkles, Loader2, ArrowLeft, Moon, Orbit, ChevronRight } from "lucide-react";
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      mobile: formData.identifier,
      password: formData.password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccessMessage('Pranam! Welcome back.');
      setTimeout(() => router.push('/dashboard'), 1000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-primary-light)] overflow-hidden">
      {/* Left Column: Branding & Narrative (Moon Side) */}
      <div className="w-full md:w-1/2 p-10 md:p-24 flex flex-col justify-between relative bg-[var(--color-primary-light)]">
        <Link 
          href="/" 
          className="flex items-center text-[var(--color-primary-dark)] font-black uppercase tracking-widest text-sm group z-20"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        <div className="relative z-10 my-12 md:my-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 inline-block"
          >
            <Image src="/astrologics_logo.png" alt="Logo" width={120} height={120} className="drop-shadow-2xl animate-float" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-serif italic text-[var(--color-primary-dark)] leading-tight mb-6">
            The stars <br />
            <span className="text-[var(--color-accent-orange)] font-sans font-black not-italic tracking-tighter">Are Aligned.</span>
          </h1>
          <p className="text-lg text-[var(--color-primary-dark)]/70 max-w-sm font-medium leading-relaxed">
            Access your vendor sanctuary and master the mundane logs of your business empire.
          </p>
        </div>

        <div className="text-[var(--color-primary-dark)]/40 text-xs font-bold tracking-widest uppercase">
          © 2026 Astrologics Studio
        </div>

        {/* Decorative Moon Background element */}
        <div className="absolute top-[10%] right-[-10%] opacity-5 pointer-events-none">
          <Moon size={500} strokeWidth={1} />
        </div>
      </div>

      {/* Right Column: Form (Saturn Side) */}
      <div className="w-full md:w-1/2 bg-[var(--color-primary-dark)] flex items-center justify-center p-8 md:p-20 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <Orbit size={900} strokeWidth={1} className="absolute -right-1/4 top-0 text-[var(--color-accent-glow)]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[var(--color-primary-light)] tracking-tight uppercase">Login</h2>
            <Link href="/register" className="text-xs font-bold text-[var(--color-accent-glow)] underline underline-offset-4 hover:text-[var(--color-primary-light)] transition-colors">
              Request Access
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm font-medium">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[var(--color-ring-bronze)] text-[10px] font-black uppercase tracking-[0.3em] ml-1 transition-colors group-focus-within:text-[var(--color-accent-glow)]">
                Identification
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.identifier}
                  onChange={(e) => handleInputChange('identifier', e.target.value)}
                  className="w-full px-6 py-5 bg-[var(--color-primary-light)]/5 border border-[var(--color-ring-bronze)]/20 rounded-2xl text-[var(--color-primary-light)] focus:outline-none focus:border-[var(--color-accent-glow)] transition-all font-medium placeholder:text-[var(--color-ring-bronze)]/30 shadow-inner"
                  placeholder="Email or Mobile"
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-ring-bronze)]/40" />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <label className="text-[var(--color-ring-bronze)] text-[10px] font-black uppercase tracking-[0.3em] transition-colors group-focus-within:text-[var(--color-accent-glow)]">
                  Access Key
                </label>
                <button type="button" className="text-[10px] font-black text-[var(--color-accent-orange)] uppercase tracking-tighter hover:brightness-125 transition-all">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-6 py-5 bg-[var(--color-primary-light)]/5 border border-[var(--color-ring-bronze)]/20 rounded-2xl text-[var(--color-primary-light)] focus:outline-none focus:border-[var(--color-accent-glow)] transition-all font-medium placeholder:text-[var(--color-ring-bronze)]/30 shadow-inner"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-ring-bronze)]/40" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--color-accent-glow)] text-[var(--color-primary-dark)] font-black py-6 rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-[0_0_40px_rgba(164,196,217,0.1)] hover:bg-[var(--color-primary-light)] hover:shadow-[0_0_60px_rgba(164,196,217,0.2)] active:scale-[0.98] disabled:opacity-50 group"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-sm">Align Records</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {successMessage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center text-[var(--color-accent-glow)] font-bold italic">
              {successMessage}
            </motion.div>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}