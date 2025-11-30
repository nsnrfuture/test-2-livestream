"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

type SelfPromoAdProps = {
  title?: string;
  description?: string;
  ctaText?: string;
  href?: string;
};

export default function SelfPromoAd({
  title = "Boost your visibility on Tego.live",
  description = "Go live, get more viewers, and earn coins from your audience in real time.",
  ctaText = "Start Streaming",
  href = "/creator",
}: SelfPromoAdProps) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="relative my-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-lg backdrop-blur">
      {/* Close button */}
      <button
        onClick={() => setClosed(true)}
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-xs text-white/70 hover:bg-black/70"
        aria-label="Close promotion"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="space-y-2 pr-8">
        <p className="text-xs uppercase tracking-[0.16em] text-teal-300">
          Tego.live Promotion
        </p>
        <h3 className="text-base sm:text-lg font-semibold text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-white/80">{description}</p>

        <Link
          href={href}
          className="inline-flex mt-2 items-center rounded-full bg-linear-to-r from-sky-500 to-purple-500 px-4 py-1.5 text-xs sm:text-sm font-medium text-white shadow-md hover:opacity-90"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
}
