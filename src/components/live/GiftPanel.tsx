"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { GiftEvent, GiftType } from "@/types/live";

type Props = {
  channel: string;
  onGift?: (g: GiftEvent) => void;
};

const GIFTS: { label: string; type: GiftType; amount: number }[] = [
  { label: "Like", type: "like", amount: 1 },
  { label: "Rose", type: "rose", amount: 5 },
  { label: "Star", type: "star", amount: 10 },
  { label: "Diamond", type: "diamond", amount: 25 },
];

export default function GiftPanel({ channel, onGift }: Props) {
  const [total, setTotal] = useState(0);

  // Subscribe to broadcast events for this channel
  useEffect(() => {
    const c = supabase.channel(`live:${channel}`, { config: { broadcast: { self: true } } });

    c.on("broadcast", { event: "gift" }, ({ payload }: { payload: GiftEvent }) => {
      const g = payload as GiftEvent;
      setTotal((t) => t + g.amount);
      onGift?.(g);
    });

    c.subscribe();
    return () => {
      c.unsubscribe();
    };
  }, [channel, onGift]);

  const send = useCallback(
    async (type: GiftType, amount: number) => {
      const g: GiftEvent = {
        type,
        amount,
        from: null,
        channel,
        at: new Date().toISOString(),
      };
      // Optional: server audit
      fetch("/api/live/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(g),
      }).catch(() => {});

      // Broadcast so all viewers & host see it instantly
      supabase.channel(`live:${channel}`, { config: { broadcast: { self: true } } })
        .send({ type: "broadcast", event: "gift", payload: g });
    },
    [channel]
  );

  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="text-sm text-white/80 bg-black/50 rounded-full px-3 py-1">
        Gift Total: <span className="font-semibold">{total}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {GIFTS.map((g) => (
          <button
            key={g.type}
            onClick={() => send(g.type, g.amount)}
            className="px-3 py-2 rounded-full bg-white text-black text-sm hover:scale-105 transition"
            aria-label={`Send ${g.label}`}
          >
            {g.label} +{g.amount}
          </button>
        ))}
      </div>
    </div>
  );
}
