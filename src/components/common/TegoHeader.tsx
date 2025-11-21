"use client";

import { Clock3, User2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TegoHeader() {
  return (
    <header className="w-full bg-[#111] border-b border-white/10 px-4 sm:px-6 md:px-10 py-3 sm:py-4">
      {/* TOP ROW */}
      <div className="flex items-center justify-between gap-4">
        
        {/* Left - Logo + Desktop Nav */}
        <div className="flex items-center gap-6 sm:gap-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/tegologo.png"          // ⭐ your logo added
              alt="Tego Logo"
              width={42}
              height={42}
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
            />
            <span className="font-semibold text-lg sm:text-xl tracking-tight text-white">
              Tego Live
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="relative text-white hover:text-white/80 transition"
            >
              Video Chat
              <span className="absolute left-0 -bottom-2 h-[3px] w-full rounded-full bg-white" />
            </Link>
            <Link
              href="/blog"
              className="text-white/60 hover:text-white transition"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-white/60 hover:text-white transition"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Right - CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Go Online (primary CTA) */}
          <Link
            href="/go-online"
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-black shadow hover:bg-emerald-300 transition"
          >
            Go Online
          </Link>

          {/* Shop button (desktop only) */}
          <button className="hidden sm:flex items-center gap-2 bg-amber-400 px-4 py-2 rounded-full font-semibold text-black text-sm shadow">
            <span>💎</span>
            Shop
          </button>

          {/* History */}
          <button className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full font-semibold text-black text-sm shadow">
            <Clock3 className="h-4 w-4" />
            History
          </button>

          {/* Profile Icon */}
          <button className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 border border-white/20">
            <User2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      <nav className="mt-3 flex md:hidden items-center justify-center gap-6 text-[11px] text-white/70">
        <Link href="/" className="relative font-medium text-white">
          Video Chat
          <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full bg-white" />
        </Link>
        <Link href="/blog" className="hover:text-white transition-colors">
          Blog
        </Link>
        <Link href="/about" className="hover:text-white transition-colors">
          About
        </Link>
      </nav>
    </header>
  );
}
