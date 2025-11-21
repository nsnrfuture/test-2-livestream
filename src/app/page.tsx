"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Maximize2, Sparkles, Smile, ChevronDown } from "lucide-react";

const people = [
  { id: 1, name: "David", age: 29, country: "🇺🇸", src: "/avatars/a1.jpg" },
  { id: 2, name: "Ngoc Anh", age: 23, country: "🇻🇳", src: "/avatars/a2.jpg" },
  { id: 3, name: "Jisu", age: 23, country: "🇰🇷", src: "/avatars/a3.jpg" },
  { id: 4, name: "Joshua", age: 25, country: "🇺🇸", src: "/avatars/a4.jpg" },
  { id: 5, name: "Sara", age: 24, country: "🇫🇷", src: "/avatars/a5.jpg" },
  { id: 6, name: "Mia", age: 22, country: "🇧🇷", src: "/avatars/a6.jpg" },
];

export default function HomePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ⭐ Enable Camera
  useEffect(() => {
    async function enableCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
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
  }, []);

  return (
    <main className="min-h-screen bg-[#111] text-white">
      <section className="px-4 py-4 md:px-8 md:py-6">
        <div className="mx-auto max-w-6xl grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">

          {/* LEFT PANEL */}
          <div className="relative bg-black rounded-4xl overflow-hidden border border-white/10 min-h-[420px] md:min-h-[520px]">

            {/* ⭐ Live Camera Preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Top-left Button */}
            <div className="absolute left-4 top-4 flex flex-col gap-3">
              <button className="h-9 w-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition">
                <Maximize2 className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Left-middle fun controls */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              <button className="h-10 w-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition">
                <Sparkles className="h-4 w-4 text-pink-300" />
              </button>
              <button className="h-10 w-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition">
                <Smile className="h-4 w-4 text-amber-300" />
              </button>
            </div>

            {/* Bottom Filters + Start */}
            <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-3 px-4">

              {/* Filters */}
              <div className="flex w-full justify-center gap-3 max-w-xl">
                <button className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm font-medium border border-white/20 shadow">
                  <span className="text-lg">⚧</span>
                  <span>Gender</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <button className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm font-medium border border-white/20 shadow">
                  <span className="text-lg">🌎</span>
                  <span>Country</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Start Button */}
              <button
                className="flex items-center justify-center gap-3 rounded-full bg-white px-8 py-3 text-black font-semibold text-sm shadow-lg"
                onClick={() => router.push("/find-strangers")}
              >
                <div className="-ml-3 flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-white -ml-2 bg-linear-to-tr from-purple-500 to-emerald-400"
                    />
                  ))}
                </div>
                <span>Start Video Chat</span>
              </button>
            </div>
          </div>

          {/* RIGHT PANEL – PEOPLE GRID */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 h-full">
            {people.map((p) => (
              <div
                key={p.id}
                className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 flex flex-col justify-end min-h-[180px]"
              >
                {/* Online Badge */}
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300">
                    Online
                  </span>
                </div>

                <Image
                  src={p.src}
                  alt={p.name}
                  fill
                  className="object-cover opacity-90"
                />

                <div className="relative z-10 bg-linear-to-t from-black/80 via-black/40 to-transparent pt-12 px-3 pb-3">
                  <div className="text-sm font-semibold">
                    <span className="mr-1">{p.country}</span>
                    {p.name}, {p.age}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}
