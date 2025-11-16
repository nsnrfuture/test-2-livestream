"use client";

import { useParams } from "next/navigation";
import LivePlayer from "@/components/live/LivePlayer";
import GiftPanel from "@/components/live/GiftPanel";
import GiftRain from "@/components/live/GiftRain";
import { useState } from "react";
import type { GiftEvent } from "@/types/live";

export default function ViewerPage() {
  const params = useParams<{ channel: string }>();
  const channel = params.channel;
  const [feed, setFeed] = useState<GiftEvent[]>([]);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-white pt-24">
      <section className="mx-auto max-w-6xl px-4">
        <h1 className="text-2xl font-semibold">Live: {channel}</h1>
        <p className="text-white/60 mt-1">Watch & send gifts to support the creator.</p>

        <div className="mt-6 relative">
          <LivePlayer channel={channel} />
          <GiftRain feed={feed} />
        </div>

        <GiftPanel
          channel={channel}
          onGift={(g) => setFeed((f) => [...f, g].slice(-20))}
        />
      </section>
    </main>
  );
}
