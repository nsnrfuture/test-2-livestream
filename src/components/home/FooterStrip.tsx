"use client";

export default function FooterStrip() {
  return (
    <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-white/5 to-white/10 px-6 py-4 text-sm text-white/60 ring-1 ring-white/10 md:flex-row">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          🔥 LIVE NOW
        </span>
        <span>Join the conversation happening right now</span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span>Press</span>
        <kbd className="rounded-lg bg-white/10 px-3 py-1.5 font-mono ring-1 ring-white/20">Space</kbd>
        <span>for quick reconnect</span>
      </div>
    </div>
  );
}
