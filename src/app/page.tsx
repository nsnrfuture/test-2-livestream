"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import SwipeStack from "@/components/SwipeStack";
import MatchButton from "@/components/MatchButton";

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "waiting" | "pairing" | "paired">("idle");
  const uid = useMemo(() => Math.floor(Math.random() * 10_000_000), []);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const tryPair = async () => {
    setStatus("pairing");
    const res = await fetch("/api/match", {
      method: "POST",
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
      // start polling to try again every 3s
      pollRef.current = setInterval(async () => {
        const again = await fetch("/api/match", {
          method: "POST",
          body: JSON.stringify({ uid }),
        });
        const result = await again.json();
        if (result.status === "paired" && result.channel) {
          clearInterval(pollRef.current!);
          setStatus("paired");
          router.push(`/call/${result.channel}?uid=${uid}`);
        }
      }, 3000);
    }
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

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
