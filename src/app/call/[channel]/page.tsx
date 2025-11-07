// app/call/[channel]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Wifi, Users } from "lucide-react";
import VideoCall from "@/components/VideoCall";

const ACCENT = {
  primary: "#6C5CE7",
  primaryDark: "#5b4ed2",
};

function Pill({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-900 ring-1 ring-white/60 backdrop-blur"
    >
      {children}
    </span>
  );
}

export default function CallPage() {
  const { channel } = useParams<{ channel: string }>();
  const sp = useSearchParams();
  const router = useRouter();

  // Generate or read UID
  const uid = useMemo(() => {
    const raw = sp.get("uid");
    return raw ? Number(raw) : Math.floor(Math.random() * 10_000_000);
  }, [sp]);

  // (Optional) show a tiny UI hint while the very first join happens
  const [booted, setBooted] = useState(false);

  // ---- must match the props in your VideoCall ----
  const getToken = async (ch: string, u: number) => {
    const res = await fetch("/api/token", {
      method: "POST",
      body: JSON.stringify({ channel: ch, uid: u }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Failed to get token");
    }
    const data = (await res.json()) as { token: string };
    // first successful token = booted
    if (!booted) setBooted(true);
    return data.token;
  };

  // >>> used by Next/Skip buttons <<<
  const getNextStranger = async () => {
    const res = await fetch("/api/match", {
      method: "POST",
      body: JSON.stringify({ uid }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Failed to match");
    }
    const data = (await res.json()) as
      | { status: "waiting" }
      | { status: "paired"; channel: string; partner: number };

    if (data.status === "waiting") {
      // keep the current channel for now; your component will keep UI alive
      return { channel, uid };
    }
    return { channel: data.channel, uid };
  };

  const onLeave = () => {
    router.push("/");
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* Soft gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% 0%, rgba(108,92,231,0.20), transparent 65%), radial-gradient(1200px 600px at 90% 100%, rgba(108,92,231,0.18), transparent 60%), linear-gradient(180deg, #f7f7fb 0%, #ffffff 100%)",
        }}
      />
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#6C5CE7]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#6C5CE7]/15 blur-3xl" />

      {/* Page container */}
      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-medium text-gray-900 ring-1 ring-white/60 shadow-sm hover:bg-white/95 focus:outline-none focus:ring-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Live Video Match
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Pill title="Connection">
              <Wifi className="h-4 w-4 text-emerald-600" />
              <span className="text-gray-700">RTC</span>
            </Pill>
            <Pill title="Participants">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="text-gray-700">2</span>
            </Pill>
            <Pill title="Channel name">
              <span className="text-gray-500">Channel:</span>
              <span className="font-semibold">{String(channel)}</span>
            </Pill>
            <Pill title="Your UID">
              <span className="text-gray-500">UID:</span>
              <span className="font-semibold">{uid}</span>
            </Pill>
          </div>
        </div>

        {/* Content card */}
        <section
          className="rounded-3xl border border-white/60 bg-white/70 p-3 shadow-[0_20px_60px_-30px_rgba(108,92,231,0.45)] backdrop-blur md:p-4"
          style={{
            boxShadow:
              "0 10px 30px rgba(108,92,231,0.20), 0 1px 0 rgba(255,255,255,0.6) inset",
          }}
        >
          <div className="rounded-2xl bg-white/40 p-2 ring-1 ring-white/60">
            <VideoCall
              channel={String(channel)}
              uid={uid}
              getToken={getToken}
              getNextStranger={getNextStranger}
              onLeave={onLeave}
            />
          </div>

          {/* Subtle footer hint */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2">
            <div className="text-xs text-gray-600">
              Tip: Press <b>S</b> or <b>Shift + N</b> to skip to a new stranger.
            </div>
            <div
              className={`text-xs ${booted ? "text-emerald-600" : "text-gray-500"}`}
            >
              {booted ? "Connected • Secure RTC" : "Connecting…"}
            </div>
          </div>
        </section>

        {/* Tiny brand stripe */}
        <div
          className="mx-auto h-1 w-24 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${ACCENT.primary}, ${ACCENT.primaryDark})`,
          }}
        />
      </div>
    </div>
  );
}
