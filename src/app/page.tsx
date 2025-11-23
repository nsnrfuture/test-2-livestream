"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Maximize2,
  Sparkles,
  Smile,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Status } from "@/components/ACCENT";
import { supabase } from "@/lib/supabaseClient";

const people = [
  {
    id: 1,
    name: "David",
    age: 29,
    country: "🇺🇸",
    src: "/avatars/a1.jpg",
  },
  {
    id: 2,
    name: "Ngoc Anh",
    age: 23,
    country: "🇻🇳",
    src: "/avatars/a2.jpg",
  },
  {
    id: 3,
    name: "Jisu",
    age: 23,
    country: "🇰🇷",
    src: "/avatars/a3.jpg",
  },
  {
    id: 4,
    name: "Joshua",
    age: 25,
    country: "🇺🇸",
    src: "/avatars/a4.jpg",
  },
  {
    id: 5,
    name: "Sara",
    age: 24,
    country: "🇫🇷",
    src: "/avatars/a5.jpg",
  },
  {
    id: 6,
    name: "Mia",
    age: 22,
    country: "🇧🇷",
    src: "/avatars/a6.jpg",
  },
];

const features = [
  { icon: Maximize2, label: "HD Video Quality", description: "Crystal clear video calls" },
  { icon: Sparkles, label: "Fun Effects", description: "Add playful vibes to chats" },
  { icon: Smile, label: "Real People", description: "Verified users worldwide" },
  { icon: ChevronDown, label: "Smart Filters", description: "Match by interest & region" },
];

function statusLabel(status: Status) {
  switch (status) {
    case "idle":
      return "Ready to connect";
    case "pairing":
      return "Connecting…";
    case "waiting":
      return "Searching for a stranger…";
    case "paired":
      return "Found a match!";
    case "error":
      return "Something went wrong";
    default:
      return "";
  }
}

export default function HomePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [onlineCount, setOnlineCount] = useState(15234);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Unique uid for matching API
  const uid = useMemo(() => Math.floor(Math.random() * 10_000_000), []);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const clearPoll = () => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  };

  // ❌ OLD PROTECT PAGE useEffect HATA DIYA
  // useEffect(() => {
  //   async function checkAuth() {
  //     const { data } = await supabase.auth.getUser();
  //     if (!data?.user) {
  //       router.push("/auth");
  //     }
  //   }
  //   checkAuth();
  // }, [router]);

  const pollOnce = useCallback(async () => {
    try {
      const again = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const result = await again.json().catch(() => ({} as any));
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

    // ✅ CLICK PAR AUTH CHECK
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth check error:", error);
    }

    if (!data?.user) {
      // user NOT logged in → auth page
      router.push("/signup");
      return;
    }

    // user logged in → proceed with pairing
    setStatus("pairing");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const dataRes = await res.json();

      if (dataRes.status === "paired" && dataRes.channel) {
        setStatus("paired");
        router.push(`/call/${dataRes.channel}?uid=${uid}`);
        return;
      }

      if (dataRes.status === "waiting") {
        setStatus("waiting");
        pollTimer.current = setTimeout(pollOnce, 1000);
        return;
      }

      setStatus("error");
      setErrorMsg(dataRes?.error || "Unable to pair right now.");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message || "Network error. Please try again.");
    }
  }, [pollOnce, router, uid]);

  // Camera + fake online count
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function enableCam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }

    enableCam();

    // Simulate online count updates
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 10 - 5));
    }, 3000);

    return () => {
      clearInterval(interval);
      isMounted.current = false;
      clearPoll();
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const isBusy = status === "pairing" || status === "waiting";

  // All avatar circle gradients tuned to TEGO theme
  const gradientColors = [
    "from-[#8B3DFF] to-[#4F46E5]",
    "from-[#4F46E5] to-[#22C55E]",
    "from-[#22C55E] to-[#8B3DFF]",
    "from-[#4F46E5] to-[#22C55E]",
    "from-[#8B3DFF] to-[#22C55E]",
  ];

  return (
    <main className="min-h-screen bg-[#050814] text-white overflow-x-hidden">
      {/* Ambient glow effects in TEGO theme */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#8B3DFF33] via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-[#22C55E22] via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3" />
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-xl border border-[#22C55E55]">
              <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse shadow-lg shadow-[#22C55E77]" />
              <span className="text-sm font-semibold text-[#BBF7D0]">
                {onlineCount.toLocaleString()} Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-white via-[#E5E7EB] to-[#A5B4FC] bg-clip-text text-transparent">
              Meet New People Instantly
            </h2>
            <p className="text-lg md:text-xl text-[#E5E7EB]/80 max-w-2xl mx-auto">
              Start random video chats with strangers from around the world. Safe, fun, and completely free.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] mb-12">
            {/* LEFT PANEL - Video Preview */}
            <div className="relative bg-linear-to-br from-[#020617] via-[#020617] to-[#020617] rounded-3xl overflow-hidden border border-[#4F46E5]/40 shadow-2xl shadow-[#4F46E533] min-h-[500px] md:min-h-[600px]">
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-linear-to-tr from-[#8B3DFF0F] via-transparent to-[#22C55E1A] pointer-events-none" />

              {/* Live Camera Preview */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Top-left Button */}
              <div className="absolute left-4 top-4 flex flex-col gap-3 z-10">
                <button className="h-11 w-11 rounded-2xl bg-black/40 backdrop-blur-xl border border-[#8B3DFF55] flex items-center justify-center hover:bg-[#111827] hover:border-[#8B3DFFAA] transition-all duration-300 shadow-lg hover:shadow-[#8B3DFF66]">
                  <Maximize2 className="h-5 w-5 text-[#E0E7FF]" />
                </button>
              </div>

              {/* Left-middle fun controls */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
                <button className="h-12 w-12 rounded-2xl bg-linear-to-br from-[#8B3DFF33] to-[#4F46E533] backdrop-blur-xl border border-[#8B3DFF66] flex items-center justify-center hover:from-[#8B3DFF55] hover:to-[#4F46E555] transition-all duration-300 shadow-lg hover:shadow-[#8B3DFF66]">
                  <Sparkles className="h-5 w-5 text-[#F9A8FF]" />
                </button>
                <button className="h-12 w-12 rounded-2xl bg-linear-to-br from-[#22C55E33] to-[#4ADE8033] backdrop-blur-xl border border-[#22C55E66] flex items-center justify-center hover:from-[#22C55E55] hover:to-[#4ADE8055] transition-all duration-300 shadow-lg hover:shadow-[#22C55E66]">
                  <Smile className="h-5 w-5 text-[#BBF7D0]" />
                </button>
              </div>

              {/* Bottom Filters + Start */}
              <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 px-4 z-10">
                {/* Filters (UI only for now) */}
                <div className="flex w-full justify-center gap-3 max-w-xl flex-wrap">
                  <button className="flex items-center gap-2 rounded-2xl bg-black/50 backdrop-blur-xl px-5 py-3 text-sm font-medium border border-[#8B3DFF66] shadow-lg hover:bg-[#111827] hover:border-[#8B3DFFAA] transition-all duration-300">
                    <span className="text-lg">⚧</span>
                    <span className="text-[#E5E7EB]">Gender</span>
                    <ChevronDown className="h-4 w-4 text-[#C7D2FE]" />
                  </button>

                  <button className="flex items-center gap-2 rounded-2xl bg-black/50 backdrop-blur-xl px-5 py-3 text-sm font-medium border border-[#22C55E66] shadow-lg hover:bg-[#022C22] hover:border-[#22C55EAA] transition-all duration-300">
                    <span className="text-lg">🌎</span>
                    <span className="text-[#E5E7EB]">Country</span>
                    <ChevronDown className="h-4 w-4 text-[#6EE7B7]" />
                  </button>
                </div>

                {/* Start Button – now uses pairing logic + auth check */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    className={`group flex items-center justify-center gap-3 rounded-2xl px-10 py-4 font-bold text-base shadow-2xl hover:shadow-[#4F46E5DD] transition-all duration-300 ${
                      isBusy
                        ? "bg-[#4B5563] cursor-not-allowed opacity-80 shadow-none"
                        : "bg-linear-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E] hover:scale-[1.02] shadow-[#4F46E5AA]"
                    }`}
                    onClick={tryPair}
                    disabled={isBusy}
                  >
                    <div className="-ml-3 flex">
                      {gradientColors.map((color, i) => (
                        <div
                          key={i}
                          className={`h-8 w-8 rounded-full border-2 border-white -ml-2 bg-linear-to-tr ${color} shadow-lg shadow-black/40`}
                        />
                      ))}
                    </div>
                    <span className="text-white">
                      {status === "idle" && "Start Video Chat"}
                      {status === "pairing" && "Connecting…"}
                      {status === "waiting" && "Searching for a stranger…"}
                      {status === "error" && "Try Again"}
                      {status === "paired" && "Connecting to Call…"}
                    </span>
                  </button>

                  <p className="text-xs text-white/70">
                    Status: <span className="font-medium">{statusLabel(status)}</span>
                  </p>
                  {errorMsg && (
                    <p className="text-xs text-red-300 text-center max-w-xs">
                      {errorMsg}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL – PEOPLE GRID */}
            <div className="grid grid-cols-2 gap-4 h-full">
              {people.map((p) => (
                <div
                  key={p.id}
                  className="group relative rounded-2xl overflow-hidden bg-linear-to-br from-[#020617] to-[#020617] border border-[#4F46E5]/30 hover:border-[#8B3DFF]/60 shadow-lg hover:shadow-[#4F46E566] flex flex-col justify-end min-h-[200px] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  {/* Online Badge */}
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1.5 border border-[#22C55E88] z-10">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse shadow-lg shadow-[#22C55E99]" />
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[#BBF7D0] font-semibold">
                      Online
                    </span>
                  </div>

                  <img
                    src={p.src}
                    alt={p.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />

                  <div className="relative z-10 bg-linear-to-t from-black/90 via-black/60 to-transparent pt-16 px-3 pb-3">
                    <div className="text-sm font-semibold text-white/95 group-hover:text-white transition-colors">
                      <span className="mr-1.5">{p.country}</span>
                      {p.name}, {p.age}
                    </div>
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-tr from-[#8B3DFF1A] via-transparent to-[#22C55E1A] pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
