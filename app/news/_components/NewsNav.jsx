'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PenLine, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function NewsNav({ showBack = false }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <header className="bg-[#1A0A00] text-white sticky top-0 z-40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-[#FF7A00] font-extrabold text-lg tracking-tight shrink-0">
          <PenLine size={20} />
          WriteMaster
        </Link>

        {/* Centre label */}
        <div className="hidden md:block text-center">
          <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">The Writing World</p>
        </div>

        {/* Right nav */}
        <nav className="flex items-center gap-3 text-sm font-medium">
          {showBack && (
            <Link href="/news" className="text-white/60 hover:text-white transition flex items-center gap-1 text-xs">
              <ArrowLeft size={13} /> News
            </Link>
          )}
          <Link href="/" className="text-white/60 hover:text-white transition hidden md:block text-xs">Home</Link>

          {/* Session-aware section — suppresses hydration warning during loading */}
          {!loading && (
            session ? (
              /* Logged-in state */
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-xs hidden sm:block truncate max-w-[120px]">
                  {session.user?.name || session.user?.email}
                </span>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-xs font-semibold border border-white/20"
                >
                  <LayoutDashboard size={12} /> Dashboard
                </Link>
              </div>
            ) : (
              /* Logged-out state */
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-white/60 hover:text-white transition text-xs">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 bg-[#FF7A00] hover:bg-[#e56d00] text-white rounded-lg transition text-xs font-bold"
                >
                  Join Free
                </Link>
              </div>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
