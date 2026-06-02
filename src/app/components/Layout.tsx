'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';



export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [time, setTime] = useState('');

    useEffect(() => {
        // Helper to format time
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }));
        };

        // Update immediately on mount
        updateTime();

        // Set interval to update every minute (or change to 1000 for seconds)
        const timer = setInterval(updateTime, 60000);

        return () => clearInterval(timer);
    }, []);
    return (
        <>
            <div className="min-h-screen bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] font-sans flex overflow-hidden w-screen h-screen selection:bg-[var(--color-accent-orange)] selection:text-white">

                {/* 1. Persistent Left Navigation Column */}
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                {/* 2. Main Terminal Content Area Wrapper */}
                <div className="flex-1 flex flex-col min-w-0 relative h-full">

                    {/* Ambient Top-Right Backdrop Atmosphere Glow Layer */}
                    <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-[var(--color-accent-glow)]/5 blur-[130px] rounded-full pointer-events-none z-0" />

                    {/* 3. System Command Header Control Bar */}
                    <header className="h-16 border-b border-white/[0.04] bg-black/10 px-6 flex items-center justify-between relative z-10 backdrop-blur-md shrink-0">

                        {/* Left Side: Current State Intelligence Session Info */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-[var(--color-accent-orange)]/10 border border-[var(--color-accent-orange)]/20 px-2.5 py-1 rounded-md">
                                <span className="h-2 w-2 rounded-full bg-[var(--color-accent-orange)] shadow-[0_0_8px_var(--color-accent-orange)] animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent-orange)]">
                                    LIVE SESSION
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-wider text-white">
                                    STRUCTURED EXPANSION
                                </span>
                                <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] mt-0.5">
                                    ENGINE ID // SEC-01
                                </span>
                            </div>
                        </div>

                        {/* Right Side: High-Density Telemetry Master Clock */}
                        <div className="flex items-center gap-4 border-l border-white/[0.06] pl-4 h-8">
                            <div className="flex flex-col text-right">
                                <span className="text-sm font-black uppercase tracking-wide text-white">
                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).toUpperCase()}
                                </span>
                                <div className="flex items-center justify-end gap-1.5 mt-0.5">

                                    <span className="text-[10px] font-black text-white/50 tracking-wider">
                                        {time || '--:-- --'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </header>
                    {/* 4. Secondary Frame Window Container (The High-Contrast Workspace) */}
                    <main className="flex-1 overflow-hidden relative p-3 md:p-5 z-10">
                        <div
                            className="w-full h-full bg-[var(--color-primary-light)] rounded-[24px] shadow-2xl relative border border-white/20 overflow-hidden flex flex-col text-[var(--color-primary-dark)]"
                        >
                            {/* Fine systemic matte texture canvas layer */}
                            <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />

                            {/* Dynamic Content Frame Port - Page Components Render Right Here */}
                            <div className="relative z-10 flex-1 h-full w-full overflow-y-auto custom-scrollbar p-6">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>

                {/* Floating System Menu Toggle Button for Mobile Responsive Breaks */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="md:hidden fixed bottom-6 right-6 w-12 h-12 bg-[var(--color-accent-orange)] text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-transform active:scale-95"
                >
                    <span className="text-xs font-mono font-bold">MENU</span>
                </button>

            </div>
        </>
    );
}