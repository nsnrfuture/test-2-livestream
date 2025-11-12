"use client";
import { Status } from "@/components/ACCENT";
import { ACCENT } from "@/components/ACCENT";
import MatchButton from "@/components/MatchButton";

type Props = {
  status: Status;
  errorMsg?: string | null;
  onTryPair: () => void;
  onCancel: () => void;
};

export default function ActionSection({
  status,
  errorMsg,
  onTryPair,
  onCancel,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center md:items-start">
      <div className="relative">
        {/* pulsing rings */}
        <span className="absolute -inset-8 rounded-full" style={{ background: "rgba(108,92,231,0.15)" }} />
        <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[rgba(108,92,231,0.4)] animate-pulseRing" />
        <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[rgba(0,206,201,0.3)] animate-pulseRing [animation-delay:1000ms]" />

        <MatchButton
          onClick={status === "waiting" ? onCancel : onTryPair}
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

      {/* helper text */}
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
          <p className="text-emerald-300">🎊 Match found! Preparing your private room...</p>
        )}
        {status === "error" && (
          <p className="text-rose-300">
            {errorMsg || "Temporary glitch. The universe wants you to try again!"}
          </p>
        )}
      </div>

      {/* trust badges */}
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
  );
}
