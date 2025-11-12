"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SwipeStack from "@/components/SwipeStack";
import MatchButton from "@/components/MatchButton";

// Enhanced accent palette with gradients
const ACCENT = {
  primary: "#6C5CE7",
  primaryDark: "#5b4ed2",
  secondary: "#00CEC9",
  glow: "rgba(108,92,231,0.35)",
  glowSecondary: "rgba(0,206,201,0.25)",
  textOnPrimary: "#ffffff",
  gradient: "linear-gradient(135deg, #6C5CE7 0%, #00CEC9 100%)",
};

type Status = "idle" | "pairing" | "waiting" | "paired" | "error";

// Ask cam/mic early so the prompt appears here, not on the call screen
async function preflightPermissions() {
  if (!navigator?.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach((t) => t.stop());
  } catch {
    // user denied or no device — we'll handle again on the call page
  }
}

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const uid = useMemo(() => Math.floor(Math.random() * 10_000_000), []);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const clearPoll = () => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  };

  const cancelWaiting = useCallback(async () => {
    clearPoll();
    setStatus("idle");
    try {
      await fetch("/api/match/leave", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uid }),
      }).catch(() => {});
    } catch {}
  }, [uid]);

  const pollOnce = useCallback(async () => {
    try {
      const again = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const result = await again.json().catch(() => ({}));
      if (result.status === "paired" && result.channel) {
        clearPoll();
        if (!isMounted.current) return;
        setStatus("paired");
        router.push(`/call/${result.channel}?uid=${uid}`);
        return;
      }

      if (status === "waiting" && isMounted.current) {
        const delay = 2500 + Math.floor(Math.random() * 1000);
        pollTimer.current = setTimeout(pollOnce, delay);
      }
    } catch (e: any) {
      if (!isMounted.current) return;
      setStatus("error");
      setErrorMsg(e?.message || "Something went wrong while pairing.");
    }
  }, [router, status, uid]);

  const tryPair = useCallback(async () => {
    clearPoll();
    setErrorMsg(null);
    setStatus("pairing");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();

      if (data.status === "paired" && data.channel) {
        setStatus("paired");
        router.push(`/call/${data.channel}?uid=${uid}`);
        return;
      }

      if (data.status === "waiting") {
        setStatus("waiting");
        pollTimer.current = setTimeout(pollOnce, 1000);
        return;
      }

      setStatus("error");
      setErrorMsg(data?.error || "Unable to pair right now.");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message || "Network error. Please try again.");
    }
  }, [pollOnce, router, uid]);

  useEffect(() => {
    preflightPermissions();
    return () => {
      isMounted.current = false;
      clearPoll();
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Enhanced gradient background with more depth */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: `
            radial-gradient(1400px 900px at 5% 5%, rgba(108,92,231,0.25), transparent 70%),
            radial-gradient(1200px 700px at 95% 15%, rgba(0,206,201,0.20), transparent 65%),
            radial-gradient(800px 500px at 30% 80%, rgba(253,203,110,0.15), transparent 55%),
            linear-gradient(to bottom right, #0b1020, #0a0e1a, #0b0f1a)
          `,
        }}
      />

      {/* Animated floating blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-[rgba(108,92,231,0.35)] blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-[320px] rounded-full bg-[rgba(0,206,201,0.25)] blur-3xl animate-float-medium" />
      <div className="pointer-events-none absolute top-1/2 -left-12 h-[200px] w-[200px] rounded-full bg-[rgba(253,203,110,0.15)] blur-3xl animate-float-fast" />

      {/* Animated grid overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </div>

      {/* Center card */}
      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-20">
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
          {/* Animated glow ring */}
          <div
            className="pointer-events-none absolute -inset-1 rounded-[28px] opacity-60"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${ACCENT.primary}, ${ACCENT.secondary}, ${ACCENT.primary}, transparent)`,
              animation: "rotateGlow 4s linear infinite",
            }}
          />
          <div className="pointer-events-none absolute -inset-1 rounded-[28px] bg-black/20" />

          {/* Header */}
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs tracking-[0.2em] text-white/60">LIVE CONNECTION READY</p>
              </div>
              <h1 className="mt-4 bg-linear-to-br from-white to-white/80 bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl">
                Discover Meaningful Conversations with Strangers Worldwide
              </h1>
              <p className="mt-4 max-w-xl text-lg text-white/70 leading-relaxed">
                Experience the thrill of spontaneous connection. Our intelligent matching pairs you with 
                like-minded individuals for authentic, one-on-one video conversations. No filters, no followers—just real human moments.
              </p>
            </div>

            <StatusPill status={status} />
          </div>

          {/* Content grid */}
          <div className="mt-12 grid items-center gap-12 md:grid-cols-[1.1fr_.9fr]">
            {/* Left: Enhanced swipe zone */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-3xl opacity-60 mask-[radial-gradient(white,transparent_70%)]">
                <div className="animate-pulse-slow absolute inset-0 rounded-3xl ring-2 ring-white/20" />
              </div>

              <div className="relative rounded-3xl bg-linear-to-br from-white/5 to-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm md:p-6">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white/5 px-4 py-1 text-xs text-white/60 backdrop-blur-sm">
                  Swipe to Connect
                </div>
                <SwipeStack onSwipeUp={tryPair} />
              </div>

              {/* Enhanced swipe hint */}
              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/50 animation-delay-0" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/50 animation-delay-150" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/50 animation-delay-300" />
                </div>
                <p className="text-sm text-white/50">Swipe up for instant connection</p>
              </div>
            </div>

            {/* Right: Enhanced action section */}
            <div className="flex flex-col items-center justify-center md:items-start">
              {/* Premium call CTA */}
              <div className="relative">
                {/* Enhanced pulsing rings */}
                <span className="absolute -inset-8 rounded-full bg-[rgba(108,92,231,0.15)] blur-2xl" />
                <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[rgba(108,92,231,0.4)] animate-pulseRing" />
                <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[rgba(0,206,201,0.3)] animate-pulseRing animation-delay-1000" />

                <MatchButton
                  onClick={status === "waiting" ? cancelWaiting : tryPair}
                  className={`relative z-10 min-w-60 rounded-full px-10 py-5 text-lg font-semibold shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                    status === "waiting"
                      ? "bg-linear-to-r from-white/10 to-white/5 text-white hover:from-white/15 hover:to-white/10 border border-white/20"
                      : "bg-linear-to-r from-[#6C5CE7] to-[#00CEC9] text-white shadow-[0_0_40px_rgba(108,92,231,0.4)] hover:shadow-[0_0_60px_rgba(108,92,231,0.6)]"
                  }`}
                >
                  <span className="drop-shadow-sm">
                    {status === "idle" && "🚀 Start Connecting"}
                    {status === "pairing" && "✨ Finding Your Match..."}
                    {status === "waiting" && "⏳ Cancel Search"}
                    {status === "paired" && "🎉 Connecting..."}
                    {status === "error" && "🔄 Try Again"}
                  </span>
                </MatchButton>
              </div>

              {/* Enhanced status helper text */}
              <div className="mt-6 text-center text-base text-white/70 md:text-left">
                {status === "idle" && (
                  <p className="leading-relaxed">
                    <span className="text-white/90">Ready to meet someone amazing?</span><br />
                    Join thousands having genuine conversations right now.
                  </p>
                )}
                {status === "pairing" && (
                  <p className="flex items-center justify-center gap-2 md:justify-start">
                    <span className="animate-spin">⏳</span>
                    Scanning our global network for your perfect match...
                  </p>
                )}
                {status === "waiting" && (
                  <p className="leading-relaxed">
                    <span className="text-white/90">You're in the queue!</span><br />
                    Average wait time: <span className="text-emerald-300">under 30 seconds</span>
                  </p>
                )}
                {status === "paired" && (
                  <p className="text-emerald-300">
                    🎊 Match found! Preparing your private room...
                  </p>
                )}
                {status === "error" && (
                  <p className="text-rose-300">
                    {errorMsg || "Temporary glitch. The universe wants you to try again!"}
                  </p>
                )}
              </div>

              {/* Enhanced trust badges */}
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm text-white/50">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span>100% Anonymous • No personal data stored</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span>End-to-end encrypted • Your privacy protected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span>Global community • Real people, real conversations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced footer strip */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-white/5 to-white/10 px-6 py-4 text-sm text-white/60 ring-1 ring-white/10 md:flex-row">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                🔥 LIVE NOW
              </span>
              <span>Join the conversation happening right now</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span>Press</span>
              <kbd className="rounded-lg bg-white/10 px-3 py-1.5 font-mono ring-1 ring-white/20">
                Space
              </kbd>
              <span>for quick reconnect</span>
            </div>
          </div>
        </div>
      </section>

      {/* Global animations */}
      <style jsx>{`
        @keyframes rotateGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          70% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, -20px) rotate(180deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, 15px) rotate(90deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(10px, -10px) rotate(45deg); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-pulseRing { animation: pulseRing 3s ease-out infinite; }
      `}</style>
    </main>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map = {
    idle: { text: "Ready to Connect", dot: "bg-emerald-400", icon: "⚡" },
    pairing: { text: "Finding Match", dot: "bg-amber-400", icon: "✨" },
    waiting: { text: "In Queue", dot: "bg-sky-400", icon: "⏳" },
    paired: { text: "Connecting", dot: "bg-emerald-400", icon: "🎉" },
    error: { text: "Needs Retry", dot: "bg-rose-400", icon: "🔄" },
  } as const;

  const { text, dot, icon } = map[status] ?? map.idle;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-linear-to-r from-white/5 to-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur-sm">
      <span className="text-lg">{icon}</span>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot} animate-ping`} />
        <span className={`h-2 w-2 rounded-full ${dot}`} />
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}