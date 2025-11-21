"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ACCENT, Status } from "@/components/ACCENT";
import GradientScene from "@/components/layout/GradientScene";
import StatusPill from "@/components/layout/StatusPill";
import SwipePanel from "@/components/home/SwipePanel";
import ActionSection from "@/components/home/ActionSection";
import FooterStrip from "@/components/home/FooterStrip";
import { supabase } from "@/lib/supabaseClient";

async function preflightPermissions() {
  if (!navigator?.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach((t) => t.stop());
  } catch {}
}

export default function HomePage() {
  const router = useRouter();

  // 🔐 PROTECT PAGE: Only allow logged-in users
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth");
      }
    }
    checkAuth();
  }, [router]);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const uid = useMemo(() => Math.floor(Math.random() * 10_000_000), []);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const clearPoll = () => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  };

  const cancelWaiting = useCallback(async () => {
    clearPoll();
    setStatus("idle");
    try {
      await fetch("/api/match/leave", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uid }),
      }).catch(() => {});
    } catch {}
  }, [uid]);

  const pollOnce = useCallback(async () => {
    try {
      const again = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const result = await again.json().catch(() => ({}));
      if (result.status === "paired" && result.channel) {
        clearPoll();
        if (!isMounted.current) return;
        setStatus("paired");
        router.push(`/call/${result.channel}?uid=${uid}`);
        return;
      }

      if (status === "waiting" && isMounted.current) {
        const delay = 2500 + Math.floor(Math.random() * 1000);
        pollTimer.current = setTimeout(pollOnce, delay);
      }
    } catch (e: any) {
      if (!isMounted.current) return;
      setStatus("error");
      setErrorMsg(e?.message || "Something went wrong while pairing.");
    }
  }, [router, status, uid]);

  const tryPair = useCallback(async () => {
    clearPoll();
    setErrorMsg(null);
    setStatus("pairing");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();

      if (data.status === "paired" && data.channel) {
        setStatus("paired");
        router.push(`/call/${data.channel}?uid=${uid}`);
        return;
      }

      if (data.status === "waiting") {
        setStatus("waiting");
        pollTimer.current = setTimeout(pollOnce, 1000);
        return;
      }

      setStatus("error");
      setErrorMsg(data?.error || "Unable to pair right now.");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message || "Network error. Please try again.");
    }
  }, [pollOnce, router, uid]);

  useEffect(() => {
    preflightPermissions();
    return () => {
      isMounted.current = false;
      clearPoll();
    };
  }, []);

  return (
    <GradientScene>
      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-20">
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
          {/* Glow ring */}
          <div
            className="pointer-events-none absolute -inset-1 rounded-[28px] opacity-60 animate-rotateGlow"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${ACCENT.primary}, ${ACCENT.secondary}, ${ACCENT.primary}, transparent)`,
            }}
          />
          <div className="pointer-events-none absolute -inset-1 rounded-[28px] bg-black/20" />

          {/* Header */}
          <div className="relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs tracking-[0.2em] text-white/60">LIVE CONNECTION READY</p>
              </div>
              <h1 className="mt-4 bg-linear-to-br from-white to-white/80 bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl">
                Discover Meaningful Conversations with Strangers Worldwide
              </h1>
              <p className="mt-4 max-w-xl text-lg text-white/70 leading-relaxed">
                Experience the thrill of spontaneous connection. Our intelligent matching pairs you with
                like-minded individuals for authentic, one-on-one video conversations. No filters, no followers—just real human moments.
              </p>
            </div>
            <StatusPill status={status} />
          </div>

          {/* Content */}
          <div className="mt-12 grid items-center gap-12 md:grid-cols-[1.1fr_.9fr]">
            <SwipePanel onSwipeUp={tryPair} />
            <ActionSection
              status={status}
              errorMsg={errorMsg}
              onTryPair={tryPair}
              onCancel={cancelWaiting}
            />
          </div>

          <FooterStrip />
        </div>
      </section>
    </GradientScene>
  );
}
