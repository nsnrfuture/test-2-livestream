"use client";
import { ReactNode } from "react";

export default function GradientScene({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Depthy gradient background */}
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

      {/* Floating blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-[rgba(108,92,231,0.35)] blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-[320px] rounded-full bg-[rgba(0,206,201,0.25)] blur-3xl animate-float-medium" />
      <div className="pointer-events-none absolute top-1/2 -left-12 h-[200px] w-[200px] rounded-full bg-[rgba(253,203,110,0.15)] blur-3xl animate-float-fast" />

      {/* Grid overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]">
        <div
          className="h-full w-full animate-gridMove"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {children}
    </main>
  );
}
