'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    TrendingUpDown,
    Home, Users, Network, LineChart, Zap,
    MessageSquare, TrendingUp, Compass, Binary, Radio, RefreshCw, LayoutDashboard,
    ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const NAVIGATION_ITEMS = [
    { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'climate', href: '/climate', label: 'Cosmic Climate', icon: <Home size={18} /> },
    { id: 'parliament', href: '/parliament', label: 'Planetary Parliament', icon: <Users size={18} /> },
    { id: 'tension', href: '/tension', label: 'Tension Network', icon: <Network size={18} /> },
    { id: 'evolution', href: '/evolution', label: 'State Evolution', icon: <LineChart size={18} /> },
    { id: 'narrative', href: '/terminal/narrative', label: 'Narrative Engine', icon: <MessageSquare size={18} /> },
    { id: 'market', href: '/market', label: 'Market Overlay', icon: <TrendingUpDown size={18} /> },
];

const POWER_USER_ITEMS = [
    { id: 'vector', href: '/terminal/vector', label: 'Vector Explorer', icon: <Compass size={18} /> },
    { id: 'similar', href: '/terminal/similar', label: 'Similar States', icon: <Binary size={18} /> },
    { id: 'operator', href: '/terminal/operator', label: 'Operator Lab', icon: <Radio size={18} /> },
];

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    
    // Desktop persistent collapse state toggle
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

    const renderLink = (item: typeof NAVIGATION_ITEMS[0]) => {
        const isActive = pathname === item.href;

        return (
            <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full group flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 relative text-left border ${
                    isCollapsed ? 'justify-center gap-0' : 'gap-4'
                } ${isActive
                    ? 'bg-gradient-to-r from-[var(--color-accent-orange)]/10 to-[var(--color-accent-glow)]/[0.02] text-white border-[var(--color-accent-orange)]/20 shadow-[0_4px_20px_rgba(209,122,56,0.05)]'
                    : 'text-white/60 hover:text-white bg-transparent border-transparent hover:bg-white/[0.02]'
                }`}
            >
                {/* Active Structural Left Accent Border Line */}
                {isActive && (
                    <div className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r bg-[var(--color-accent-orange)] shadow-[0_0_8px_var(--color-accent-orange)]" />
                )}

                {/* Dynamic Icon Theme Swapping */}
                <span className={`transition-all duration-300 transform shrink-0 ${isActive
                    ? 'text-[var(--color-accent-orange)] scale-105 filter drop-shadow-[0_0_4px_rgba(209,122,56,0.4)]'
                    : 'text-white/40 group-hover:text-[var(--color-accent-glow)] group-hover:scale-102'
                }`}>
                    {item.icon}
                </span>

                {/* Typography with visibility toggle */}
                <span className={`text-[13px] tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100'
                } ${isActive ? 'font-semibold text-white' : 'font-medium group-hover:text-white/90'}`}>
                    {item.label}
                </span>

                {/* Minimal Right System Anchor Dot Indicator */}
                {isActive && !isCollapsed && (
                    <span className="ml-auto flex h-1 w-1 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-orange)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1 w-1 bg-[var(--color-accent-orange)]"></span>
                    </span>
                )}

                {/* Micro Hover Tooltip Panel strictly when collapsed */}
                {isCollapsed && (
                    <div className="absolute left-[76px] invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-black/95 border border-white/10 text-[10px] font-mono tracking-widest uppercase text-white px-3 py-1.5 rounded-md shadow-2xl transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
                        {item.label}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 h-screen flex flex-col justify-between
                bg-[var(--color-primary-dark)] border-r border-white/[0.04] text-[var(--color-primary-light)]
                transform transition-all duration-500 ease-in-out font-roboto-mono shrink-0
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isCollapsed ? 'md:w-[68px]' : 'md:w-[260px]'} w-[260px]
            `}
            style={{
                backgroundImage: 'linear-gradient(180deg, rgba(10,25,47,0.4) 0%, rgba(0,0,0,0.5) 100%)'
            }}
        >
            {/* Desktop persistent collapsible toggle button trigger handle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex absolute -right-3 top-9 h-6 w-6 items-center justify-center bg-[var(--color-primary-dark)] border border-white/10 text-white/50 hover:text-white rounded-full z-50 shadow-md cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
            >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {/* Identity Branding Header */}
            <div className={`flex flex-col items-center pt-8 pb-5 text-center px-4 shrink-0 transition-all duration-300 ${isCollapsed ? 'pb-2' : ''}`}>
                <div className="relative group mb-2">
                    {/* LUNAR GLOW: Layered shadows for a soft atmospheric bloom */}
                    <div className={`absolute inset-0 rounded-full bg-[var(--color-accent-glow)]/20 blur-[32px] transition-transform duration-700 ease-out ${isCollapsed ? 'scale-75' : 'scale-125 group-hover:scale-150'}`} />
                    <div className="absolute inset-0 rounded-full bg-white/5 blur-[2px]" />

                    <img
                        src="/logo.png"
                        alt="AstroLogics Logo"
                        className={`object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,152,0,0.3)] transition-all duration-300 ${
                            isCollapsed ? 'w-8 h-8' : 'w-24 h-24'
                        }`}
                    />
                </div>

                <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
                    <h1 className="text-base font-black tracking-[0.25em] uppercase text-white font-mono mt-4">
                        AstroLogics
                    </h1>
                    <p className="text-[9px] font-black tracking-[0.2em] uppercase text-[var(--color-ring-bronze)] mt-1.5 opacity-85">
                        Collective State Engine
                    </p>
                </div>
            </div>

            {/* Interactive Navigation List Container */}
            <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-6 custom-scrollbar overflow-x-hidden">
                <nav className="space-y-[3px]">
                    {NAVIGATION_ITEMS.map(renderLink)}
                </nav>

                {/* Clean System Grid Divider */}
                <div className="border-t border-white/[0.05] mx-3" />

                <div>
                    <h3 className={`px-4 text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 mb-2 font-mono transition-opacity duration-300 ${
                        isCollapsed ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'
                    }`}>
                        Power User
                    </h3>
                    <nav className="space-y-[3px]">
                        {POWER_USER_ITEMS.map(renderLink)}
                    </nav>
                </div>
            </div>

            {/* Footer System Identity Block */}
            <div className={`border-t border-white/[0.03] bg-black/15 shrink-0 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                <div className={`flex items-center bg-white/[0.01] border border-white/[0.02] rounded-xl transition-all duration-300 ${
                    isCollapsed ? 'justify-center p-1' : 'justify-between px-2 py-1'
                }`}>
                    <div className="flex items-center gap-3">
                        {/* Dynamic Avatar Node */}
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary-light)]/5 border border-white/10 text-[10px] font-black text-[var(--color-accent-orange)] overflow-hidden shrink-0">
                            {status === 'loading' ? (
                                <RefreshCw size={12} className="animate-spin text-white/30" />
                            ) : session?.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'User Profile'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>
                                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'G'}
                                </span>
                            )}

                            {/* Status System Tracker Orb */}
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[var(--color-primary-dark)] shadow-[0_0_6px_rgba(52,211,153,0.6)] ${
                                status === 'loading' ? 'bg-amber-400' : session ? 'bg-emerald-400' : 'bg-rose-500'
                            }`} />
                        </div>

                        {/* Identity Strings Grid (hidden dynamically when collapsed) */}
                        <div className={`flex flex-col transition-all duration-300 overflow-hidden whitespace-nowrap ${
                            isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100'
                        }`}>
                            <p className="text-[11px] font-black text-white uppercase tracking-wider max-w-[130px] truncate">
                                {status === 'loading'
                                    ? 'FETCHING CORE...'
                                    : session?.user?.name
                                        ? session.user.name
                                        : 'GUEST // OPERATOR'
                                }
                            </p>
                            <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.15em] -mt-0.5">
                                {session?.user?.lagna
                                    ? `${session.user.lagna} LAGNA`
                                    : 'LAGNA // UNCALIBRATED'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}