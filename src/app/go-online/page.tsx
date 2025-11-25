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

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Radio,
  Link2,
  Heart,
} from "lucide-react";

const ACCENT = "#8B3DFF";

/* ------------------------------------
   GiftRain
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
    default:
      return "❤️";
  }
}

/* ------------------------------------
   LivePublisher (host video + controls)
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

  // guard to avoid double leave/unpublish
  const hasLeftRef = useRef(false);

  // Load AgoraRTC only in browser
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

      hasLeftRef.current = false;
      setJoined(true);
    } catch (e) {
      console.error("Agora join error:", e);
    } finally {
      setLoading(false);
    }
  }, [client, channel, uid, getToken]);

  const leave = useCallback(async () => {
    if (!client) return;

    if (hasLeftRef.current) {
      onLeave?.();
      return;
    }
    hasLeftRef.current = true;

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
      console.error("Agora leave error:", e);
    }
  }, [client, mic, cam, onLeave]);

  // Cleanup on unmount only (no state updates)
  useEffect(() => {
    return () => {
      if (!client) return;
      if (hasLeftRef.current) return;

      hasLeftRef.current = true;

      (async () => {
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
        } catch (e) {
          console.error("Agora cleanup on unmount error:", e);
        }
      })();
    };
  }, [client, mic, cam]);

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
    <div className="w-full h-full flex flex-col justify-end">
      {/* Video fills parent */}
      <div ref={containerRef} className="absolute inset-0 bg-black">
        {!joined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/15 shadow-[0_0_30px_rgba(139,61,255,0.6)]">
              <Radio className="h-7 w-7" style={{ color: ACCENT }} />
            </div>
            <p className="text-sm font-medium">You&apos;re currently offline</p>
            <p className="text-xs text-white/40 max-w-xs text-center px-4">
              Click{" "}
              <span className="font-semibold" style={{ color: ACCENT }}>
                Go Live
              </span>{" "}
              to start your stream and preview camera & audio here.
            </p>
          </div>
        )}
      </div>

      {/* Controls bottom – BIG button, old location style */}
      <div className="relative z-10 mb-24 ml-4 mr-24">
        {!joined ? (
          <button
            onClick={join}
            disabled={loading || !client}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#8B3DFF] via-[#6C5CE7] to-[#3B82F6] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_0_30px_rgba(139,61,255,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Radio className="h-5 w-5 animate-pulse" />
                <span>Starting…</span>
              </>
            ) : (
              <>
                <Radio className="h-5 w-5" />
                <span>Go Live</span>
              </>
            )}
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-full px-3 py-2 border border-white/10">
            <button
              onClick={toggleMic}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border border-white/10"
            >
              {muted ? (
                <MicOff className="h-4 w-4 text-rose-400" />
              ) : (
                <Mic className="h-4 w-4 text-emerald-400" />
              )}
            </button>
            <button
              onClick={toggleVideo}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border border-white/10"
            >
              {videoOff ? (
                <Video className="h-4 w-4 text-emerald-400" />
              ) : (
                <VideoOff className="h-4 w-4 text-rose-400" />
              )}
            </button>
            <button
              onClick={leave}
              className="inline-flex items-center justify-center h-8 px-3 rounded-full bg-red-500 text-xs font-semibold text-white shadow-lg"
            >
              <PhoneOff className="h-4 w-4 mr-1" />
              End
            </button>
          </div>
        )}

        {token ? (
          <p className="mt-2 text-[10px] text-white/60 font-mono bg-black/50 rounded-full px-3 py-1 inline-flex items-center gap-2 border border-white/10">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            UID #{uid}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------
   GoOnlinePage
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

  const handleShare = () => {
    if (!shareUrl) return;

    if (typeof navigator !== "undefined" && (navigator as any).share) {
      (navigator as any).share({
        title: title || "Live on Tego",
        text: "Join my live stream now!",
        url: shareUrl,
      });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert("Live link copied to clipboard!");
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
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="uppercase tracking-[0.22em] text-[9px] text-white/50">
                Tego Live • Host Studio
              </span>
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight bg-linear-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Go Live & start earning from gifts
            </h1>
            <p className="text-white/60 mt-3 text-sm sm:text-base md:text-lg max-w-2xl">
              Create your live room, share the link with your audience, and
              receive gifts in real time. All powered by your Tego profile.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-white/70 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.55)] max-w-xs">
            <p className="font-semibold text-white/80 mb-1">Host Tips</p>
            <ul className="space-y-1.5">
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-[#8B3DFF]" />
                <span>
                  Use a clear title so viewers know what your live is about.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>Share your live link on social media for more viewers.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Engage with the chat to receive more gifts.</span>
              </li>
            </ul>
          </div>
        </header>

        {/* Content */}
        {!channel ? (
          // BEFORE STARTING LIVE
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Left: setup card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 shadow-[0_0_45px_rgba(0,0,0,0.7)] space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2">
                  Stream Title <span className="text-white/40">(optional)</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Late night chill talk, Q&A, game stream..."
                  className="w-full rounded-2xl bg-neutral-950/80 backdrop-blur-sm px-4 py-3 text-sm outline-none border border-white/10 focus:border-[#8B3DFF] focus:ring-2 focus:ring-[#8B3DFF]/30 transition-all placeholder:text-white/35"
                />
                <p className="mt-1.5 text-[11px] text-white/45">
                  This helps your followers recognise your session on the viewer
                  page.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/40 border border-white/10">
                    <Radio className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-white/80">
                      Ready to go live
                    </span>
                    <span className="text-[11px] text-white/45">
                      Camera & mic access will be asked after you start.
                    </span>
                  </div>
                </div>

                <button
                  onClick={startLive}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#8B3DFF] via-[#6C5CE7] to-[#3B82F6] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_0_45px_rgba(139,61,255,0.7)] hover:shadow-[0_0_60px_rgba(139,61,255,0.9)] hover:scale-[1.03] active:scale-95 transition-all"
                >
                  <Radio className="h-4 w-4" />
                  <span>Start Live Session</span>
                </button>
              </div>
            </div>

            {/* Right: preview / info */}
            <div className="space-y-4">
              <div className="h-full bg-linear-to-br from-white/10 via-white/3 to-black/40 border border-white/15 rounded-3xl p-4 sm:p-5 backdrop-blur-2xl shadow-[0_0_45px_rgba(0,0,0,0.75)] flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                    Preview
                  </p>
                  <p className="text-sm text-white/75">
                    Once you start, you&apos;ll see your camera preview here
                    with mic & camera controls.
                  </p>
                  <div className="mt-3 aspect-video w-full rounded-2xl bg-black/60 border border-dashed border-white/15 flex items-center justify-center">
                    <span className="text-[11px] text-white/35">
                      Camera preview will appear after going live
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/65">
                  <div className="rounded-xl bg-black/50 border border-white/10 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">
                      Mode
                    </p>
                    <p className="font-semibold mt-0.5">Host</p>
                  </div>
                  <div className="rounded-xl bg-black/50 border border-white/10 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">
                      Status
                    </p>
                    <p className="font-semibold mt-0.5 text-white/70">
                      Offline
                    </p>
                  </div>
                  <div className="rounded-xl bg-black/50 border border-white/10 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">
                      Gifts
                    </p>
                    <p className="font-semibold mt-0.5 text-white/70">
                      Waiting
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // AFTER STARTING LIVE – vertical video with chat overlay
          <div className="flex justify-center">
            <div className="relative w-full max-w-md h-[calc(100vh-130px)] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              {/* Video + controls handled inside */}
              <LivePublisher channel={channel} onLeave={endLive} />
              <GiftRain feed={feed} />

              {/* Top overlay: profile + share + follow */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-3 py-2 flex items-center gap-2 border border-white/10">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                    U
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-white text-sm font-semibold truncate max-w-[140px]">
                      {title || "My Live Stream"}
                    </span>
                    <span className="text-white/70 text-[11px]">
                      @{channel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Share viewer link - darker now */}
                  <button
                    onClick={handleShare}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-black/70 border border-white/30 shadow-md backdrop-blur-xl active:scale-95 transition"
                  >
                    <Link2 className="h-4 w-4 text-white" />
                  </button>

                  {/* Follow button */}
                  <button className="bg-[#FF2D55] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                    Follow
                  </button>
                </div>
              </div>

              {/* Live badge */}
              <div className="absolute top-20 left-4 bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-20">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                LIVE • 2.3k
              </div>

              {/* Chat messages overlay */}
              <div className="absolute bottom-32 left-0 w-full px-4 space-y-2 z-20 pointer-events-none">
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-white/30" />
                  <div className="bg-black/45 backdrop-blur-xl px-3 py-2 rounded-2xl text-white text-xs border border-white/10 max-w-[80%]">
                    <span className="font-medium">Radiant Rose:</span>{" "}
                    Minimalist and high quality ✨
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-white/30" />
                  <div className="bg-black/45 backdrop-blur-xl px-3 py-2 rounded-2xl text-white text-xs border border-white/10 max-w-[80%]">
                    <span className="font-medium">Marcltna:</span> Hallo,
                    welcome!! 💜
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-white/30" />
                  <div className="bg-black/45 backdrop-blur-xl px-3 py-2 rounded-2xl text-white text-xs border border-white/10 max-w-[80%]">
                    <span className="font-medium">Mystic Meadow:</span> Your
                    style is perfect 🔥
                  </div>
                </div>
              </div>

              {/* Bottom input + heart/gift button */}
              <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center gap-3 z-30">
                <input
                  placeholder="Message..."
                  className="flex-1 bg-black/50 backdrop-blur-xl px-4 py-3 text-sm text-white rounded-full border border-white/15 outline-none placeholder:text-white/40"
                />
                <button className="h-11 w-11 flex items-center justify-center rounded-full bg-[#FF2D55] shadow-xl">
                  <Heart className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
