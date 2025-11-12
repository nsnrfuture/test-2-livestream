"use client";
import SwipeStack from "@/components/SwipeStack";

export default function SwipePanel({ onSwipeUp }: { onSwipeUp: () => void }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-4 rounded-3xl opacity-60 mask-[radial-gradient(white,transparent_70%)]">
        <div className="animate-pulse-slow absolute inset-0 rounded-3xl ring-2 ring-white/20" />
      </div>

      <div className="relative rounded-3xl bg-linear-to-br from-white/5 to-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm md:p-6">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white/5 px-4 py-1 text-xs text-white/60 backdrop-blur-sm">
          Swipe to Connect
        </div>
        <SwipeStack onSwipeUp={onSwipeUp} />
      </div>

      {/* swipe hint */}
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
        </div>
        <p className="text-sm text-white/50">Swipe up for instant connection</p>
      </div>
    </div>
  );
}
