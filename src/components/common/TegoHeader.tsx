"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Clock3, User2, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase"; // 👈 adjust if your path is different

type SupaUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string | null;
  };
};

export default function TegoHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  // 👇 Decide what to show as display name
  const displayName = useMemo(() => {
    const name = user?.user_metadata?.full_name?.trim();
    if (name) return name;
    if (user?.email) return user.email;
    return "Profile";
  }, [user]);

  /* ---------------- Auth listener (Supabase) ---------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) {
          setUser(user as SupaUser | null);
        }
      } catch (err) {
        console.error("Error loading user", err);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as SupaUser | null) ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  /* ---------------- Logout handler ---------------- */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <header className="w-full bg-[#111] border-b border-white/10 px-4 sm:px-6 md:px-10 py-3 sm:py-4">
      {/* TOP ROW */}
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
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

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium relative">
          {/* VIDEO CHAT */}
          <Link
            href="/"
            className={`relative transition ${
              isActive("/")
                ? "text-white"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Video Chat
            {isActive("/") && (
              <span className="absolute left-0 -bottom-2 h-[3px] w-full rounded-full bg-white transition-all" />
            )}
          </Link>

          {/* PRICING */}
          <Link
            href="/earning"
            className={`relative transition ${
              isActive("/earning")
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Earning
            {isActive("/earning") && (
              <span className="absolute left-0 -bottom-2 h-[3px] w-full rounded-full bg-white transition-all" />
            )}
          </Link>

          {/* ABOUT */}
          <Link
            href="/about"
            className={`relative transition ${
              isActive("/about")
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            About
            {isActive("/about") && (
              <span className="absolute left-0 -bottom-2 h-[3px] w-full rounded-full bg-white transition-all" />
            )}
          </Link>
        </nav>

        {/* RIGHT SIDE CTA */}
        <div className="flex items-center gap-3">
          {/* Go Online (only show when logged in) */}
          {user && (
            <Link
              href="/go-online"
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-emerald-300 transition"
            >
              Go Online
            </Link>
          )}

          {/* If still loading auth */}
          {authLoading ? (
            <div className="hidden sm:flex h-10 min-w-20 items-center justify-center rounded-full bg-white/5 text-xs text-white/40">
              Checking...
            </div>
          ) : user ? (
            /* LOGGED IN: show name/email + logout */
            <>
              <button
                type="button"
                onClick={() => router.push("/profile")} // 👈 click -> profile
                className="hidden sm:flex items-center justify-center h-10 rounded-full bg-white/10 border border-white/20 px-3 text-xs text-white/80 max-w-40 truncate"
              >
                <User2 className="h-4 w-4 mr-1.5" />
                <span className="truncate">{displayName}</span>
              </button>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-red-400/60 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            </>
          ) : (
            /* LOGGED OUT: show Sign in / Sign up */
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow hover:bg-white/90 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Sign up
              </Link>
            </>
          )}

          {/* MOBILE MENU BUTTON */}
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

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10 animate-slideDown">
          <nav className="flex flex-col gap-4 mt-4 text-sm text-white/80 px-2">
            {/* VIDEO CHAT */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={`py-2 px-3 rounded-lg ${
                isActive("/")
                  ? "bg-white/10 text-white font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              Video Chat
            </Link>

            {/* PRICING */}
            <Link
              href="/earning"
              onClick={() => setOpen(false)}
              className={`py-2 px-3 rounded-lg ${
                isActive("/earning")
                  ? "bg-white/10 text-white font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              Earning
            </Link>

            {/* ABOUT */}
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className={`py-2 px-3 rounded-lg ${
                isActive("/about")
                  ? "bg-white/10 text-white font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              About
            </Link>

            {/* If logged in: Go Online, History, Profile (with name/email), Logout */}
            {user ? (
              <>
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
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/profile"); // 👈 mobile: profile redirect
                  }}
                  className="flex items-center gap-2 py-2 px-3 bg-white/10 rounded-lg"
                >
                  <User2 className="h-4 w-4" />
                  <span className="truncate">{displayName}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="mt-1 py-2 px-3 rounded-lg bg-red-500/80 text-white font-semibold text-sm text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              /* If logged OUT in mobile */
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="py-2 px-3 rounded-lg bg-white text-black font-semibold text-sm text-center"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="py-2 px-3 rounded-lg border border-white/30 text-white font-semibold text-sm text-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Animation */}
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
