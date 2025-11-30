"use client";

import { useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export default function PushSubscriber({ userId }: { userId: string | null }) {
  useEffect(() => {
    if (!userId) {
      console.log("⏭ No userId, skip subscription");
      return;
    }
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("❌ Push / SW not supported");
      return;
    }

    const subscribe = async () => {
      console.log("🔔 Starting push subscription for user:", userId);

      const permission = await Notification.requestPermission();
      console.log("🔔 Notification permission:", permission);

      if (permission !== "granted") {
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      console.log("🧾 SW ready for push:", reg.scope);

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        console.log("ℹ️ Already have a subscription:", existing.endpoint);
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        console.error("❌ Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = sub.toJSON();
      console.log("✅ New push subscription:", json);

      const res = await fetch("/api/push/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          endpoint: sub.endpoint,
          keys: json.keys,
        }),
      });

      const data = await res.json();
      console.log("📦 Save subscription response:", data);
    };

    subscribe().catch((err) => {
      console.error("❌ Subscription error:", err);
    });
  }, [userId]);

  return null;
}
