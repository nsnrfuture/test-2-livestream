"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import SwipeStack from "@/components/SwipeStack";
import MatchButton from "@/components/MatchButton";

// Helper: explicitly ask permissions early (so users see the prompt on the home page)
async function preflightPermissions() {
  if (!navigator?.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    // immediately stop tracks; actual tracks will be created on the call page
    stream.getTracks().forEach(t => t.stop());
  } catch {
    // user denied or device missing — handle on call page too
  }
}

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "waiting" | "pairing" | "paired">("idle");
  const uid = useMemo(() => Math.floor(Math.random() * 10_000_000), []);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tryPair = async () => {
    setStatus("pairing");

    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "content-type": "application/json" }, // ✅ important
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
      // poll every 3s
      pollRef.current = setInterval(async () => {
        const again = await fetch("/api/match", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ uid }),
        });
        const result = await again.json();
        if (result.status === "paired" && result.channel) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus("paired");
          router.push(`/call/${result.channel}?uid=${uid}`);
        }
      }, 3000);
    }
  };

  useEffect(() => {
    // Ask for cam/mic early so users see the prompt immediately
    preflightPermissions();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-b from-gray-50 to-white">
      <h1 className="text-2xl font-bold mb-2">Swipe Up to Connect</h1>
      <p className="text-gray-500 mb-6">Anonymous 1:1 video chat, no sign-up.</p>

      <SwipeStack onSwipeUp={tryPair} />

      <div className="mt-6">
        <MatchButton onClick={tryPair}>
          {status === "idle" && "Tap to Connect"}
          {status === "pairing" && "Pairing…"}
          {status === "waiting" && "Waiting for a partner…"}
          {status === "paired" && "Connecting…"}
        </MatchButton>
      </div>

      <p className="text-xs text-gray-400 mt-4">Allow mic & camera when prompted.</p>
    </main>
  );
}
