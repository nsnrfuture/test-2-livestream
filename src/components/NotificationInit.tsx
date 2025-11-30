// app/_components/NotificationInit.tsx
"use client";
import { useEffect } from "react";

export default function NotificationInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("✅ SW registered"))
      .catch(console.error);
  }, []);

  return null;
}
