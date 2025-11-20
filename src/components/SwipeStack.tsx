"use client";
import { useRef, useState } from "react";
import { motion, PanInfo } from "framer-motion";

type Card = { id: string; title: string; subtitle?: string; };

const starterCards: Card[] = [
  { id: "c1", title: "Swipe up to meet a stranger", subtitle: "Instant video chat" },
  { id: "c2", title: "Be kind", subtitle: "No login needed" },
  { id: "c3", title: "Ready?", subtitle: "Allow mic & camera" },
];

export default function SwipeStack({ onSwipeUp }: { onSwipeUp: () => void }) {
  const [cards, setCards] = useState<Card[]>(starterCards);
  const dragging = useRef(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    dragging.current = false;

    if (info.offset.y < -120) {
      // Swiped up
      onSwipeUp();

      // ⏳ 6 second delay before next card
      setTimeout(() => {
        setCards((prev) => prev.slice(1));
      }, 6000);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[420px]">
      {cards.map((card, idx) => {
        const isTop = idx === 0;
        return (
          <motion.div
            key={card.id}
            className="absolute inset-0 rounded-2xl shadow-xl bg-white p-6 flex flex-col items-center justify-center text-center select-none"
            style={{ zIndex: cards.length - idx }}
            drag={isTop ? "y" : false}
            onDragStart={() => { if (isTop) dragging.current = true; }}
            onDragEnd={isTop ? handleDragEnd : undefined}
            dragConstraints={{ top: -160, bottom: 0 }}
            initial={{ y: idx * 10, scale: 1 - idx * 0.03, opacity: 1 - idx * 0.1 }}
            animate={{ y: idx * 10, scale: 1 - idx * 0.03, opacity: 1 - idx * 0.1 }}
            whileDrag={{ rotate: -2 }}
          >
            <h3 className="text-xl font-semibold">{card.title}</h3>
            {card.subtitle && <p className="text-gray-500 mt-2">{card.subtitle}</p>}
            {isTop && (
              <div className="absolute bottom-4 left-0 right-0 text-gray-400 text-sm">
                Swipe up ↑
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
