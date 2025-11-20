// app/live/[channel]/page.tsx
"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { GiftEvent, GiftType } from "@/types/live";
import type {
  IAgoraRTCClient,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { AGORA_APP_ID, randomUid } from "@/lib/agora";

/* ------------------------------------
   GiftRain (same behaviour as host page)
------------------------------------ */

function GiftRain({ feed }: { feed: GiftEvent[] }) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!feed.length || !boxRef.current) return;
    const last = feed[feed.length - 1];

    const el = document.createElement("div");
    el.textContent = giftEmoji(last.type);
    el.style.position = "absolute";
    el.style.left = Math.random() * 80 + "%";
    el.style.bottom = "-20px";
    el.style.fontSize = Math.min(64, 24 + last.amount * 2) + "px";
    el.style.transition = "transform 2.2s ease, opacity 2.2s ease";

    boxRef.current.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = `translateY(-120%) rotate(${
        (Math.random() - 0.5) * 60
      }deg)`;
      el.style.opacity = "0";
    });

    const timer = setTimeout(() => {
      el.remove();
    }, 2400);

    return () => clearTimeout(timer);
  }, [feed]);

  return <div ref={boxRef} className="pointer-events-none absolute inset-0" />;
}

function giftEmoji(type: string) {
  switch (type) {
    case "rose":
      return "🌹";
    case "star":
      return "⭐";
    case "diamond":
      return "💎";
    case "like":
      return "👍";
    default:
      return "❤️";
  }
}

/* ------------------------------------
   GiftPanel (Supabase Realtime broadcast)
------------------------------------ */

type GiftPanelProps = {
  channel: string;
  onGift?: (g: GiftEvent) => void;
};

const GIFTS: { label: string; type: GiftType; amount: number }[] = [
  { label: "Like", type: "like", amount: 1 },
  { label: "Rose", type: "rose", amount: 5 },
  { label: "Star", type: "star", amount: 10 },
  { label: "Diamond", type: "diamond", amount: 25 },
];

function GiftPanel({ channel, onGift }: GiftPanelProps) {
  const [total, setTotal] = useState(0);

  // Subscribe to broadcast events for this channel
  useEffect(() => {
    const c = supabase.channel(`live:${channel}`, {
      config: { broadcast: { self: true } },
    });

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

      // Optional: server-side logging
      fetch("/api/live/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(g),
      }).catch(() => {});

      // Broadcast so all viewers & host see it instantly
      supabase
        .channel(`live:${channel}`, { config: { broadcast: { self: true } } })
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

/* ------------------------------------
   LivePlayer (SSR-safe, dynamic Agora import)
------------------------------------ */

type LivePlayerProps = {
  channel: string;
};

function LivePlayer({ channel }: LivePlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [joined, setJoined] = useState(false);
  const [uid] = useState<number>(() => randomUid());

  const getToken = useCallback(async () => {
    const res = await fetch("/api/live/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, uid, role: "audience" }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "token");
    return j.token as string;
  }, [channel, uid]);

  useEffect(() => {
    let localClient: IAgoraRTCClient | null = null;
    let mounted = true;

    (async () => {
      try {
        if (typeof window === "undefined") return;

        // 🔥 dynamic import – no `window` error on SSR
        const mod = await import("agora-rtc-sdk-ng");
        const AgoraRTC = mod.default;

        localClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        setClient(localClient);

        const token = await getToken();
        await localClient.setClientRole("audience");
        await localClient.join(AGORA_APP_ID, channel, token, uid);

        localClient.on(
          "user-published",
          async (user: IAgoraRTCRemoteUser, mediaType) => {
            await localClient!.subscribe(user, mediaType);

            if (mediaType === "video") {
              const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack | null;
              if (remoteVideoTrack && containerRef.current) {
                remoteVideoTrack.play(containerRef.current);
              }
            }

            if (mediaType === "audio") {
              const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack | null;
              remoteAudioTrack?.play();
            }
          }
        );

        localClient.on("user-unpublished", () => {
          // video/audio cleanup handled by Agora
        });

        if (mounted) setJoined(true);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      mounted = false;
      (async () => {
        try {
          if (localClient) {
            await localClient.leave();
          } else if (client) {
            await client.leave();
          }
        } catch {
          // ignore
        }
      })();
    };
  }, [channel, getToken, uid]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="aspect-video w-full rounded-xl bg-black overflow-hidden"
    />
  );
}

/* ------------------------------------
   ViewerPage (default export)
------------------------------------ */

export default function ViewerPage() {
  const params = useParams<{ channel: string }>();
  const channel = params.channel;
  const [feed, setFeed] = useState<GiftEvent[]>([]);

  if (!channel) {
    return (
      <main className="min-h-screen w-full bg-neutral-950 text-white pt-24">
        <section className="mx-auto max-w-6xl px-4">
          <p>No channel specified.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-white pt-24">
      <section className="mx-auto max-w-6xl px-4">
        <h1 className="text-2xl font-semibold">Live: {channel}</h1>
        <p className="text-white/60 mt-1">
          Watch & send gifts to support the creator.
        </p>

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
