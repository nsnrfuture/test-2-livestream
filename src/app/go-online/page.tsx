// app/go-online/page.tsx
"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { AGORA_APP_ID, randomUid } from "@/lib/agora";
import type { GiftEvent } from "@/types/live";

/* ------------------------------------
   GiftRain (inline component)
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

  return <div ref={boxRef} className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" />;
}

function giftEmoji(type: string) {
  switch (type) {
    case "rose":
      return "🌹";
    case "star":
      return "⭐";
    case "diamond":
      return "💎";
    default:
      return "❤️";
  }
}

/* ------------------------------------
   LivePublisher (inline component)
------------------------------------ */

type LivePublisherProps = {
  channel: string;
  onLeave?: () => void;
};

function LivePublisher({ channel, onLeave }: LivePublisherProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [joined, setJoined] = useState(false);
  const [token, setToken] = useState<string>("");
  const [uid] = useState<number>(() => randomUid());
  const [mic, setMic] = useState<IMicrophoneAudioTrack | null>(null);
  const [cam, setCam] = useState<ICameraVideoTrack | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Load AgoraRTC only in the browser
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      const mod = await import("agora-rtc-sdk-ng");
      const AgoraRTC = mod.default;
      const newClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      setClient(newClient);
    })();
  }, []);

  const getToken = useCallback(async () => {
    const res = await fetch("/api/live/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, uid, role: "host" }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "token");
    return j.token as string;
  }, [channel, uid]);

  const join = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const t = await getToken();
      setToken(t);

      await client.setClientRole("host");
      await client.join(AGORA_APP_ID, channel, t, uid);

      const [m, c] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      setMic(m);
      setCam(c);

      await client.publish([m, c]);

      if (containerRef.current) {
        c.play(containerRef.current);
      }

      setJoined(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [client, channel, uid, getToken]);

  const leave = useCallback(async () => {
    if (!client) return;
    try {
      if (mic) {
        mic.stop();
        mic.close();
      }
      if (cam) {
        cam.stop();
        cam.close();
      }

      await client.unpublish();
      await client.leave();
      setJoined(false);
      onLeave?.();
    } catch (e) {
      console.error(e);
    }
  }, [client, mic, cam, onLeave]);

  const toggleMic = async () => {
    if (!mic) return;
    await mic.setEnabled(muted);
    setMuted(!muted);
  };

  const toggleVideo = async () => {
    if (!cam) return;
    await cam.setEnabled(videoOff);
    setVideoOff(!videoOff);
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="aspect-video w-full rounded-2xl bg-linear-to-br from-neutral-900 to-black overflow-hidden shadow-2xl border border-white/10"
      />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!joined ? (
          <button
            onClick={join}
            disabled={loading || !client}
            className="px-6 py-3 rounded-xl bg-linear-to-r from-[#6C5CE7] to-[#5b4ed2] text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {loading ? "Starting…" : "🎥 Go Live"}
          </button>
        ) : (
          <>
            <button
              onClick={toggleMic}
              className="px-4 py-3 rounded-xl bg-neutral-800/80 backdrop-blur-sm text-white font-medium hover:bg-neutral-700 transition-all duration-200 border border-white/10 hover:border-white/20 flex items-center gap-2"
            >
              <span>{muted ? "🔇" : "🎤"}</span>
              <span className="hidden sm:inline">{muted ? "Unmute" : "Mute"}</span>
            </button>
            <button
              onClick={toggleVideo}
              className="px-4 py-3 rounded-xl bg-neutral-800/80 backdrop-blur-sm text-white font-medium hover:bg-neutral-700 transition-all duration-200 border border-white/10 hover:border-white/20 flex items-center gap-2"
            >
              <span>{videoOff ? "📹" : "📷"}</span>
              <span className="hidden sm:inline">{videoOff ? "Camera On" : "Camera Off"}</span>
            </button>
            <button
              onClick={leave}
              className="px-6 py-3 rounded-xl bg-linear-to-r from-red-500 to-red-600 text-white font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              ⏹️ End Live
            </button>
          </>
        )}
      </div>
      {token ? (
        <p className="mt-3 text-xs text-white/40 font-mono bg-white/5 rounded-lg px-3 py-2 inline-block">
          UID: {uid}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------
   GoOnlinePage (default export)
------------------------------------ */

export default function GoOnlinePage() {
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState<string | null>(null);
  const [feed, setFeed] = useState<GiftEvent[]>([]);
  const router = useRouter();

  const shareUrl = useMemo(() => {
    if (!channel) return "";
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/live/${channel}`;
  }, [channel]);

  const startLive = async () => {
    const res = await fetch("/api/live/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const j = await res.json();
    if (!res.ok) {
      alert(j?.error || "Could not start");
      return;
    }
    setChannel(j.channel);
  };

  const endLive = async () => {
    if (!channel) return;
    await fetch("/api/live/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    }).catch(() => {});
    setChannel(null);
  };

  return (
    <main className="min-h-screen w-full bg-linear-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white pt-20 pb-12 px-4">
      <section className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center sm:text-left mb-8 sm:mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
            Go Live
          </h1>
          <p className="text-white/60 mt-3 text-base sm:text-lg max-w-2xl">
            Share your talent. Earn from gifts sent by viewers in real-time.
          </p>
        </div>

        {!channel ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Stream Title (Optional)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your stream a catchy title..."
                className="flex-1 rounded-xl bg-neutral-800/50 backdrop-blur-sm px-5 py-3.5 outline-none border border-white/10 focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 transition-all duration-200 placeholder:text-white/40"
              />
              <button
                onClick={startLive}
                className="px-8 py-3.5 rounded-xl bg-linear-to-r from-[#6C5CE7] to-[#5b4ed2] hover:from-[#5b4ed2] hover:to-[#4a3eb8] font-medium shadow-lg shadow-[#6C5CE7]/20 hover:shadow-xl hover:shadow-[#6C5CE7]/30 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                🚀 Start Live
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video Container */}
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl">
              <div className="relative">
                <LivePublisher channel={channel} onLeave={endLive} />
                <GiftRain feed={feed} />
              </div>
            </div>

            {/* Share Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl">
              <h3 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                <span>🔗</span> Share Your Stream
              </h3>
              
              <div className="flex flex-col gap-3">
                <div className="bg-neutral-800/50 rounded-xl px-4 py-3 border border-white/10 break-all text-sm">
                  <span className="text-white/50 text-xs font-medium block mb-1">Live URL:</span>
                  <span className="text-white/90 font-mono">{shareUrl}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (!shareUrl) return;
                      navigator.clipboard.writeText(shareUrl);
                    }}
                    className="flex-1 px-5 py-3 rounded-xl bg-neutral-800/80 backdrop-blur-sm hover:bg-neutral-700 font-medium transition-all duration-200 border border-white/10 hover:border-white/20 flex items-center justify-center gap-2"
                  >
                    <span>📋</span>
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!channel) return;
                      router.push(`/live/${channel}`);
                    }}
                    className="flex-1 px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>👁️</span>
                    <span>Open Viewer Page</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-white/40 mt-4 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                💡 Tip: Viewers can send gifts on the viewer page; they'll float here instantly.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}