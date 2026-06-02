'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { UserCircle, LogOut, Loader2 } from "lucide-react";
// ==========================================================================================
export default function Navbar() {
  // ==========================================================================================

  const { data: session, status } = useSession();
  // ==========================================================================================

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-ring-bronze)]/20 bg-[var(--bg-main)] bg-opacity-80 backdrop-blur-md text-[var(--text-main)] transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[var(--color-accent-orange)] to-[var(--color-accent-glow)] transition-transform group-hover:scale-105">
            <Image
              src="/astrologics_logo.png"
              alt="Astrologics logo"
              width={50}
              height={50}
              className="rounded-full object-contain bg-[var(--bg-main)]"
            />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[var(--color-accent-orange)]">
            Astrologics
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          {status === "loading" && (
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-accent-glow)]" />
          )}

          {status === "unauthenticated" && (
            <div className="flex items-center space-x-5">
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-accent-orange)] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-[var(--brand-gradient)] text-[var(--color-primary-light)] px-5 py-2.5 rounded-full transition shadow-md hover:shadow-lg hover:brightness-110 active:scale-95"
              >
                Register
              </Link>
            </div>
          )}

          {status === "authenticated" && session.user && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-[var(--color-primary-light)]/10 border border-[var(--color-accent-glow)]/30 px-4 py-1.5 rounded-full shadow-sm">
                <UserCircle className="w-5 h-5 text-[var(--color-accent-orange)]" />
                <span className="text-sm font-semibold text-[var(--text-main)]">
                  {session.user.name || session.user.email}
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-accent-orange)] transition-all group"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>



    </header>
  );
}
// ==========================================================================================



