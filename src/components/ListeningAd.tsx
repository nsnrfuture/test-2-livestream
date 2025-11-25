"use client";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

export function ListeningAd() {
  const [muted, setMuted] = useState(true);

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl bg-[#0f0f14] border border-white/10 p-3 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-white/70">
          Sponsored
        </span>
        <span className="text-[10px] bg-blue-600 px-2 py-1 rounded-full text-white font-semibold">
          Listening Ad
        </span>
      </div>

      {/* Video Frame */}
      <div className="relative aspect-9/16 rounded-xl overflow-hidden bg-black">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white/40">
          <Play className="h-12 w-12 opacity-60" />
          <p className="text-xs mt-2">Brand Video Preview</p>
        </div>

        {/* Reward Badge */}
        <div className="absolute top-2 left-2 bg-green-500 px-2 py-1 text-[10px] text-black font-semibold rounded-full">
          +20 Coins
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-10 inset-x-4">
          <div className="flex justify-between text-[10px] text-white/80">
            <span>0:03</span>
            <span>0:15</span>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full mt-1">
            <div className="h-full w-[40%] bg-green-400 rounded-full"></div>
          </div>
        </div>

        {/* CTA + Mute */}
        <div className="absolute bottom-2 inset-x-2 flex gap-2">
          <button className="flex-1 bg-green-400 text-black py-1.5 text-xs font-semibold rounded-lg">
            Learn More
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className="bg-white/20 p-2 rounded-lg"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-white/50 mt-2">
        Complete listening to claim your reward.
      </p>
    </div>
  );
}
