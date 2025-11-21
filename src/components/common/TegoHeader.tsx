"use client";

import { useState } from "react";
import { Clock3, User2, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TegoHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-[#111] border-b border-white/10 px-4 sm:px-6 md:px-10 py-3 sm:py-4">
      {/* TOP ROW */}
      <div className="flex items-center justify-between gap-4">
        
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/tegologo.png"
              alt="Tego Logo"
              width={42}
              height={42}
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
            />
            <span className="font-semibold text-lg sm:text-xl tracking-tight text-white">
              Tego Live
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-white hover:text-white/80 transition relative">
            Video Chat
            <span className="absolute left-0 -bottom-2 h-[3px] w-full rounded-full bg-white" />
          </Link>
          <Link href="/blog" className="text-white/60 hover:text-white transition">
            Blog
          </Link>
          <Link href="/about" className="text-white/60 hover:text-white transition">
            About
          </Link>
        </nav>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center gap-3">
          {/* Go Online (primary CTA) */}
          <Link
            href="/go-online"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-emerald-300 transition"
          >
            Go Online
          </Link>

          {/* Profile Icon */}
          <button className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-white/10 border border-white/20">
            <User2 className="h-5 w-5 text-white/80" />
          </button>

          {/* MOBILE HAMBURGER MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-white/10 border border-white/20"
          >
            {open ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {open && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10 animate-slideDown">
          <nav className="flex flex-col gap-4 mt-4 text-sm text-white/80 px-2">
            
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-white font-semibold py-2 px-3 rounded-lg bg-white/10"
            >
              Video Chat
            </Link>

            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/10 transition"
            >
              Blog
            </Link>

            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/10 transition"
            >
              About
            </Link>

            <Link
              href="/go-online"
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded-lg bg-emerald-400 text-black font-semibold text-sm text-center"
            >
              Go Online
            </Link>

            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 px-3 bg-white/10 rounded-lg"
            >
              <Clock3 className="h-4 w-4" />
              History
            </button>

            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 px-3 bg-white/10 rounded-lg"
            >
              <User2 className="h-4 w-4" />
              Profile
            </button>

          </nav>
        </div>
      )}

      {/* Animation CSS */}
      <style jsx>{`
        .animate-slideDown {
          animation: slideDown 0.3s ease forwards;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
