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

// ✅ Lucide icons
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Radio,
  Copy as CopyIcon,
  Eye,
  Link2,
} from "lucide-react";

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

  return (
    <div
      ref={boxRef}
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
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

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (joined) {
        void leave();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);

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
      {/* Video area */}
      <div
        ref={containerRef}
        className="aspect-video w-full rounded-2xl bg-neutral-900 overflow-hidden shadow-2xl border border-white/10 relative"
      >
        {!joined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg">
              <Radio className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium">You&apos;re offline</p>
            <p className="text-xs text-white/40 max-w-xs text-center px-4">
              Start your live to preview camera and audio here.
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-5 rounded-2xl bg-neutral-900/70 backdrop-blur-md border border-white/10 px-4 py-3 sm:px-5 sm:py-4">
        {!joined ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Live status
              </span>
              <span className="text-sm font-medium text-white">
                Not live yet
              </span>
            </div>
            <button
              onClick={join}
              disabled={loading || !client}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#6C5CE7] to-[#5b4ed2] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all duration-200 hover:from-[#5b4ed2] hover:to-[#4a3eb8] hover:shadow-[#6C5CE7]/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Radio className="h-4 w-4 animate-pulse" />
                  <span>Starting live…</span>
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4" />
                  <span>Go Live</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {/* Mic */}
            <button
              onClick={toggleMic}
              className="inline-flex flex-1 min-w-[110px] items-center justify-center gap-2 rounded-xl bg-neutral-800/80 px-4 py-2.5 text-xs sm:text-sm font-medium text-white border border-white/10 hover:border-white/30 hover:bg-neutral-700 transition-all"
            >
              {muted ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Mute</span>
                </>
              )}
            </button>

            {/* Video */}
            <button
              onClick={toggleVideo}
              className="inline-flex flex-1 min-w-[110px] items-center justify-center gap-2 rounded-xl bg-neutral-800/80 px-4 py-2.5 text-xs sm:text-sm font-medium text-white border border-white/10 hover:border-white/30 hover:bg-neutral-700 transition-all"
            >
              {videoOff ? (
                <>
                  <Video className="h-4 w-4" />
                  <span>Camera On</span>
                </>
              ) : (
                <>
                  <VideoOff className="h-4 w-4" />
                  <span>Camera Off</span>
                </>
              )}
            </button>

            {/* End live */}
            <button
              onClick={leave}
              className="inline-flex flex-[1.2] min-w-[130px] items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red-500 to-red-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <PhoneOff className="h-4 w-4" />
              <span>End Live</span>
            </button>
          </div>
        )}

        {token ? (
          <p className="mt-3 text-[10px] sm:text-xs text-white/40 font-mono bg-white/5 rounded-lg px-3 py-2 inline-flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            UID: {uid}
          </p>
        ) : null}
      </div>
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
      <section className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
            Go Live
          </h1>
          <p className="text-white/60 mt-3 text-sm sm:text-base md:text-lg max-w-2xl mx-auto sm:mx-0">
            Start a live room, share the link, and earn from gifts sent by
            viewers in real-time.
          </p>
        </div>

        {!channel ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-7 border border-white/10 shadow-2xl space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2">
                Stream Title (Optional)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your stream a catchy title..."
                className="w-full rounded-xl bg-neutral-900/80 backdrop-blur-sm px-4 py-3 text-sm outline-none border border-white/10 focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/25 transition-all placeholder:text-white/35"
              />
            </div>
            <button
              onClick={startLive}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#6C5CE7] to-[#5b4ed2] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-[#6C5CE7]/25 hover:shadow-[#6C5CE7]/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Radio className="h-4 w-4" />
              <span>Start Live Session</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video Container */}
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/10 shadow-2xl">
              <div className="relative">
                <LivePublisher channel={channel} onLeave={endLive} />
                <GiftRain feed={feed} />
              </div>
            </div>

            {/* Share Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <Link2 className="h-4 w-4" />
                </span>
                <span>Share Your Stream</span>
              </h3>

              <div className="flex flex-col gap-3">
                <div className="bg-neutral-900/70 rounded-xl px-4 py-3 border border-white/10 break-all text-xs sm:text-sm">
                  <span className="text-white/45 text-[11px] font-semibold uppercase tracking-wide block mb-1">
                    Live URL
                  </span>
                  <span className="text-white/90 font-mono">
                    {shareUrl || "Live link will appear here"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (!shareUrl) return;
                      navigator.clipboard.writeText(shareUrl);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900/80 px-4 py-3 text-sm font-medium text-white border border-white/10 hover:border-white/25 hover:bg-neutral-800 transition-all"
                  >
                    <CopyIcon className="h-4 w-4" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!channel) return;
                      router.push(`/live/${channel}`);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-4 py-3 text-sm font-semibold shadow-lg hover:bg-white/95 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Open Viewer Page</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-white/45 mt-1 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                Viewers can send gifts from the viewer page. They&apos;ll rain
                over your video here instantly.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
