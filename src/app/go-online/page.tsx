"use client";

import { useState, useMemo } from "react";
import LivePublisher from "@/components/live/LivePublisher";
import GiftRain from "@/components/live/GiftRain";
import { useRouter } from "next/navigation";
import type { GiftEvent } from "@/types/live";

export default function GoOnlinePage() {
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState<string | null>(null);
  const [feed, setFeed] = useState<GiftEvent[]>([]);
  const router = useRouter();

  const shareUrl = useMemo(() => {
    if (!channel) return "";
    return `${typeof window !== "undefined" ? window.location.origin : ""}/live/${channel}`;
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
    <main className="min-h-screen w-full bg-neutral-950 text-white pt-24">
      <section className="mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-semibold">Go Live</h1>
        <p className="text-white/60 mt-1">
          Share your talent. Earn from gifts sent by viewers in real-time.
        </p>

        {!channel ? (
          <div className="mt-6 flex gap-3 items-center">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your stream a title (optional)"
              className="w-full max-w-md rounded-lg bg-neutral-800 px-4 py-2 outline-none"
            />
            <button
              onClick={startLive}
              className="px-5 py-2 rounded-lg bg-[#6C5CE7] hover:bg-[#5b4ed2]"
            >
              Start
            </button>
          </div>
        ) : (
          <div className="mt-6 relative">
            <div className="relative">
              <LivePublisher channel={channel} onLeave={endLive} />
              <GiftRain feed={feed} />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-sm bg-white/10 rounded-lg px-3 py-2">
                Share link:&nbsp;
                <span className="text-white/90">{shareUrl}</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                }}
                className="px-3 py-2 rounded-lg bg-neutral-800"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  router.push(`/live/${channel}`);
                }}
                className="px-3 py-2 rounded-lg bg-white text-black"
              >
                Open Viewer Page
              </button>
            </div>

            <p className="text-xs text-white/40 mt-2">
              Tip: viewers can send gifts on the viewer page; they’ll float here instantly.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
