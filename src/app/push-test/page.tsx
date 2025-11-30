"use client";

import { useState } from "react";

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

export default function PushTestPage() {
  const [status, setStatus] = useState<string>("Idle");

  const handleSubscribe = async () => {
    try {
      setStatus("Requesting notification permission...");

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("Push / ServiceWorker not supported in this browser.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Permission not granted: " + permission);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      console.log("SW ready:", reg.scope);

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) {
          setStatus("NEXT_PUBLIC_VAPID_PUBLIC_KEY missing");
          return;
        }

        setStatus("Creating new subscription...");
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const json = sub.toJSON();
      console.log("Subscription JSON:", json);

      setStatus("Saving subscription to API...");

      const res = await fetch("/api/push/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Test ke liye userId null bhi theek, baad me real userId doge
        body: JSON.stringify({
          userId: null,
          endpoint: sub.endpoint,
          keys: json.keys,
        }),
      });

      const data = await res.json();
      console.log("API response:", data);

      if (!res.ok) {
        setStatus("API error: " + (data.error || "Unknown error"));
      } else {
        setStatus("✅ Subscription saved to Supabase!");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + (err?.message || "Unknown"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
        <h1 className="text-xl font-semibold">Push Test</h1>
        <p className="text-sm text-slate-400">
          This will subscribe this browser to push notifications and save the
          subscription in Supabase (<code>webpush_subscriptions</code>).
        </p>
        <button
          onClick={handleSubscribe}
          className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          Subscribe for Push
        </button>
        <div className="text-xs text-slate-300">
          Status: <span className="font-mono">{status}</span>
        </div>
      </div>
    </div>
  );
}
