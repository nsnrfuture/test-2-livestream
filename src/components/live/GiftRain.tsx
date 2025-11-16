"use client";

import { useEffect, useRef } from "react";
import type { GiftEvent } from "@/types/live";

type Props = {
  feed: GiftEvent[];
};

export default function GiftRain({ feed }: Props) {
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
    boxRef.current.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = `translateY(-120%) rotate(${(Math.random() - 0.5) * 60}deg)`;
      el.style.opacity = "0";
    });

    const timer = setTimeout(() => {
      el.remove();
    }, 2400);
    return () => clearTimeout(timer);
  }, [feed]);

  return <div ref={boxRef} className="pointer-events-none absolute inset-0" />;
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
