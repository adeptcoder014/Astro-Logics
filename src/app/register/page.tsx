'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Sparkles, Loader2, ArrowLeft, Moon, Orbit, ChevronRight } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [error, setError] = useState('');

  const registerUser = api.user.registerUser.useMutation({
    onSuccess: () => {
      router.push('/login');
    },
    onError: (opts) => {
      setError(opts.message);
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    registerUser.mutate({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile || undefined,
      passwordHash: formData.password ? `hashed_${formData.password}` : undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-primary-light)] overflow-hidden">
      {/* Left Column: The Invitation (Moon Side) */}
      <div className="w-full md:w-1/2 p-10 md:p-24 flex flex-col justify-between relative bg-[var(--color-primary-light)]">
        <Link 
          href="/login" 
          className="flex items-center text-[var(--color-primary-dark)] font-black uppercase tracking-widest text-sm group z-20"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
        </Link>

        <div className="relative z-10 my-12 md:my-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 inline-block"
          >
             <div className="w-20 h-20 bg-[var(--color-primary-dark)] rounded-3xl flex items-center justify-center rotate-3 shadow-2xl animate-float">
                <Sparkles className="text-[var(--color-accent-orange)] w-10 h-10" />
             </div>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-serif italic text-[var(--color-primary-dark)] leading-tight mb-6">
            Begin Your <br />
            <span className="text-[var(--color-accent-orange)] font-sans font-black not-italic tracking-tighter">Ascension.</span>
          </h1>
          <p className="text-lg text-[var(--color-primary-dark)]/70 max-w-sm font-medium leading-relaxed">
            Join our private network of vendors and synchronize your business trajectory with cosmic precision.
          </p>
        </div>

        <div className="text-[var(--color-primary-dark)]/40 text-xs font-bold tracking-widest uppercase">
          Secure Enrollment • Protocol 2026
        </div>

        <div className="absolute top-[10%] right-[-10%] opacity-5 pointer-events-none">
          <Moon size={500} strokeWidth={1} />
        </div>
      </div>

      {/* Right Column: The Enrollment (Saturn Side) */}
      <div className="w-full md:w-1/2 bg-[var(--color-primary-dark)] flex items-center justify-center p-8 md:p-20 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <Orbit size={900} strokeWidth={1} className="absolute -left-1/4 bottom-0 text-[var(--color-accent-glow)]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10">
            <h2 className="text-2xl font-black text-[var(--color-primary-light)] tracking-tight uppercase">Create Account</h2>
            <div className="h-1 w-12 bg-[var(--color-accent-orange)] mt-2" />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-xs font-bold uppercase tracking-wider">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
            {/* Full Name */}
            <div className="space-y-1 group">
              <label className="text-[var(--color-ring-bronze)] text-[10px] font-black uppercase tracking-[0.3em] ml-1 group-focus-within:text-[var(--color-accent-glow)]">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-6 py-4 bg-[var(--color-primary-light)]/5 border border-[var(--color-ring-bronze)]/20 rounded-2xl text-[var(--color-primary-light)] focus:outline-none focus:border-[var(--color-accent-glow)] transition-all font-medium placeholder:text-[var(--color-ring-bronze)]/30"
                  placeholder="John Doe"
                />
                <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ring-bronze)]/40" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1 group">
              <label className="text-[var(--color-ring-bronze)] text-[10px] font-black uppercase tracking-[0.3em] ml-1 group-focus-within:text-[var(--color-accent-glow)]">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-6 py-4 bg-[var(--color-primary-light)]/5 border border-[var(--color-ring-bronze)]/20 rounded-2xl text-[var(--color-primary-light)] focus:outline-none focus:border-[var(--color-accent-glow)] transition-all font-medium placeholder:text-[var(--color-ring-bronze)]/30"
                  placeholder="john@cosmos.com"
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ring-bronze)]/40" />
              </div>
            </div>

            {/* Mobile & Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1 group">
                <label className="text-[var(--color-ring-bronze)] text-[10px] font-black uppercase tracking-[0.3em] ml-1 group-focus-within:text-[var(--color-accent-glow)]">Mobile</label>
                <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="w-full px-6 py-4 bg-[var(--color-primary-light)]/5 border border-[var(--color-ring-bronze)]/20 rounded-2xl text-[var(--color-primary-light)] focus:outline-none focus:border-[var(--color-accent-glow)] transition-all font-medium placeholder:text-[var(--color-ring-bronze)]/30"
                    placeholder="+91..."
                />
                </div>
                <div className="space-y-1 group">
                <label className="text-[var(--color-ring-bronze)] text-[10px] font-black uppercase tracking-[0.3em] ml-1 group-focus-within:text-[var(--color-accent-glow)]">Password</label>
                <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-6 py-4 bg-[var(--color-primary-light)]/5 border border-[var(--color-ring-bronze)]/20 rounded-2xl text-[var(--color-primary-light)] focus:outline-none focus:border-[var(--color-accent-glow)] transition-all font-medium placeholder:text-[var(--color-ring-bronze)]/30"
                    placeholder="••••••••"
                />
                </div>
            </div>

            <button
              type="submit"
              disabled={registerUser.isLoading}
              className="w-full mt-4 bg-[var(--color-accent-glow)] text-[var(--color-primary-dark)] font-black py-5 rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-xl hover:bg-[var(--color-primary-light)] active:scale-[0.98] disabled:opacity-50 group"
            >
              {registerUser.isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-sm">Initialize Profile</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-[var(--color-ring-bronze)] text-xs font-bold uppercase tracking-widest">
            Already registered?{' '}
            <Link href="/login" className="text-[var(--color-primary-light)] hover:text-[var(--color-accent-glow)] underline underline-offset-4 transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}