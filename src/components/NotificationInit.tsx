"use client";

import { useEffect } from "react";

export default function NotificationInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("✅ SW registered with scope:", reg.scope);
      })
      .catch((err) => {
        console.error("❌ SW register error", err);
      });
  }, []);

  return null;
}
