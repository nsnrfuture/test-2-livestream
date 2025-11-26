// app/live/[channel]/page.tsx
"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { TouchEvent, WheelEvent } from "react";
import { useParams, useRouter } from "next/navigation";
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
   GiftRain (same style as host page)
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
    el.style.filter = "drop-shadow(0 4px 12px rgba(0,0,0,0.4))";

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

  return (
    <div
      ref={boxRef}
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
    />
  );
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
  viewerId?: string | null;
  onGift?: (g: GiftEvent) => void;
};

const GIFTS: { label: string; type: GiftType; amount: number }[] = [
  { label: "Like", type: "like", amount: 1 },
  { label: "Rose", type: "rose", amount: 5 },
  { label: "Star", type: "star", amount: 10 },
  { label: "Diamond", type: "diamond", amount: 25 },
];

function GiftPanel({ channel, viewerId, onGift }: GiftPanelProps) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const c = supabase.channel(`live:${channel}`, {
      config: { broadcast: { self: true } },
    });

    c.on(
      "broadcast",
      { event: "gift" },
      ({ payload }: { payload: GiftEvent }) => {
        const g = payload as GiftEvent;
        setTotal((t) => t + g.amount);
        onGift?.(g);
      }
    );

    c.subscribe();
    return () => {
      c.unsubscribe();
    };
  }, [channel, onGift]);

  const send = useCallback(
    async (type: GiftType, amount: number) => {
      if (!viewerId) {
        alert("Please login to send gifts.");
        return;
      }

      // Broadcast payload (for UI animations)
      const g: GiftEvent = {
        type,
        amount,
        from: viewerId,
        channel,
        at: new Date().toISOString(),
      };

      // Server-side logging (sender id + host info etc.)
      fetch("/api/live/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          type,
          amount,
          fromUserId: viewerId,
        }),
      }).catch(() => {});

      // Broadcast so all viewers & host see it instantly
      supabase
        .channel(`live:${channel}`, { config: { broadcast: { self: true } } })
        .send({ type: "broadcast", event: "gift", payload: g });
    },
    [channel, viewerId]
  );

  return (
    <div className="mt-6 flex flex-col items-center gap-3 text-white">
      {/* Gift Total pill */}
      <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-1 border border-white/10 backdrop-blur-xl text-xs sm:text-sm">
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/50">
          Gifts
        </span>
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold">Total: {total}</span>
      </div>

      {/* Buttons: Like +1, Rose +5, Star +10, Diamond +25 */}
      <div className="flex flex-wrap justify-center gap-2">
        {GIFTS.map((g) => (
          <button
            key={g.type}
            onClick={() => send(g.type, g.amount)}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[11px] sm:text-sm text-black shadow-sm hover:scale-105 transition"
            aria-label={`Send ${g.label}`}
          >
            <span>{g.label}</span>
            <span className="text-xs font-semibold text-pink-600">
              +{g.amount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------
   LivePlayer (dynamic Agora, fills card)
------------------------------------ */

type LivePlayerProps = {
  channel: string;
};

function LivePlayer({ channel }: LivePlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
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
              const remoteVideoTrack =
                user.videoTrack as IRemoteVideoTrack | null;
              if (remoteVideoTrack && containerRef.current) {
                remoteVideoTrack.play(containerRef.current);
              }
            }

            if (mediaType === "audio") {
              const remoteAudioTrack =
                user.audioTrack as IRemoteAudioTrack | null;
              remoteAudioTrack?.play();
            }
          }
        );

        localClient.on("user-unpublished", () => {
          // Agora handles cleanup internally
        });

        if (mounted) {
          // joined state agar chahiye toh yahan set kar sakte ho
        }
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

  return <div ref={containerRef} className="absolute inset-0 bg-black" />;
}

/* ------------------------------------
   ViewerPage (vertical feed + swipe)
------------------------------------ */

export default function ViewerPage() {
  const params = useParams<{ channel: string }>();
  const router = useRouter();
  const channel = params.channel;
  const [feed, setFeed] = useState<GiftEvent[]>([]);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const SWIPE_THRESHOLD = 60; // px

  const [viewerId, setViewerId] = useState<string | null>(null);
  const [viewerEmail, setViewerEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load current logged-in viewer
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error) {
        console.error("viewer getUser error:", error);
        setAuthLoading(false);
        return;
      }
      const u = data.user;
      if (u) {
        setViewerId(u.id);
        setViewerEmail((u.email as string) || null);
      }
      setAuthLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  // 🔹 Track viewer on mount / channel change
  useEffect(() => {
    if (!channel) return;

    fetch("/api/live/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        viewerId: viewerId || null,
      }),
    }).catch(() => {});
  }, [channel, viewerId]);

  if (!channel) {
    return (
      <main className="min-h-screen w-full bg-neutral-950 text-white pt-24">
        <section className="mx-auto max-w-6xl px-4">
          <p>No channel specified.</p>
        </section>
      </main>
    );
  }

  const goToNextLive = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/live/next?current=${encodeURIComponent(channel)}`
      );
      if (!res.ok) {
        console.warn("No next live yet");
        return;
      }
      const data = await res.json();
      if (data?.channel && data.channel !== channel) {
        router.push(`/live/${data.channel}`);
      }
    } catch (err) {
      console.error("Next live error", err);
    }
  }, [channel, router]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartY === null) return;
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    if (deltaY > SWIPE_THRESHOLD) {
      void goToNextLive();
    }
    setTouchStartY(null);
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 40) {
      void goToNextLive();
    }
  };

  return (
    <main className="min-h-screen w-full bg-linear-to-b from-[#050816] via-[#020617] to-black text-white pt-20 pb-14 px-4">
      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[rgba(139,61,255,0.45)] blur-3xl opacity-60" />
        <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-[rgba(56,189,248,0.35)] blur-3xl opacity-60" />
        <div className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-[rgba(16,185,129,0.35)] blur-3xl opacity-50" />
      </div>

      <section className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur-xl">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] uppercase tracking-[0.22em] text-white/50">
                Tego Live • Viewer
              </span>
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight bg-linear-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Enjoy the live & support creators
            </h1>
            <p className="mt-3 text-sm sm:text-base md:text-lg text-white/60 max-w-2xl">
              You&apos;re watching{" "}
              <span className="font-semibold text-white/80">@{channel}</span>.
              Swipe up or scroll down to jump to the next live (when
              available), and send gifts to show your support.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-white/70 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.55)] max-w-xs">
            <p className="font-semibold text-white/80 mb-1">Viewer Tips</p>
            <ul className="space-y-1.5">
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-[#8B3DFF]" />
                <span>Swipe up to discover more live rooms.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>Use gifts to push your favourite creators.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Stay kind and respectful in chat.</span>
              </li>
            </ul>
          </div>
        </header>

        {/* Live card */}
        <div className="flex justify-center">
          <div
            className="relative w-full max-w-md h-[calc(100vh-130px)] bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* Video */}
            <LivePlayer channel={channel} />
            <GiftRain feed={feed} />

            {/* Top creator card */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl rounded-full pl-2 pr-4 py-2 border border-white/10">
                <img
                  src="https://i.pravatar.cc/100"
                  className="h-10 w-10 rounded-full object-cover"
                  alt="creator avatar"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-white text-sm font-semibold truncate">
                    Motication Day
                  </span>
                  <span className="text-white/70 text-[11px]">
                    @{channel} • 2.3k
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="bg-[#FF2D55] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  Follow
                </button>
                <button className="h-8 w-8 flex items-center justify-center rounded-full bg-black/70 border border-white/20">
                  ✕
                </button>
              </div>
            </div>

            {/* Live pill */}
            <div className="absolute top-20 left-4 bg-red-600 px-3 py-1 rounded-full text-xs text-white flex items-center gap-1 shadow-lg z-30">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
              Live
            </div>

            {/* Chat bubbles */}
            <div className="absolute bottom-36 left-0 w-full px-4 space-y-2 z-30">
              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-white/40" />
                <div className="bg-black/50 backdrop-blur-xl px-3 py-2 rounded-2xl text-white text-xs border border-white/10">
                  <span className="font-semibold">Radiant Rose: </span>
                  Minimalist and high quality ✨
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-white/40" />
                <div className="bg-black/50 backdrop-blur-xl px-3 py-2 rounded-2xl text-white text-xs border border-white/10">
                  <span className="font-semibold">Marcltna: </span>
                  Hallo, welcome!! 💜
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-white/40" />
                <div className="bg-black/50 backdrop-blur-xl px-3 py-2 rounded-2xl text-white text-xs border border-white/10">
                  <span className="font-semibold">Mystic Meadow: </span>
                  Your style is perfect 🔥
                </div>
              </div>
            </div>

            {/* Right side heart + gift buttons */}
            <div className="absolute right-4 bottom-36 z-30 flex flex-col gap-3 items-center">
              <button className="h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-xl shadow-xl border border-white/20">
                ❤️
              </button>
              <button className="h-12 w-12 flex items-center justify-center rounded-full bg-[#A020F0] backdrop-blur-xl shadow-xl border border-white/20">
                🎁
              </button>
            </div>

            {/* Message input */}
            <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center bg-black/40 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-full">
              <input
                placeholder="Message..."
                className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/40"
              />
              <button className="h-8 w-8 flex items-center justify-center rounded-full bg-[#FF2D55] ml-2">
                ➤
              </button>
            </div>
          </div>
        </div>

        {/* Gift controls – nicely centered under the card */}
        <div className="flex justify-center">
          <GiftPanel
            channel={channel}
            viewerId={viewerId}
            onGift={(g) => setFeed((f) => [...f, g].slice(-20))}
          />
        </div>
      </section>
    </main>
  );
}
